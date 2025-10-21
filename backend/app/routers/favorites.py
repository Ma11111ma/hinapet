from __future__ import annotations

from typing import Any, Union, Optional
from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.deps import get_current_user, get_db
from app.core.errors import ErrorResponse
from app.schemas.favorite import (
    FavoriteItem,
    FavoriteListResponse,
    FavoriteWithShelter,
    FavoriteListWithShelterResponse,
)
from app.crud.favorite import (
    list_user_favorites,
    list_user_favorites_with_shelter,
    add_favorite,
    delete_favorite,
)

router = APIRouter(prefix="/favorites", tags=["favorites"])


def _extract_user_id(current_user: Any) -> str:
    """
    current_user が dict でもオブジェクトでも動くように安全に ID を取得する。
    優先順: id -> user_id -> firebase_uid -> uid
    """
    if isinstance(current_user, dict):
        cid: Optional[str] = (
            current_user.get("id")
            or current_user.get("user_id")
            or current_user.get("firebase_uid")
            or current_user.get("uid")
        )
        return str(cid) if cid is not None else ""
    # object
    cid = (
        getattr(current_user, "id", None)
        or getattr(current_user, "user_id", None)
        or getattr(current_user, "firebase_uid", None)
        or getattr(current_user, "uid", None)
    )
    return str(cid) if cid is not None else ""


@router.get(
    "",
    response_model=Union[FavoriteListResponse, FavoriteListWithShelterResponse],
    summary="自分のお気に入り一覧を取得",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        422: {"description": "Validation error", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def get_favorites(
    include_shelter: bool = Query(False, description="避難所情報を含める場合は true"),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
):
    """お気に入り一覧を取得。include_shelter=True で避難所情報も含む"""
    user_id = _extract_user_id(current_user)
    if include_shelter:
        items = list_user_favorites_with_shelter(db, user_id)
        return FavoriteListWithShelterResponse(items=[FavoriteWithShelter(**i) for i in items])  # type: ignore
    items = list_user_favorites(db, user_id)
    return FavoriteListResponse(items=[FavoriteItem(**i) for i in items])  # type: ignore


@router.put(
    "/{shelter_id}",
    status_code=status.HTTP_200_OK,
    summary="お気に入りに追加",
    responses={
        400: {"description": "Integrity error", "model": ErrorResponse},
        401: {"description": "Unauthorized", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def put_favorite(
    shelter_id: str = Path(..., description="避難所ID"),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
):
    print("✅ PUT /favorites called")
    print("current_user =", current_user)
    print("shelter_id =", shelter_id)



    """お気に入りを登録"""
    user_id = _extract_user_id(current_user)
    try:
        add_favorite(db, user_id, shelter_id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return {"ok": True}


@router.delete(
    "/{shelter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="お気に入り解除",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def delete_favorite_endpoint(
    shelter_id: str = Path(..., description="避難所ID"),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
):
    """お気に入り解除"""
    user_id = _extract_user_id(current_user)
    try:
        delete_favorite(db, user_id, shelter_id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    # 204 No Content
    return
