"""
使い方:
  docker compose exec backend bash -lc "python scripts/grant_admin_claim.py <UIDまたはEMAIL> --admin true --premium true"
"""
from __future__ import annotations
import os
import sys
from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials

PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")
CLIENT_EMAIL = os.getenv("FIREBASE_CLIENT_EMAIL")
PRIVATE_KEY = os.getenv("FIREBASE_PRIVATE_KEY")

def init_app():
    if not firebase_admin._apps:
        # 🔸 改行を正しく復元（\n → 実際の改行文字へ）
        pk = (PRIVATE_KEY or "").replace("\\n", "\n")
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": PROJECT_ID,
            "client_email": CLIENT_EMAIL,
            "private_key": pk,
            "token_uri": "https://oauth2.googleapis.com/token",
        })
        firebase_admin.initialize_app(cred)


def resolve_uid(identifier: str) -> str:
    # identifier が email なら uid に解決
    if "@" in identifier:
        user = auth.get_user_by_email(identifier)
        return user.uid
    return identifier


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/grant_admin_claim.py <UID or EMAIL> [--admin true|false] [--premium true|false]")
        sys.exit(1)

    ident = sys.argv[1]
    admin_flag: Optional[bool] = None
    premium_flag: Optional[bool] = None

    args = sys.argv[2:]
    for i in range(0, len(args), 2):
        if args[i] == "--admin":
            admin_flag = args[i+1].lower() == "true"
        if args[i] == "--premium":
            premium_flag = args[i+1].lower() == "true"

    init_app()
    uid = resolve_uid(ident)
    user = auth.get_user(uid)
    claims = dict(user.custom_claims or {})

    if admin_flag is not None:
        claims["admin"] = admin_flag
    if premium_flag is not None:
        claims["premium"] = premium_flag

    auth.set_custom_user_claims(uid, claims)
    print(f"✅ set_custom_user_claims(uid={uid}, claims={claims})")


if __name__ == "__main__":
    main()
