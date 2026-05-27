from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List

from app.core.database import (
    get_supabase,
    select_many_by_owner,
    update_by_owner,
)
from app.core.security import get_current_user, TokenPayload
from app.schemas.notifications import Notification

router = APIRouter()


@router.get("/", response_model=List[Notification])
def read_notifications(
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Retrieve all notifications belonging to the current user.
    """
    # Order by created_at desc to get newest first
    response = (
        supabase.table("notifications")
        .select("*")
        .eq("owner_user_id", current_user.sub)
        .order("created_at", desc=True)
        .execute()
    )
    data = getattr(response, "data", [])
    return data if isinstance(data, list) else []


@router.patch("/read_all", response_model=List[Notification])
def mark_all_as_read(
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Mark all unread notifications as read for the current user.
    """
    try:
        response = (
            supabase.table("notifications")
            .update({"is_read": True})
            .eq("owner_user_id", current_user.sub)
            .eq("is_read", False)
            .execute()
        )
        # Fetch updated notifications
        return read_notifications(current_user=current_user, supabase=supabase)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to update notifications: {exc}")
