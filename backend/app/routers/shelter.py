from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.crud.shelter import get_shelters, get_shelter_by_id
from app.schemas.shelter import ShelterItem, ShelterListResponse

router = APIRouter(prefix="/shelters", tags=["shelters"])  # URLは複数、ファイルは単数で統一


def get_db() -> Session:
    """SQLAlchemy Session の依存解決（各リクエストでクローズ）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=ShelterListResponse)
def list_shelters(
    db: Session = Depends(get_db),
    type: Optional[Literal["companion", "accompany"]] = Query(
        None, description="避難種別（同行=companion / 同伴=accompany）"
    ),
    lat: float | None = Query(None, description="中心緯度（例: 35.333）", ge=-90, le=90),
    lng: float | None = Query(None, description="中心経度（例: 139.475）", ge=-180, le=180),
    radius: float = Query(5.0, ge=0, le=50, description="半径 km（0〜50）"),
    q: str | None = Query(None, description="名称/住所の部分一致キーワード"),
    limit: int = Query(50, ge=1, le=200, description="件数上限"),
    offset: int = Query(0, ge=0, description="開始位置"),
) -> ShelterListResponse:
    """
    避難所一覧：
      - type で種別フィルタ
      - q で名称/住所の部分一致
      - lat/lng/radius で半径内検索（指定時は「距離の近い順」）
    """
    items = get_shelters(
        db=db,
        type=type,
        lat=lat,
        lng=lng,
        radius_km=radius,
        q=q,
        limit=limit,
        offset=offset,
    )
    return ShelterListResponse(items=items)


@router.get("/{shelter_id}", response_model=ShelterItem)
def shelter_detail(shelter_id: str, db: Session = Depends(get_db)) -> ShelterItem:
    """避難所詳細（404 は暫定エラー形式で返却）"""
    item = get_shelter_by_id(db, shelter_id)
    if not item:
        return JSONResponse(
            status_code=404,
            content={"error": "NotFound", "detail": "避難所が存在しません"},
        )
    return item
