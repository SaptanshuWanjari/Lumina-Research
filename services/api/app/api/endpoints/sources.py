import hashlib
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from supabase import Client

from app.core.database import (
    ensure_case_owner,
    get_supabase,
    insert_row,
    select_many_by_owner_and_case,
    select_one_by_owner_and_case,
    update_by_owner,
)
from app.core.security import get_current_user, TokenPayload
from app.schemas.sources import Source
from app.services.queue import enqueue_ingestion
from app.services.storage import build_source_storage_path, upload_source_file
from app.core.config import settings


router = APIRouter()


@router.get("/cases/{case_id}/sources", response_model=list[Source])
def list_sources(
    case_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    if not ensure_case_owner(supabase, case_id, current_user.sub):
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    return select_many_by_owner_and_case(supabase, "sources", case_id, current_user.sub)


@router.get("/cases/{case_id}/sources/{source_id}", response_model=Source)
def read_source(
    case_id: str,
    source_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    record = select_one_by_owner_and_case(
        supabase, "sources", source_id, case_id, current_user.sub
    )
    if not record:
        raise HTTPException(status_code=404, detail="Source not found or access denied")

    return record


@router.post(
    "/cases/{case_id}/sources",
    response_model=Source,
    status_code=status.HTTP_201_CREATED,
)
async def create_source(
    case_id: str,
    file: UploadFile = File(...),
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    if not ensure_case_owner(supabase, case_id, current_user.sub):
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    source_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    storage_path = build_source_storage_path(case_id, source_id, file.filename or "")
    content_hash = hashlib.sha256(content).hexdigest()

    try:
        upload_source_file(
            supabase,
            settings.SUPABASE_STORAGE_BUCKET,
            storage_path,
            content,
            file.content_type,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {exc}")

    insert_data = {
        "id": source_id,
        "case_id": case_id,
        "owner_user_id": current_user.sub,
        "source_type": "file",
        "storage_path": storage_path,
        "status": "pending",
        "content_hash": content_hash,
        "created_at": now,
        "updated_at": now,
        "metadata_json": {
            "filename": file.filename,
            "mime_type": file.content_type,
            "byte_size": len(content),
        },
    }

    try:
        record = insert_row(supabase, "sources", insert_data)
    except RuntimeError:
        raise HTTPException(status_code=500, detail="Failed to create source record")

    try:
        enqueue_ingestion(source_id)
    except Exception as exc:
        update_by_owner(
            supabase,
            "sources",
            source_id,
            current_user.sub,
            {"status": "failed", "error_message": f"enqueue_failed: {exc}"},
        )
        raise HTTPException(status_code=500, detail="Failed to enqueue ingestion task")

    return record
