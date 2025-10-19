# backend/app/routers/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import auth as firebase_auth, initialize_app, credentials
import firebase_admin
import os

router = APIRouter(prefix="/auth", tags=["auth"])

# Firebase Admin SDK の初期化（環境変数があれば有効）
if not firebase_admin._apps and os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        initialize_app(cred)

class AuthVerifyRequest(BaseModel):
    idToken: str

class AuthVerifyResponse(BaseModel):
    id: str
    email: str | None = None
    name: str | None = None

@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_token(payload: AuthVerifyRequest):
    """FirebaseのIDトークンを検証"""
    try:
        decoded_token = firebase_auth.verify_id_token(payload.idToken)
        return AuthVerifyResponse(
            id=decoded_token["uid"],
            email=decoded_token.get("email"),
            name=decoded_token.get("name"),
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/session")
def mock_verify_session():
    """モックモード（認証未実装時用）"""
    return {"id": "dummy-user", "email": "mock@example.com"}
