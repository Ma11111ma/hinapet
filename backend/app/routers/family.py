# backend/app/routers/family.py
from __future__ import annotations
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.errors import ErrorResponse
from app.models.family import FamilyMember, FamilyCheckin
from app.schemas.family import (
    FamilyMemberItem, FamilyMemberCreate, FamilyMemberUpdate, FamilyMemberListResponse,
    FamilyCheckinItem, FamilyCheckinCreate, FamilyCheckinLatestResponse,
)

router = APIRouter(prefix="/family", tags=["family"])

def _own_member_or_404(db: Session, user_id: str, member_id: str) -> FamilyMember:
    m = db.query(FamilyMember).get(member_id)
    if not m or str(m.user_id) != str(user_id):
        raise HTTPException(status_code=404, detail="Family member not found")
    return m

@router.get(
    "/members",
    response_model=FamilyMemberListResponse,
    responses={401: {"model": ErrorResponse}},
)
def list_members(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> FamilyMemberListResponse:
    rows = db.query(FamilyMember).where(FamilyMember.user_id == current_user.id).order_by(FamilyMember.created_at.asc()).all()
    return FamilyMemberListResponse(items=[FamilyMemberItem.model_validate(r) for r in rows])

@router.post(
    "/members",
    response_model=FamilyMemberItem,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": ErrorResponse}},
)
def create_member(
    payload: FamilyMemberCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> FamilyMemberItem:
    m = FamilyMember(user_id=current_user.id, name=payload.name, relation=payload.relation, contact=payload.contact)
    db.add(m); db.commit(); db.refresh(m)
    return FamilyMemberItem.model_validate(m)

@router.put(
    "/members/{member_id}",
    response_model=FamilyMemberItem,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def update_member(
    member_id: str,
    payload: FamilyMemberUpdate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> FamilyMemberItem:
    m = _own_member_or_404(db, current_user.id, member_id)
    if payload.name is not None: m.name = payload.name
    if payload.relation is not None: m.relation = payload.relation
    if payload.contact is not None: m.contact = payload.contact
    db.add(m); db.commit(); db.refresh(m)
    return FamilyMemberItem.model_validate(m)

@router.delete(
    "/members/{member_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
):
    m = _own_member_or_404(db, current_user.id, member_id)
    db.delete(m); db.commit()
    return

@router.post(
    "/checkin",
    response_model=FamilyCheckinItem,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def create_checkin(
    payload: FamilyCheckinCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> FamilyCheckinItem:
    _ = _own_member_or_404(db, current_user.id, payload.member_id)
    c = FamilyCheckin(
        member_id=payload.member_id,
        status=payload.status,
        message=payload.message,
        reported_by_user_id=current_user.id,
    )
    db.add(c); db.commit(); db.refresh(c)
    return FamilyCheckinItem.model_validate(c)

@router.get(
    "/checkin/latest",
    response_model=FamilyCheckinLatestResponse,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def get_latest_checkin(
    member_id: str = Query(..., description="家族メンバーID"),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> FamilyCheckinLatestResponse:
    _ = _own_member_or_404(db, current_user.id, member_id)
    c = (
        db.query(FamilyCheckin)
        .filter(FamilyCheckin.member_id == member_id)
        .order_by(FamilyCheckin.reported_at.desc())
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Checkin not found")
    return FamilyCheckinLatestResponse.model_validate(c)
