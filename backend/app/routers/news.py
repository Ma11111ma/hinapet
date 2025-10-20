# backend/app/routers/news.py
from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user  # ★ 認証を必須化
from app.core.errors import ErrorResponse
from app.models.news import News
from app.schemas.news import NewsItem, NewsListResponse

router = APIRouter(prefix="/news", tags=["news"])

@router.get(
    "",
    response_model=NewsListResponse,
    summary="ニュース一覧（認証必須）",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def list_news(
    area: Optional[str] = Query(None, description="任意：エリアでフィルタ"),
    level: Optional[str] = Query(None, description="info|alert|emergency"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),  # ★ 認証（値は使わなくてもOK）
) -> NewsListResponse:
    """
    認証済みユーザー向けニュース一覧。将来的に current_user に紐づく
    デフォルトエリア等のパーソナライズに拡張しやすい構成。
    """
    q = db.query(News)
    if area:
        q = q.filter(News.area == area)
    if level:
        q = q.filter(News.level == level)
    rows = q.order_by(News.published_at.desc().nullslast(), News.created_at.desc()).all()
    return NewsListResponse(items=[NewsItem.model_validate(r) for r in rows])

@router.get(
    "/{news_id}",
    response_model=NewsItem,
    summary="ニュース詳細（認証必須）",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        404: {"description": "Not Found", "model": ErrorResponse},
    },
)
def get_news(
    news_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),  # ★ 認証
) -> NewsItem:
    n = db.query(News).get(news_id)
    if not n:
        raise HTTPException(status_code=404, detail="News not found")
    return NewsItem.model_validate(n)
