# backend/app/schemas/user.py
from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserMeResponse(BaseModel):
    id: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    plan: str

    model_config = ConfigDict(from_attributes=True)
