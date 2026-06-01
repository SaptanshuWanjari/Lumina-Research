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
from orchestrator.core.errors import NonRetryableError
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


def _format_error(exc: Exception) -> str:
    # NonRetryableError messages are already human-readable.
    if isinstance(exc, NonRetryableError):
        return str(exc)

    msg = str(exc)
    msg_lower = msg.lower()
    
    # 429 Rate limits / Quota
    if "429" in msg_lower or "rate limit" in msg_lower or "quota" in msg_lower or "too many requests" in msg_lower:
        if "quota" in msg_lower or "insufficient_quota" in msg_lower:
            return "Your AI provider account has run out of quota or credits. Please check your billing dashboard and add funds if necessary."
        return "The AI provider is currently rate limiting our requests. Please wait a few moments and try again."
        
    # 401 / 403 API Key issues
    if "401" in msg_lower or "403" in msg_lower or "api key" in msg_lower or "unauthorized" in msg_lower:
        return "The provided API key is invalid or lacks the necessary permissions. Please update your AI settings with a valid key."
        
    # 500 / 503 Provider issues
    if "500" in msg_lower or "503" in msg_lower or "internal server error" in msg_lower or "service unavailable" in msg_lower:
        return "The AI provider's servers are currently experiencing issues or are overloaded. Please try again later."
        
    return f"An unexpected error occurred: {msg}"


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
    except NonRetryableError as exc:
        failed_step = _current_step(store, run_id, owner_user_id, "deep_research")
        error_msg = str(exc)
        store.fail_step(run_id, owner_user_id, failed_step, error_msg)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "error_message": error_msg,
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
            },
        )
        return {"run_id": run_id, "status": "failed", "error": error_msg}
    except Exception as exc:
        failed_step = _current_step(store, run_id, owner_user_id, "deep_research")
        error_msg = _format_error(exc)
        store.fail_step(run_id, owner_user_id, failed_step, error_msg)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "error_message": error_msg,
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
    except NonRetryableError as exc:
        failed_step = _current_step(store, run_id, owner_user_id, entry_point)
        error_msg = str(exc)
        store.fail_step(run_id, owner_user_id, failed_step, error_msg)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "current_step": entry_point,
                "error_message": error_msg,
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
            },
        )
        return {"run_id": run_id, "status": "failed", "error": error_msg}
    except Exception as exc:
        failed_step = _current_step(store, run_id, owner_user_id, entry_point)
        error_msg = _format_error(exc)
        store.fail_step(run_id, owner_user_id, failed_step, error_msg)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "current_step": entry_point,
                "error_message": error_msg,
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
    except NonRetryableError as exc:
        failed_step = _current_step(store, run_id, owner_user_id, "publish")
        error_msg = str(exc)
        store.fail_step(run_id, owner_user_id, failed_step, error_msg)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "error_message": error_msg,
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
            },
        )
        return {"run_id": run_id, "status": "failed", "error": error_msg}
    except Exception as exc:
        failed_step = _current_step(store, run_id, owner_user_id, "publish")
        error_msg = _format_error(exc)
        store.fail_step(run_id, owner_user_id, failed_step, error_msg)
        store.update_run(
            run_id,
            owner_user_id,
            {
                "status": "failed",
                "needs_review": False,
                "error_message": error_msg,
                "checkpoint_ref": run_id,
                "checkpoint_at": utcnow_iso(),
            },
        )
        raise
