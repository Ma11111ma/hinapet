# backend/app/routers/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firebase_admin import auth as firebase_auth, initialize_app, credentials
import firebase_admin
import os

# Firebase Admin SDK の初期化
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if not cred_path or not os.path.exists(cred_path):
        raise RuntimeError(f"Service account file not found: {cred_path}")
    cred = credentials.Certificate(cred_path)
    initialize_app(cred)

router = APIRouter(prefix="/auth", tags=["auth"])

class AuthVerifyRequest(BaseModel):
    idToken: str

class AuthVerifyResponse(BaseModel):
    id: str
    email: str | None = None
    name: str | None = None

@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_token(payload: AuthVerifyRequest):
    """FirebaseのIDトークンを検証してユーザー情報を返す"""
    try:
        decoded_token = firebase_auth.verify_id_token(payload.idToken)
        uid = decoded_token["uid"]
        email = decoded_token.get("email")
        name = decoded_token.get("name")
        return AuthVerifyResponse(id=uid, email=email, name=name)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
