from __future__ import annotations

from typing import Any

from supabase import Client


def download_source_file(client: Client, bucket: str, storage_path: str) -> bytes:
    payload: Any = client.storage.from_(bucket).download(storage_path)
    if isinstance(payload, bytes):
        return payload
    if isinstance(payload, bytearray):
        return bytes(payload)
    if hasattr(payload, "read"):
        data = payload.read()
        return data if isinstance(data, bytes) else bytes(data)
    raise RuntimeError("Supabase Storage download did not return bytes")
