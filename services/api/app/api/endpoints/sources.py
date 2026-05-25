import hashlib
from datetime import datetime, timezone
from uuid import uuid4
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    UploadFile,
    File,
    Form,
    status,
)
from supabase import Client
from pydantic import ValidationError

from app.core.database import (
    ensure_case_owner,
    get_supabase,
    insert_row,
    select_many_by_owner_and_case,
    select_one_by_owner_and_case,
    update_by_owner,
)
from app.core.security import get_current_user, TokenPayload
from app.schemas.sources import Source, SourceCreate
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
    request: Request,
    file: UploadFile | None = File(default=None),
    source_type: str | None = Form(default=None),
    title: str | None = Form(default=None),
    url: str | None = Form(default=None),
    note_text: str | None = Form(default=None),
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    if not ensure_case_owner(supabase, case_id, current_user.sub):
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    source_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    insert_data = {
        "id": source_id,
        "case_id": case_id,
        "owner_user_id": current_user.sub,
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }

    content_type = request.headers.get("content-type", "")

    if file is not None:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

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

        insert_data.update(
            {
                "source_type": "file",
                "title": title or file.filename,
                "storage_path": storage_path,
                "content_hash": content_hash,
                "metadata_json": {
                    "filename": file.filename,
                    "mime_type": file.content_type,
                    "byte_size": len(content),
                },
            }
        )
    elif "application/json" in content_type:
        try:
            body = await request.json()
            payload = SourceCreate.model_validate(body)
        except ValidationError as exc:
            raise HTTPException(status_code=400, detail=exc.errors()) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid JSON body") from exc

        content_for_hash = payload.url if payload.source_type in ("url", "n8n") else payload.note_text
        insert_data.update(
            {
                "source_type": payload.source_type,
                "title": payload.title,
                "url": payload.url,
                "note_text": payload.note_text,
                "content_hash": hashlib.sha256(
                    (content_for_hash or "").encode("utf-8")
                ).hexdigest(),
                "metadata_json": {},
            }
        )
    else:
        try:
            payload = SourceCreate(
                source_type=source_type or "",
                title=title,
                url=url,
                note_text=note_text,
            )
        except ValidationError as exc:
            raise HTTPException(status_code=400, detail=exc.errors()) from exc

        content_for_hash = payload.url if payload.source_type in ("url", "n8n") else payload.note_text
        insert_data.update(
            {
                "source_type": payload.source_type,
                "title": payload.title,
                "url": payload.url,
                "note_text": payload.note_text,
                "content_hash": hashlib.sha256(
                    (content_for_hash or "").encode("utf-8")
                ).hexdigest(),
                "metadata_json": {},
            }
        )

    try:
        record = insert_row(supabase, "sources", insert_data)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create source record: {exc}",
        ) from exc

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
        raise HTTPException(
            status_code=500,
            detail=f"Failed to enqueue ingestion task: {exc}",
        ) from exc

    return record
