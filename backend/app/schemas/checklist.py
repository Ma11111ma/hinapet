# backend/app/schemas/checklist.py
from __future__ import annotations
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict

class ChecklistItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    items_json: Any
    updated_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ChecklistCreate(BaseModel):
    title: str
    items_json: Any

class ChecklistUpdate(BaseModel):
    title: Optional[str] = None
    items_json: Optional[Any] = None
    model_config = ConfigDict(extra="ignore")

class ChecklistItemsPatch(BaseModel):
    items_json: Any

class ChecklistListResponse(BaseModel):
    items: List[ChecklistItem]
