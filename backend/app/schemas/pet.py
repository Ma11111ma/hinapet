from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class PetItem(BaseModel):
    id: str
    name: str
    species: str
    vaccinated: Optional[bool] = False
    memo: Optional[str] = None
    certificate_image_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    # ← 追加
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class PetCreate(BaseModel):
    name: str = Field(..., min_length=1)
    species: str  # dog|cat|other
    vaccinated: Optional[bool] = False
    memo: Optional[str] = None
    certificate_image_url: Optional[str] = None

class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    vaccinated: Optional[bool] = None
    memo: Optional[str] = None
    certificate_image_url: Optional[str] = None
    model_config = ConfigDict(extra="ignore")

class PetListResponse(BaseModel):
    items: List[PetItem]
