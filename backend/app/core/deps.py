# backend/app/core/deps.py
# - 認証 & DB 依存（Depends）の共通部品。
# - HTTPBearer で Authorization を必須化（無ければ自動401）。
# - verify_id_token で Firebase ID トークンを検証（無効なら401）。
# - uid で users を検索（無ければ404）。
# - ※ モデル(User)は“関数内で遅延 import”して起動時の循環を避ける。

from __future__ import annotations
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.firebase_auth import verify_id_token
from app.db.session import SessionLocal

bearer_scheme = HTTPBearer(auto_error=True)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Session = Depends(get_db),
):
    token = creds.credentials
    decoded = verify_id_token(token)  # 例: {"uid": "...", ...}
    uid = decoded.get("uid")

    # ★ここで遅延 import（起動時の循環を防ぐ）
    from app.models.user import User

    user = db.query(User).filter(User.firebase_uid == uid).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
