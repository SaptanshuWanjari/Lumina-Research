from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class CaseBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    settings: dict = Field(default_factory=dict)


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    settings: Optional[dict] = None


class Case(CaseBase):
    id: str
    owner_user_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
