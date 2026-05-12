from functools import lru_cache
from typing import Any, Dict, Iterable, List, Optional

from supabase import Client, create_client

from app.core.config import settings


@lru_cache(maxsize=1)
def _supabase_client() -> Client:
    """
    Returns a configured Supabase client using the Service Role Key.

    CRITICAL SECURITY WARNING:
    This client bypasses Row Level Security (RLS).
    You MUST manually enforce `owner_user_id` filtering on EVERY single query.

    Example:
    ```python
    supabase.table("cases").select("*").eq("owner_user_id", user_id).execute()
    ```
    """

    # In production/deployment, ensure these are securely loaded.
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_SERVICE_ROLE_KEY

    # If key is missing during local dev, we might fail hard, so handle gracefully if testing.
    if not key:
        print(
            "WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Database operations will fail."
        )

    return create_client(url, key)


def get_supabase() -> Client:
    return _supabase_client()


def _response_data(response: Any) -> List[Dict[str, Any]]:
    data = getattr(response, "data", None)
    return data if isinstance(data, list) else []


def ensure_case_owner(supabase: Client, case_id: str, owner_user_id: str) -> bool:
    response = (
        supabase.table("cases")
        .select("id")
        .eq("id", case_id)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    return bool(_response_data(response))


def select_many_by_owner(
    supabase: Client, table: str, owner_user_id: str
) -> List[Dict[str, Any]]:
    response = (
        supabase.table(table).select("*").eq("owner_user_id", owner_user_id).execute()
    )
    return _response_data(response)


def select_many_by_owner_and_case(
    supabase: Client, table: str, case_id: str, owner_user_id: str
) -> List[Dict[str, Any]]:
    response = (
        supabase.table(table)
        .select("*")
        .eq("case_id", case_id)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    return _response_data(response)


def select_one_by_owner(
    supabase: Client,
    table: str,
    id_value: str,
    owner_user_id: str,
    id_field: str = "id",
) -> Optional[Dict[str, Any]]:
    response = (
        supabase.table(table)
        .select("*")
        .eq(id_field, id_value)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    data = _response_data(response)
    return data[0] if data else None


def select_one_by_owner_and_case(
    supabase: Client,
    table: str,
    id_value: str,
    case_id: str,
    owner_user_id: str,
    id_field: str = "id",
) -> Optional[Dict[str, Any]]:
    response = (
        supabase.table(table)
        .select("*")
        .eq(id_field, id_value)
        .eq("case_id", case_id)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    data = _response_data(response)
    return data[0] if data else None


def insert_row(supabase: Client, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    response = supabase.table(table).insert(data).execute()
    rows = _response_data(response)
    if rows:
        return rows[0]

    row_id = data.get("id")
    if row_id:
        query = supabase.table(table).select("*").eq("id", row_id)
        owner_user_id = data.get("owner_user_id")
        if owner_user_id:
            query = query.eq("owner_user_id", owner_user_id)
        fallback_rows = _response_data(query.execute())
        if fallback_rows:
            return fallback_rows[0]

    raise RuntimeError(f"Failed to insert row into {table}")


def update_by_owner(
    supabase: Client,
    table: str,
    id_value: str,
    owner_user_id: str,
    data: Dict[str, Any],
    id_field: str = "id",
) -> Dict[str, Any]:
    response = (
        supabase.table(table)
        .update(data)
        .eq(id_field, id_value)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    rows = _response_data(response)
    if rows:
        return rows[0]

    fallback_rows = _response_data(
        supabase.table(table)
        .select("*")
        .eq(id_field, id_value)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    if fallback_rows:
        return fallback_rows[0]

    raise RuntimeError(f"Failed to update row in {table}")


def delete_by_owner(
    supabase: Client,
    table: str,
    id_value: str,
    owner_user_id: str,
    id_field: str = "id",
) -> bool:
    existing = _response_data(
        supabase.table(table)
        .select(id_field)
        .eq(id_field, id_value)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    if not existing:
        return False

    response = (
        supabase.table(table)
        .delete()
        .eq(id_field, id_value)
        .eq("owner_user_id", owner_user_id)
        .execute()
    )
    _response_data(response)
    return True
