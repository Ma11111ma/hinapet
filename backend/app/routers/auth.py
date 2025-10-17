# backend/app/routers/auth.py
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/session")
def mock_verify_session():
    """
    認証機能未実装の間、常にセッションOKを返すモックAPI。
    フロント起動時の「Failed to verify session」対策。
    """
    return {"id": "dummy-user", "email": "mock@example.com"}