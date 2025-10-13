# backend/app/routers/users.py
# - /users/me エンドポイント。
# - ルーター読み込み時にモデルを import しない（型は TYPE_CHECKING でエディタ補完のみ）。
from __future__ import annotations
from typing import TYPE_CHECKING, Any
from fastapi import APIRouter, Depends
from app.core.deps import get_current_user
from app.schemas.user import UserMeResponse

if TYPE_CHECKING:
    from app.models.user import User  # 実行時には評価されない（補完用）

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserMeResponse, summary="認証ユーザーの情報を取得")
def read_me(current_user: Any = Depends(get_current_user)) -> UserMeResponse:
    return current_user
