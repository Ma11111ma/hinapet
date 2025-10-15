from __future__ import annotations

from typing import TYPE_CHECKING, Any
from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.errors import ErrorResponse
from app.schemas.user import UserMeResponse

if TYPE_CHECKING:
    from app.models.user import User  # 補完用

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserMeResponse,
    summary="認証ユーザーの情報を取得",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        404: {"description": "User not found", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def read_me(current_user: Any = Depends(get_current_user)) -> UserMeResponse:
    return current_user
