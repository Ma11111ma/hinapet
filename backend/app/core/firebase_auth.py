# backend/app/core/firebase_auth.py
from __future__ import annotations
import os
from functools import lru_cache
from typing import Any, Dict

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, status

PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")  # ダブルクオートで囲み、\n 改行を保持


@lru_cache(maxsize=1)
def _init_app() -> None:
    if not firebase_admin._apps:
        if not (PROJECT_ID and CLIENT_EMAIL and PRIVATE_KEY):
            raise RuntimeError("Firebase Admin env vars missing.")
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": PROJECT_ID,
            "client_email": CLIENT_EMAIL,
            "private_key": PRIVATE_KEY,
            "token_uri": "https://oauth2.googleapis.com/token",
        })
        firebase_admin.initialize_app(cred)


def verify_id_token(id_token: str) -> Dict[str, Any]:
    """
    Firebase IDトークンを厳密検証し、uid/email/custom claims を含めて返す。
    無効・期限切れ・別プロジェクト発行 → 401
    """
    _init_app()
    try:
        decoded = auth.verify_id_token(id_token)  # exp/iss/audもSDK側で検証される
        # 正規化：claims は tokenの最上位に混ざるので、必要な値をまとめて返す
        return {
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "claims": {
                "admin": bool(decoded.get("admin", False)),
                "premium": bool(decoded.get("premium", False)),
            },
            # 必要なら他のクレームもここで拾う
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        ) from e
