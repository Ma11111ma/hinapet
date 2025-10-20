# backend/app/schemas/family.py
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class FamilyMemberItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    relation: Optional[str] = None
    contact: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class FamilyMemberCreate(BaseModel):
    name: str
    relation: Optional[str] = None
    contact: Optional[str] = None

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relation: Optional[str] = None
    contact: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class FamilyMemberListResponse(BaseModel):
    items: List[FamilyMemberItem]

class FamilyCheckinItem(BaseModel):
    id: str
    member_id: str
    status: str
    message: Optional[str] = None
    reported_at: Optional[str] = None
    reported_by_user_id: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class FamilyCheckinCreate(BaseModel):
    member_id: str
    status: str
    message: Optional[str] = None

class FamilyCheckinLatestResponse(FamilyCheckinItem):
    pass
