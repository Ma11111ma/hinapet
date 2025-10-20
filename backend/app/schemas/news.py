# backend/app/schemas/news.py
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class NewsItem(BaseModel):
    id: str
    title: str
    body: str
    level: str
    area: Optional[str] = None
    source_url: Optional[str] = None
    published_at: Optional[str] = None
    expires_at: Optional[str] = None
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class NewsListResponse(BaseModel):
    items: List[NewsItem]
