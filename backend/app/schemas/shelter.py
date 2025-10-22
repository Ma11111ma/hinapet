from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from enum import Enum

class CrowdLevel(str, Enum):
    empty = "empty"
    few = "few"
    full = "full"

class ShelterItem(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    type: str
    capacity: int
    crowd_level: Optional[str] = None   # ← これだけにする（重複定義を削除）
    lat: float
    lng: float
    # Enum を値で出す
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class ShelterListResponse(BaseModel):
    items: List[ShelterItem]
