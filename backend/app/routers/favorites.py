from __future__ import annotations
from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.deps import get_current_user, get_db
from app.schemas.favorite import (
    FavoriteItem, FavoriteListResponse,
    FavoriteWithShelter, FavoriteListWithShelterResponse,
)
from app.crud.favorite import (
    list_user_favorites,
    list_user_favorites_with_shelter,
    add_favorite,
    delete_favorite,
)

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.get("", response_model=FavoriteListResponse, summary="自分のお気に入り一覧")
def get_favorites(
    include_shelter: bool = Query(False, description="trueで避難所名などをJOIN"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    if include_shelter:
        items = list_user_favorites_with_shelter(db, str(current_user.id))
        return FavoriteListWithShelterResponse(items=[FavoriteWithShelter(**i) for i in items])  # type: ignore
    items = list_user_favorites(db, str(current_user.id))
    return FavoriteListResponse(items=[FavoriteItem(**i) for i in items])  # type: ignore


@router.put("/{shelter_id}", status_code=status.HTTP_200_OK, summary="お気に入りに追加（upsert/重複は成功扱い）")
def put_favorite(
    shelter_id: str = Path(..., description="避難所ID(UUID)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    try:
        add_favorite(db, str(current_user.id), shelter_id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise  # 共通例外ハンドラが 400 に整形
    return {"ok": True}


@router.delete("/{shelter_id}", status_code=status.HTTP_204_NO_CONTENT, summary="お気に入り解除（冪等）")
def delete_favorite_endpoint(
    shelter_id: str = Path(..., description="避難所ID(UUID)"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    try:
        delete_favorite(db, str(current_user.id), shelter_id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    return
