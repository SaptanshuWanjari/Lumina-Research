import os
from supabase import create_client, Client
from app.core.config import settings


def get_supabase() -> Client:
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
