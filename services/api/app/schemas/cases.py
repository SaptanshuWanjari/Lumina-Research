from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CaseBase(BaseModel):
    title: str = Field(..., max_length=255)
    question: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    tags: List[str] = Field(default_factory=list)


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    question: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[int] = None
    tags: Optional[List[str]] = None


class Case(CaseBase):
    id: str
    owner_user_id: str
    status: str
    priority: int
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
