from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ShelterItem(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    type: str
    capacity: int
    lat: float
    lng: float

    # Pydantic v2: 旧 orm_mode → from_attributes
    model_config = ConfigDict(from_attributes=True)


class ShelterListResponse(BaseModel):
    items: List[ShelterItem]
