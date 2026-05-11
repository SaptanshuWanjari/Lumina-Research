import os
from typing import Optional
from supabase import Client


def sanitize_filename(filename: str) -> str:
    if not filename:
        return "upload.bin"
    name = filename.strip().replace(" ", "_")
    safe = "".join(ch if ch.isalnum() or ch in {"_", ".", "-"} else "_" for ch in name)
    return safe or "upload.bin"


def build_source_storage_path(case_id: str, source_id: str, filename: str) -> str:
    safe_name = sanitize_filename(filename)
    return f"cases/{case_id}/sources/{source_id}/{safe_name}"


def upload_source_file(
    supabase: Client,
    bucket: str,
    storage_path: str,
    content: bytes,
    content_type: Optional[str],
) -> None:
    options = {
        "content-type": content_type or "application/octet-stream",
        "upsert": True,
    }
    result = supabase.storage.from_(bucket).upload(
        storage_path, content, file_options=options
    )
    if getattr(result, "error", None):
        raise RuntimeError(result.error)
