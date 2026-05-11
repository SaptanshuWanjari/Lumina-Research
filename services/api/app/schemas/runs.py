from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class Run(BaseModel):
    id: str
    case_id: str
    owner_user_id: str
    status: str
    current_step: Optional[str] = None
    needs_review: Optional[bool] = None
    checkpoint_ref: Optional[str] = None
    checkpoint_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    approved_by_user_id: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
