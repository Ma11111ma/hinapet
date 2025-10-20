from __future__ import annotations

from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.crud.shelter import get_shelters, get_shelter_by_id
from app.schemas.shelter import ShelterItem, ShelterListResponse
from app.core.errors import ErrorResponse  # 共通エラー応答

router = APIRouter(prefix="/shelters", tags=["shelters"])


@router.get(
    "",
    response_model=ShelterListResponse,
    summary="避難所一覧を取得",
    responses={
        422: {"description": "Validation error", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def list_shelters(
    db: Session = Depends(get_db),
    type: Optional[Literal["companion", "accompany"]] = Query(None, description="避難種別"),
    crowd_level: Optional[Literal["low", "medium", "high"]] = Query(
        None, description="混雑度（未確定なら Optional[str] に変更可）"
    ),
    lat: float | None = Query(None, ge=-90, le=90),
    lng: float | None = Query(None, ge=-180, le=180),
    radius: float = Query(5.0, ge=0, le=50),
    q: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> ShelterListResponse:
    """避難所一覧を取得するエンドポイント"""
    items = get_shelters(
        db=db,
        type=type,
        crowd_level=crowd_level,
        lat=lat,
        lng=lng,
        radius_km=radius,
        q=q,
        limit=limit,
        offset=offset,
    )
    return ShelterListResponse(items=items)


@router.get(
    "/{shelter_id}",
    response_model=ShelterItem,
    summary="避難所詳細を取得",
    responses={
        404: {"description": "Shelter not found", "model": ErrorResponse},
        422: {"description": "Validation error", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def shelter_detail(shelter_id: str, db: Session = Depends(get_db)) -> ShelterItem:
    """
    避難所詳細を取得。存在しない場合はHTTPException(404)をraise。
    これにより共通エラーハンドラがtrace_id付きでJSON整形する。
    """
    item = get_shelter_by_id(db, shelter_id)
    if not item:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return item

@router.patch(
    "/{shelter_id}/crowd",
    summary= "避難所の混雑度を更新（管理者用）",
    responses={
        200: {"description": "更新に成功しました"},
        400: {"description": "Invalid crowd level", "model": ErrorResponse },
        404: {"description": "Shelterが見つかりません", "model": ErrorResponse },
        500: {"description": "サーバーエラーです", "model": ErrorResponse },
    },
)
def update_crowd_level(
    shelter_id: str,
    level: CrowdLevel,  # ← Enum型で指定
    db: Session = Depends(get_db),
) -> dict:
    """
    管理者が避難所の混雑度を更新するエンドポイント。
    例: PATCH /shelters/1/crowd?level=few
    """
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    shelter.crowd_level = level
    db.commit()
    db.refresh(shelter)
    return{ "id": shelter.id, "crowd_level": shelter.crowd_level}
