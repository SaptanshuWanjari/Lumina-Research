from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List
from uuid import uuid4
from datetime import datetime, timezone

from app.core.database import (
    delete_by_owner,
    ensure_case_owner,
    ensure_profile_exists,
    get_supabase,
    insert_row,
    select_many_by_owner,
    select_one_by_owner,
    update_by_owner,
)
from app.core.security import get_current_user, TokenPayload
from app.schemas.cases import Case, CaseCreate, CaseUpdate

router = APIRouter()


@router.post("/", response_model=Case, status_code=status.HTTP_201_CREATED)
def create_case(
    case_in: CaseCreate,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Create a new case for the current user.
    """
    data = case_in.model_dump(exclude_none=True)
    now = datetime.now(timezone.utc).isoformat()
    data["id"] = str(uuid4())
    data["owner_user_id"] = current_user.sub
    data["created_at"] = now
    data["updated_at"] = now

    try:
        ensure_profile_exists(supabase, current_user.sub)
        return insert_row(supabase, "cases", data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create case: {exc}")


@router.get("/", response_model=List[Case])
def read_cases(
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Retrieve all cases belonging to the current user.
    """
    return select_many_by_owner(supabase, "cases", current_user.sub)


@router.get("/{case_id}", response_model=Case)
def read_case(
    case_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Retrieve a specific case by ID, ensuring the user owns it.
    """
    record = select_one_by_owner(supabase, "cases", case_id, current_user.sub)
    if not record:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    return record


@router.patch("/{case_id}", response_model=Case)
def update_case(
    case_id: str,
    case_in: CaseUpdate,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Update a case, ensuring the user owns it.
    """
    # First ensure it exists and belongs to user
    if not ensure_case_owner(supabase, case_id, current_user.sub):
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    update_data = case_in.model_dump(exclude_unset=True, exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    try:
        return update_by_owner(
            supabase, "cases", case_id, current_user.sub, update_data
        )
    except RuntimeError:
        raise HTTPException(status_code=500, detail="Failed to update case")


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(
    case_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Delete a case, ensuring the user owns it.
    """
    # Verify ownership before deletion
    if not ensure_case_owner(supabase, case_id, current_user.sub):
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    if not delete_by_owner(supabase, "cases", case_id, current_user.sub):
        raise HTTPException(status_code=500, detail="Failed to delete case")

    return None
