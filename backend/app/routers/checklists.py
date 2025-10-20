# backend/app/routers/checklists.py
from __future__ import annotations
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.errors import ErrorResponse
from app.models.checklist import Checklist
from app.schemas.checklist import (
    ChecklistItem, ChecklistCreate, ChecklistUpdate, ChecklistListResponse, ChecklistItemsPatch
)

router = APIRouter(prefix="/checklists", tags=["checklists"])

def _own_or_404(db: Session, user_id: str, cid: str) -> Checklist:
    c = db.query(Checklist).get(cid)
    if not c or str(c.user_id) != str(user_id):
        raise HTTPException(status_code=404, detail="Checklist not found")
    return c

@router.get(
    "",
    response_model=ChecklistListResponse,
    responses={401: {"model": ErrorResponse}},
)
def list_checklists(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> ChecklistListResponse:
    rows = (
        db.query(Checklist)
        .filter(Checklist.user_id == current_user.id)
        .order_by(Checklist.updated_at.desc())
        .all()
    )
    return ChecklistListResponse(items=[ChecklistItem.model_validate(r) for r in rows])

@router.post(
    "",
    response_model=ChecklistItem,
    status_code=status.HTTP_201_CREATED,
    responses={401: {"model": ErrorResponse}},
)
def create_checklist(
    payload: ChecklistCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> ChecklistItem:
    c = Checklist(user_id=current_user.id, title=payload.title, items_json=payload.items_json)
    db.add(c); db.commit(); db.refresh(c)
    return ChecklistItem.model_validate(c)

@router.put(
    "/{cid}",
    response_model=ChecklistItem,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def update_checklist(
    cid: str,
    payload: ChecklistUpdate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> ChecklistItem:
    c = _own_or_404(db, current_user.id, cid)
    if payload.title is not None: c.title = payload.title
    if payload.items_json is not None: c.items_json = payload.items_json
    db.add(c); db.commit(); db.refresh(c)
    return ChecklistItem.model_validate(c)

@router.delete(
    "/{cid}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def delete_checklist(
    cid: str,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
):
    c = _own_or_404(db, current_user.id, cid)
    db.delete(c); db.commit()
    return

@router.patch(
    "/{cid}/items",
    response_model=ChecklistItem,
    responses={401: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},
)
def patch_items(
    cid: str,
    payload: ChecklistItemsPatch,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> ChecklistItem:
    c = _own_or_404(db, current_user.id, cid)
    c.items_json = payload.items_json
    db.add(c); db.commit(); db.refresh(c)
    return ChecklistItem.model_validate(c)
