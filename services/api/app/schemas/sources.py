from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class Source(BaseModel):
    id: str
    case_id: str
    owner_user_id: str
    source_type: str
    url: Optional[str] = None
    storage_path: Optional[str] = None
    note_text: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    content_hash: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
