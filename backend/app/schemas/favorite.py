from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class FavoriteItem(BaseModel):
    shelter_id: str
    created_at: Optional[str] = None

class FavoriteWithShelter(BaseModel):
    shelter_id: str
    name: str
    address: Optional[str] = None
    type: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class FavoriteListResponse(BaseModel):
    items: List[FavoriteItem]

class FavoriteListWithShelterResponse(BaseModel):
    items: List[FavoriteWithShelter]

FavoriteItem.model_config = ConfigDict(from_attributes=True)
FavoriteWithShelter.model_config = ConfigDict(from_attributes=True)
FavoriteListResponse.model_config = ConfigDict(from_attributes=True)
FavoriteListWithShelterResponse.model_config = ConfigDict(from_attributes=True)
