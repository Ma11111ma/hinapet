# backend/app/routers/pets.py
from __future__ import annotations
from typing import Any
from fastapi import APIRouter, Depends, Path, status, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.errors import ErrorResponse
from app.models.pet import Pet
from app.schemas.pet import PetItem, PetCreate, PetUpdate, PetListResponse

router = APIRouter(prefix="/users/me/pets", tags=["pets"])

def _assert_owner_or_404(pet: Pet | None, user_id: Any) -> Pet:
    if not pet or str(pet.owner_id) != str(user_id):
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet

@router.get(
    "",
    response_model=PetListResponse,
    summary="自分のペット一覧",
    responses={401: {"description": "Unauthorized", "model": ErrorResponse}},
)
def list_pets(
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> PetListResponse:
    rows = (
        db.query(Pet)
        .filter(Pet.owner_id == current_user.id)
        .order_by(Pet.created_at.desc().nullslast())
        .all()
    )
    return PetListResponse(items=[PetItem.model_validate(r) for r in rows])

@router.post(
    "",
    response_model=PetItem,
    status_code=status.HTTP_201_CREATED,
    summary="ペット登録",
    responses={401: {"description": "Unauthorized", "model": ErrorResponse}},
)
def create_pet(
    payload: PetCreate,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> PetItem:
    pet = Pet(
        owner_id=current_user.id,
        name=payload.name,
        species=payload.species,
        vaccinated=payload.vaccinated,
        memo=payload.memo,
        certificate_image_url=payload.certificate_image_url,
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return PetItem.model_validate(pet)

@router.put(
    "/{pet_id}",
    response_model=PetItem,
    summary="ペット更新",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        404: {"description": "Not Found", "model": ErrorResponse},
    },
)
def update_pet(
    pet_id: str = Path(...),
    payload: PetUpdate = None,
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
) -> PetItem:
    pet = _assert_owner_or_404(db.query(Pet).get(pet_id), current_user.id)
    if payload.name is not None: pet.name = payload.name
    if payload.species is not None: pet.species = payload.species
    if payload.vaccinated is not None: pet.vaccinated = payload.vaccinated
    if payload.memo is not None: pet.memo = payload.memo
    if payload.certificate_image_url is not None: pet.certificate_image_url = payload.certificate_image_url
    db.add(pet); db.commit(); db.refresh(pet)
    return PetItem.model_validate(pet)

@router.delete(
    "/{pet_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="ペット削除",
    responses={
        401: {"description": "Unauthorized", "model": ErrorResponse},
        404: {"description": "Not Found", "model": ErrorResponse},
    },
)
def delete_pet(
    pet_id: str = Path(...),
    db: Session = Depends(get_db),
    current_user: Any = Depends(get_current_user),
):
    pet = _assert_owner_or_404(db.query(Pet).get(pet_id), current_user.id)
    db.delete(pet)
    db.commit()
    return
