from __future__ import annotations
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.errors import ErrorResponse
from app.models.pet import Pet
from app.schemas.pet import PetItem, PetListResponse

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
    try:
        rows = (
            db.query(Pet)
            .filter(Pet.owner_id == current_user.id)
            .order_by(Pet.created_at.desc().nullslast())
            .all()
        )
        # スキーマ側で use_enum_values=True を付けているのでそのまま検証・整形でOK
        return PetListResponse(items=[PetItem.model_validate(r) for r in rows])
    except Exception as e:
        # 直近の500はここで AttributeError になっていたはず
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unexpected server error: {e}")
