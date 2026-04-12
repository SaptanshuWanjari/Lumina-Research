from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List

from app.core.database import get_supabase
from app.core.security import get_current_user, TokenPayload
from app.models.case import Case, CaseCreate, CaseUpdate

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
    data = case_in.model_dump()
    data["owner_user_id"] = current_user.sub

    response = supabase.table("cases").insert(data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create case")

    return response.data[0]


@router.get("/", response_model=List[Case])
def read_cases(
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Retrieve all cases belonging to the current user.
    """
    response = (
        supabase.table("cases")
        .select("*")
        .eq("owner_user_id", current_user.sub)
        .execute()
    )
    return response.data


@router.get("/{case_id}", response_model=Case)
def read_case(
    case_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """
    Retrieve a specific case by ID, ensuring the user owns it.
    """
    response = (
        supabase.table("cases")
        .select("*")
        .eq("id", case_id)
        .eq("owner_user_id", current_user.sub)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    return response.data[0]


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
    existing = (
        supabase.table("cases")
        .select("id")
        .eq("id", case_id)
        .eq("owner_user_id", current_user.sub)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    update_data = case_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    response = (
        supabase.table("cases")
        .update(update_data)
        .eq("id", case_id)
        .eq("owner_user_id", current_user.sub)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update case")

    return response.data[0]


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
    existing = (
        supabase.table("cases")
        .select("id")
        .eq("id", case_id)
        .eq("owner_user_id", current_user.sub)
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Case not found or access denied")

    response = (
        supabase.table("cases")
        .delete()
        .eq("id", case_id)
        .eq("owner_user_id", current_user.sub)
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to delete case")

    return None
