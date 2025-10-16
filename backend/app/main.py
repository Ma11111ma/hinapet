from __future__ import annotations


# ① .env をロード（先頭付近に追加）

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# ルーター
from app.routers import shelter, users, favorites, premium, stripe_webhook  # ← premium を追加！

# 共通エラーハンドラ
from app.core.errors import register_exception_handlers
from app.core.request_id import RequestIDMiddleware

load_dotenv()

# Swagger タグ
tags_metadata = [
    {"name": "shelters",  "description": "避難所検索・詳細"},
    {"name": "users",     "description": "ユーザー情報（認証必須）"},
    {"name": "favorites", "description": "お気に入り管理（認証必須）"},
    {"name": "premium",   "description": "プレミアム（Stripe決済 / 認証必須）"},  # ← 追加
    {"name": "admin",     "description": "管理系（将来拡張）"},
]

app = FastAPI(title="Pet Evacuation App API", openapi_tags=tags_metadata)

# (1) trace_id ミドルウェア
app.add_middleware(RequestIDMiddleware)

# (2) CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url,"http://127.0.0.1:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=86400,
)


# (3) 例外ハンドラ
register_exception_handlers(app)

# (4) ルーター登録
app.include_router(shelter.router)
app.include_router(users.router)
app.include_router(favorites.router)
app.include_router(premium.router)  # ← 追加
app.include_router(stripe_webhook.router)  # ← 追加
# (5) ヘルスチェック
@app.get("/system/health", tags=["admin"], summary="ヘルスチェック")

def health():
    return {"status": "ok"}
