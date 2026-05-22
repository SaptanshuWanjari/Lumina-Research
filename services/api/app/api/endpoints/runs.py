from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core.database import (
    ensure_case_owner,
    get_supabase,
    insert_row,
    select_many_by_owner_and_case,
    select_one_by_owner,
    select_one_by_owner_and_case,
    update_by_owner,
)
from app.core.security import TokenPayload, get_current_user
from app.schemas.runs import Run, RunCreate
from app.services.queue import enqueue_resume, enqueue_retry, enqueue_run

router = APIRouter()


@router.get("/cases/{case_id}/runs", response_model=list[Run])
def list_runs(
    case_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    if not ensure_case_owner(supabase, case_id, current_user.sub):
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    return select_many_by_owner_and_case(supabase, "runs", case_id, current_user.sub)


@router.post(
    "/cases/{case_id}/runs", response_model=Run, status_code=status.HTTP_201_CREATED
)
def create_run(
    case_id: str,
    run_in: RunCreate | None = None,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    if not ensure_case_owner(supabase, case_id, current_user.sub):
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    run_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    run_config = (run_in or RunCreate()).model_dump()
    insert_data = {
        "id": run_id,
        "case_id": case_id,
        "owner_user_id": current_user.sub,
        "status": "queued",
        "needs_review": False,
        "triggered_by_user_id": current_user.sub,
        "run_config": run_config,
        "created_at": now,
        "updated_at": now,
        "started_at": now,
    }

    try:
        record = insert_row(supabase, "runs", insert_data)
    except RuntimeError:
        raise HTTPException(status_code=500, detail="Failed to create run")

    try:
        enqueue_run(run_id)
    except Exception as exc:
        update_by_owner(
            supabase,
            "runs",
            run_id,
            current_user.sub,
            {"status": "failed", "error_message": f"enqueue_failed: {exc}"},
        )
        raise HTTPException(status_code=500, detail="Failed to enqueue run task")

    return record


@router.get("/cases/{case_id}/runs/{run_id}", response_model=Run)
def read_run(
    case_id: str,
    run_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    record = select_one_by_owner_and_case(
        supabase, "runs", run_id, case_id, current_user.sub
    )
    if not record:
        raise HTTPException(status_code=404, detail="Run not found or access denied")

    return record


@router.post("/runs/{run_id}/approve", response_model=Run)
def approve_run(
    run_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    existing = select_one_by_owner(supabase, "runs", run_id, current_user.sub)
    if not existing:
        raise HTTPException(status_code=404, detail="Run not found or access denied")

    now = datetime.now(timezone.utc).isoformat()
    update = {
        "status": "resuming",
        "needs_review": False,
        "approved_by_user_id": current_user.sub,
        "approved_at": now,
    }

    try:
        record = update_by_owner(supabase, "runs", run_id, current_user.sub, update)
    except RuntimeError:
        raise HTTPException(status_code=500, detail="Failed to approve run")

    try:
        enqueue_resume(run_id)
    except Exception as exc:
        update_by_owner(
            supabase,
            "runs",
            run_id,
            current_user.sub,
            {"status": "failed", "error_message": f"enqueue_failed: {exc}"},
        )
        raise HTTPException(status_code=500, detail="Failed to enqueue resume task")

    return record


@router.post("/runs/{run_id}/retry", response_model=Run)
def retry_run(
    run_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    existing = select_one_by_owner(supabase, "runs", run_id, current_user.sub)
    if not existing:
        raise HTTPException(status_code=404, detail="Run not found or access denied")
    if existing.get("status") != "failed":
        raise HTTPException(status_code=409, detail="Only failed runs can be retried")

    update = {
        "status": "queued",
        "needs_review": False,
        "error_message": None,
    }

    try:
        record = update_by_owner(supabase, "runs", run_id, current_user.sub, update)
    except RuntimeError:
        raise HTTPException(status_code=500, detail="Failed to queue retry")

    try:
        enqueue_retry(run_id)
    except Exception as exc:
        update_by_owner(
            supabase,
            "runs",
            run_id,
            current_user.sub,
            {"status": "failed", "error_message": f"enqueue_failed: {exc}"},
        )
        raise HTTPException(status_code=500, detail="Failed to enqueue retry task")

    return record
