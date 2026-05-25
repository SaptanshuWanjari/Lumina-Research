from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class SourceCreate(BaseModel):
    source_type: str = Field(..., pattern="^(file|url|note|n8n)$")
    title: Optional[str] = None
    url: Optional[str] = None
    note_text: Optional[str] = None

    @model_validator(mode="after")
    def validate_payload(self):
        if self.source_type in ("url", "n8n") and not self.url:
            raise ValueError(f"url is required for {self.source_type} sources")
        if self.source_type == "note" and not self.note_text:
            raise ValueError("note_text is required for note sources")
        return self


class Source(BaseModel):
    id: str
    case_id: str
    owner_user_id: str
    source_type: str
    title: Optional[str] = None
    url: Optional[str] = None
    storage_path: Optional[str] = None
    note_text: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    content_hash: Optional[str] = None
    metadata_json: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
