# backend/app/routers/auth.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from firebase_admin import auth as firebase_auth, credentials, initialize_app
import firebase_admin
import os
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------------------
# 🔧 Firebase Admin SDK の初期化（まだの場合のみ）
# ---------------------------------------------
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        initialize_app(cred)
        print("✅ Firebase Admin SDK initialized")
    else:
        raise RuntimeError(
            "❌ GOOGLE_APPLICATION_CREDENTIALS が設定されていないか、パスが間違っています。"
        )

# ---------------------------------------------
# モデル定義
# ---------------------------------------------
class AuthVerifyRequest(BaseModel):
    idToken: str


class AuthVerifyResponse(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None


# ---------------------------------------------
# 🔐 Firebase トークン検証エンドポイント
# ---------------------------------------------
@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_token(req: AuthVerifyRequest):
    """
    Firebase の ID トークンを検証して、ユーザー情報を返す。
    不正トークンなら 401 を返す。
    """
    try:
        decoded_token = firebase_auth.verify_id_token(req.idToken)
    except Exception as e:
        print("❌ Token verification failed:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name") or decoded_token.get("displayName")

    return AuthVerifyResponse(id=uid, email=email, name=name)
