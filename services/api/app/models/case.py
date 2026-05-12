from datetime import datetime
from typing import Any, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

CaseStatus = Literal[
    "draft",
    "ingesting",
    "indexed",
    "analyzing",
    "review",
    "published",
    "failed",
    "archived",
]
CasePriority = Literal["low", "normal", "high", "urgent"]

_PRIORITY_INT_MAP: dict[int, CasePriority] = {
    -1: "low",
    0: "normal",
    1: "high",
    2: "urgent",
}


class CaseBase(BaseModel):
    title: str = Field(..., max_length=255)
    question: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[CasePriority | int] = None
    tags: List[str] = Field(default_factory=list)

    @field_validator("priority", mode="before")
    @classmethod
    def normalize_priority(cls, value: Any) -> Any:
        if value is None:
            return value
        if isinstance(value, int):
            mapped = _PRIORITY_INT_MAP.get(value)
            if mapped is None:
                raise ValueError("priority integer must be one of -1, 0, 1, 2")
            return mapped
        return value


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    question: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[CasePriority | int] = None
    tags: Optional[List[str]] = None

    @field_validator("priority", mode="before")
    @classmethod
    def normalize_priority(cls, value: Any) -> Any:
        if value is None:
            return value
        if isinstance(value, int):
            mapped = _PRIORITY_INT_MAP.get(value)
            if mapped is None:
                raise ValueError("priority integer must be one of -1, 0, 1, 2")
            return mapped
        return value


class Case(CaseBase):
    id: str
    owner_user_id: str
    status: CaseStatus
    priority: CasePriority
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    archived_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
