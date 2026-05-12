from __future__ import annotations

from datetime import datetime, timezone
from functools import lru_cache
from typing import Any

from supabase import Client, create_client

from app.core.config import settings


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is required")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def response_rows(response: Any) -> list[dict[str, Any]]:
    data = getattr(response, "data", None)
    return data if isinstance(data, list) else []


def response_one(response: Any) -> dict[str, Any] | None:
    rows = response_rows(response)
    return rows[0] if rows else None


def update_owned(
    client: Client, table: str, row_id: str, owner_user_id: str, values: dict[str, Any]
) -> dict[str, Any]:
    row = response_one(
        client.table(table)
        .update({**values, "updated_at": utcnow_iso()})
        .eq("id", row_id)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    if not row:
        raise RuntimeError(f"{table} update failed")
    return row
