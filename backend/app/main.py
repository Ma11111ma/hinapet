# backend/app/main.py
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 既存のルーター
from app.routers import shelter  # /shelters
from app.routers import users    # /users
# ★ 追加: /favorites
from app.routers import favorites

# ★ 共通例外ハンドラ
from app.core.errors import register_exception_handlers

# ① .env をロード（既存方針を踏襲）
import os
from dotenv import load_dotenv
load_dotenv()  # backend/.env を読み込む

app = FastAPI(title="Pet Evacuation App API")

# ② CORS（FRONTEND_URL + Vercel配下を許可）
#    ※ Starlette CORSは "https://*.vercel.app" のワイルドカードを
#       allow_origins では解釈しないため、allow_origin_regex を併用
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_origin_regex=r"https://.*\.vercel\.app",  # ← Vercel配下を許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ③ 共通例外ハンドラを一括登録（http / validation / integrity / unexpected）
register_exception_handlers(app)

# ④ ルーター登録
app.include_router(shelter.router)    # /shelters
app.include_router(users.router)      # /users
app.include_router(favorites.router)  # /favorites ★追加

# ⑤ ヘルスチェック
@app.get("/system/health")
def health():
    return {"status": "ok"}
