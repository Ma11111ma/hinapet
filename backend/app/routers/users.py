from __future__ import annotations
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.errors import ErrorResponse
from app.schemas.user import UserMeResponse, UserMeUpdate, UserPlanResponse

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
    # Enum を文字列化して安全に返す
    return UserMeResponse(
        id=str(getattr(current_user, "id", "")),
        display_name=getattr(current_user, "display_name", None),
        email=getattr(current_user, "email", None),
        plan=str(getattr(current_user, "plan", "")),
    )

@router.put(
    "/me",
    response_model=UserMeResponse,
    summary="認証ユーザーの情報を更新",
    responses={
        400: {"description": "Bad Request", "model": ErrorResponse},
        401: {"description": "Unauthorized", "model": ErrorResponse},
        409: {"description": "Conflict (unique constraint)", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def update_me(
    payload: UserMeUpdate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> UserMeResponse:
    updated = False
    if payload.display_name is not None:
        current_user.display_name = payload.display_name; updated = True
    if payload.email is not None:
        current_user.email = payload.email; updated = True
    if hasattr(current_user, "phone") and payload.phone is not None:
        current_user.phone = payload.phone; updated = True
    if hasattr(current_user, "qr") and payload.qr is not None:
        current_user.qr = payload.qr; updated = True
    if updated:
        db.add(current_user); db.commit(); db.refresh(current_user)
    return UserMeResponse(
        id=str(current_user.id),
        display_name=getattr(current_user, "display_name", None),
        email=getattr(current_user, "email", None),
        plan=str(getattr(current_user, "plan", "")),
    )

@router.get(
    "/me/plan",
    response_model=UserPlanResponse,
    summary="認証ユーザーのプラン状態を取得",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse},
    },
)
def read_my_plan(current_user: Any = Depends(get_current_user)) -> UserPlanResponse:
    return UserPlanResponse(
        plan=str(getattr(current_user, "plan", "")),
        premium_until=getattr(current_user, "premium_until", None),
        billing_status=getattr(current_user, "billing_status", None),
        stripe_customer_id=getattr(current_user, "stripe_customer_id", None),
        stripe_sub_id=getattr(current_user, "stripe_sub_id", None),
    )
