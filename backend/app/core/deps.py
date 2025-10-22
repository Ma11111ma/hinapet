# backend/app/core/deps.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Annotated, Any, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.firebase_auth import verify_id_token
from app.db.session import SessionLocal

bearer_scheme = HTTPBearer(auto_error=True)

@dataclass
class AuthContext:
    uid: str
    email: str | None
    claims: Dict[str, Any]  # {"admin": bool, "premium": bool}
    user: Any               # ORM User オブジェクト


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Session = Depends(get_db),
) -> Any:
    """
    - Firebaseトークンを検証
    - users に存在しなければ自動登録（既存実装を踏襲）
    - 戻り値は ORM User
    """
    token = creds.credentials
    decoded = verify_id_token(token)
    uid = decoded.get("uid")
    email = decoded.get("email")

    from app.models.user import User  # 遅延 import

    user = db.query(User).filter(User.firebase_uid == uid).first()
    if user is None:
        user = User(firebase_uid=uid, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def get_auth_context(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Session = Depends(get_db),
) -> AuthContext:
    """
    便利依存：Userだけでなくclaimsも欲しい場面用
    """
    decoded = verify_id_token(creds.credentials)
    uid = decoded.get("uid")
    email = decoded.get("email")
    claims: Dict[str, Any] = decoded.get("claims", {})

    from app.models.user import User
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if user is None:
        user = User(firebase_uid=uid, email=email)
        db.add(user); db.commit(); db.refresh(user)

    return AuthContext(uid=uid, email=email, claims=claims, user=user)


def get_admin_user(ctx: AuthContext = Depends(get_auth_context)) -> Any:
    """
    管理者専用依存。claims.admin が True でなければ 403。
    戻り値は ORM User（既存の処理に自然に入れ替え可能）
    """
    if not bool(ctx.claims.get("admin", False)):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privilege required")
    return ctx.user
