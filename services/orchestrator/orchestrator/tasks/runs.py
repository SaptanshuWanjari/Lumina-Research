from __future__ import annotations

from datetime import datetime, timezone

from langgraph.types import Command

from orchestrator.core.celery_app import celery_app
from orchestrator.core.database import (
    SupabaseRunStore,
    bootstrap_run,
    get_supabase,
    utcnow_iso,
)
from orchestrator.graph.build import build_graph
from orchestrator.services.checkpointer import postgres_checkpointer


def _duration_ms(started_at: str | None) -> int | None:
    if not started_at:
        return None
    try:
        start = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
    except ValueError:
        return None
    return int((datetime.now(timezone.utc) - start).total_seconds() * 1000)


@celery_app.task(name="orchestrator.tasks.runs.start_run", bind=True)
def start_run(self, run_id: str) -> dict[str, str]:
    client = get_supabase()
    run = bootstrap_run(client, run_id)
    owner_user_id = run["owner_user_id"]
    case_id = run["case_id"]
    store = SupabaseRunStore(client)

    try:
        case = store.get_case(case_id, owner_user_id)
        state = {
            "run_id": run_id,
            "case_id": case_id,
            "owner_user_id": owner_user_id,
            "question": case.get("question") or case.get("title") or "",
        }
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "running",
                "needs_review": False,
                "current_step": "planner",
                "started_at": run.get("started_at") or utcnow_iso(),
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
                "error_message": None,
            },
        )
        with postgres_checkpointer() as checkpointer:
            graph = build_graph(checkpointer)
            graph.invoke(state, config={"configurable": {"thread_id": run_id}})
        return {"run_id": run_id, "status": "needs_review"}
    except Exception as exc:
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


@celery_app.task(name="orchestrator.tasks.runs.resume_run", bind=True)
def resume_run(self, run_id: str) -> dict[str, str]:
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
