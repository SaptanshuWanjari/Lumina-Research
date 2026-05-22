from __future__ import annotations

from datetime import datetime, timezone

from langgraph.types import Command

from orchestrator.core.celery_app import celery_app
from orchestrator.core.config import configure_langsmith_env
from orchestrator.core.database import (
    SupabaseRunStore,
    bootstrap_run,
    get_supabase,
    utcnow_iso,
)
from orchestrator.graph.build import build_graph
from orchestrator.services.checkpointer import postgres_checkpointer

configure_langsmith_env()
from langsmith import traceable


def _duration_ms(started_at: str | None) -> int | None:
    if not started_at:
        return None
    try:
        start = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
    except ValueError:
        return None
    return int((datetime.now(timezone.utc) - start).total_seconds() * 1000)


def _base_state(
    run_id: str,
    case_id: str,
    owner_user_id: str,
    case: dict[str, object],
    run: dict[str, object],
) -> dict[str, object]:
    return {
        "run_id": run_id,
        "case_id": case_id,
        "owner_user_id": owner_user_id,
        "question": case.get("question") or case.get("title") or "",
        "run_config": run.get("run_config") or {},
    }


def _retry_entry_point(current_step: str | None) -> str:
    if current_step in {"human_review", "publish"}:
        return current_step
    return "deep_research"


def _current_step(store: SupabaseRunStore, run_id: str, owner_user_id: str, fallback: str) -> str:
    try:
        run = store.get_run_for_owner(run_id, owner_user_id)
    except Exception:
        return fallback
    current_step = run.get("current_step")
    return current_step if isinstance(current_step, str) and current_step else fallback


@celery_app.task(name="orchestrator.tasks.runs.start_run", bind=True)
def start_run(self, run_id: str) -> dict[str, str]:
    return _start_run(run_id)


@traceable(name="orchestrator.start_run", run_type="chain")
def _start_run(run_id: str) -> dict[str, str]:
    client = get_supabase()
    run = bootstrap_run(client, run_id)
    owner_user_id = run["owner_user_id"]
    case_id = run["case_id"]
    store = SupabaseRunStore(client)

    try:
        case = store.get_case(case_id, owner_user_id)
        state = _base_state(run_id, case_id, owner_user_id, case, run)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "running",
                "needs_review": False,
                "current_step": "deep_research",
                "started_at": run.get("started_at") or utcnow_iso(),
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
                "error_message": None,
            },
        )
        with postgres_checkpointer() as checkpointer:
            graph = build_graph(checkpointer)
            result = graph.invoke(state, config={"configurable": {"thread_id": run_id}})
        if isinstance(result, dict) and "__interrupt__" not in result:
            completed_at = utcnow_iso()
            store.update_run(
                run_id,
                owner_user_id,
                {
                    "status": "complete",
                    "needs_review": False,
                    "current_step": "complete",
                    "completed_at": completed_at,
                    "duration_ms": _duration_ms(run.get("started_at")),
                    "checkpoint_ref": run_id,
                    "checkpoint_at": completed_at,
                },
            )
            return {"run_id": run_id, "status": "complete"}
        return {"run_id": run_id, "status": "needs_review"}
    except Exception as exc:
        failed_step = _current_step(store, run_id, owner_user_id, "deep_research")
        store.fail_step(run_id, owner_user_id, failed_step, str(exc))
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "error_message": str(exc),
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
            },
        )
        raise


@celery_app.task(name="orchestrator.tasks.runs.retry_run", bind=True)
def retry_run(self, run_id: str) -> dict[str, str]:
    return _retry_run(run_id)


@traceable(name="orchestrator.retry_run", run_type="chain")
def _retry_run(run_id: str) -> dict[str, str]:
    client = get_supabase()
    run = bootstrap_run(client, run_id)
    owner_user_id = run["owner_user_id"]
    case_id = run["case_id"]
    store = SupabaseRunStore(client)
    entry_point = _retry_entry_point(run.get("current_step"))

    try:
        case = store.get_case(case_id, owner_user_id)
        state = _base_state(run_id, case_id, owner_user_id, case, run)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "running",
                "needs_review": False,
                "current_step": entry_point,
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
                "error_message": None,
            },
        )
        with postgres_checkpointer() as checkpointer:
            graph = build_graph(checkpointer, entry_point=entry_point)
            result = graph.invoke(state, config={"configurable": {"thread_id": run_id}})
        if isinstance(result, dict) and "__interrupt__" not in result:
            completed_at = utcnow_iso()
            store.update_run(
                run_id,
                owner_user_id,
                {
                    "status": "complete",
                    "needs_review": False,
                    "current_step": "complete",
                    "completed_at": completed_at,
                    "duration_ms": _duration_ms(run.get("started_at")),
                    "checkpoint_ref": run_id,
                    "checkpoint_at": completed_at,
                },
            )
            return {"run_id": run_id, "status": "complete"}
        return {"run_id": run_id, "status": "needs_review"}
    except Exception as exc:
        failed_step = _current_step(store, run_id, owner_user_id, entry_point)
        store.fail_step(run_id, owner_user_id, failed_step, str(exc))
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "current_step": entry_point,
                "error_message": str(exc),
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
            },
        )
        raise


@celery_app.task(name="orchestrator.tasks.runs.resume_run", bind=True)
def resume_run(self, run_id: str) -> dict[str, str]:
    return _resume_run(run_id)


@traceable(name="orchestrator.resume_run", run_type="chain")
def _resume_run(run_id: str) -> dict[str, str]:
    client = get_supabase()
    run = bootstrap_run(client, run_id)
    owner_user_id = run["owner_user_id"]
    case_id = run["case_id"]
    store = SupabaseRunStore(client)

    try:
        store.get_case(case_id, owner_user_id)
        draft = store.latest_report_version(case_id, run_id, owner_user_id, "draft")
        if not draft:
            raise RuntimeError("No draft report_version found for resume")
        final_report = draft.get("content_markdown") or ""
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "resuming",
                "needs_review": False,
                "current_step": "publish",
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
                "error_message": None,
            },
        )
        with postgres_checkpointer() as checkpointer:
            graph = build_graph(checkpointer)
            graph.invoke(
                Command(
                    resume={
                        "review_status": "approved",
                        "final_report": final_report,
                        "report_version_id": draft.get("id"),
                    }
                ),
                config={"configurable": {"thread_id": run_id}},
            )
        completed_at = utcnow_iso()
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "complete",
                "needs_review": False,
                "current_step": "complete",
                "completed_at": completed_at,
                "duration_ms": _duration_ms(run.get("started_at")),
                "checkpoint_ref": run_id,
                "checkpoint_at": completed_at,
            },
        )
        return {"run_id": run_id, "status": "complete"}
    except Exception as exc:
        failed_step = _current_step(store, run_id, owner_user_id, "publish")
        store.fail_step(run_id, owner_user_id, failed_step, str(exc))
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "error_message": str(exc),
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
            },
        )
        raise
