
from __future__ import annotations #構文ルールで_future_はファイルの最初の文でなければダメ
from dotenv import load_dotenv
load_dotenv()  # .env の内容を環境変数として読み込む

# ① .env をロード（先頭付近に追加）

import os
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


# ログ初期化（PIIマスキング＋環境別出し分け）
from app.core.logging import setup_logging

# ルーター

from app.routers import shelter, users, favorites, premium, pets, family, checklists, news, auth,stripe_webhook # ← premium を追加！



# 共通エラーハンドラ
from app.core.errors import register_exception_handlers
from app.core.request_id import RequestIDMiddleware

# レート制限
from fastapi_limiter import FastAPILimiter
import redis.asyncio as aioredis  # redis==4 系

# ========================
# 起動前初期化
# ========================
load_dotenv()
# .env の ENV / APP_ENV を見て自動切替:
#   - development: テキスト + DEBUG
#   - production : JSON + INFO
setup_logging(os.getenv("ENV") or os.getenv("APP_ENV"))

logger = logging.getLogger(__name__)

# Swagger タグ
tags_metadata = [
    {"name": "shelters",  "description": "避難所検索・詳細"},
    {"name": "users",     "description": "ユーザー情報（認証必須）"},
    {"name": "favorites", "description": "お気に入り管理（認証必須）"},
    {"name": "premium",   "description": "プレミアム（Stripe決済 / 認証必須）"},
    {"name": "admin",     "description": "管理系（将来拡張）"},
]

app = FastAPI(title="Pet Evacuation App API", openapi_tags=tags_metadata)

# (1) trace_id ミドルウェア
app.add_middleware(RequestIDMiddleware)


# (2) CORS（本番ドメイン固定／必要時のみPreviewを許可）
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
ALLOW_VERCEL_PREVIEW = os.getenv("ALLOW_VERCEL_PREVIEW", "0") == "1"

cors_kwargs = dict(
    allow_origins=[FRONTEND_URL],           # ★ 本番ドメイン固定（今はローカル http://localhost:3000）
    allow_credentials=False,                # ★ Cookie 認証は使わないので常に False
    allow_methods=["*"],
    allow_headers=["*"],

    max_age=86400,
)
# Preview を許可したいときだけ正規表現を追加
if ALLOW_VERCEL_PREVIEW:
    cors_kwargs["allow_origin_regex"] = r"https://.*\.vercel\.app"

app.add_middleware(CORSMiddleware, **cors_kwargs)

# (2.5) リクエスト/レスポンスの構造化ログ（PIIマスキング対象）
@app.middleware("http")
async def log_request_middleware(request: Request, call_next):
    """
    すべてのHTTPリクエストを構造化してログ出力。
    app.core.logging.PIIFilter により、メールや Bearer トークンは自動で "***" に伏字。
    """
    # ノイズを減らすならヘルスチェックは除外
    if request.url.path == "/system/health":
        return await call_next(request)

    headers = dict(request.headers)  # Authorizationなども含む（PIIフィルタが伏字にする）
    logger.info({"event": "request", "path": request.url.path, "method": request.method, "headers": headers})

    response = await call_next(request)

    logger.info({"event": "response", "path": request.url.path, "status": response.status_code})
    return response

# (3) 例外ハンドラ
register_exception_handlers(app)

# (4) レートリミッタ初期化（起動時）
@app.on_event("startup")
async def _init_rate_limiter():
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis)

# (5) ルーター登録
app.include_router(shelter.router)
app.include_router(users.router)
app.include_router(favorites.router)
app.include_router(premium.router)  
app.include_router(pets.router)
app.include_router(family.router)
app.include_router(checklists.router)
app.include_router(news.router)
app.include_router(auth.router)
app.include_router(stripe_webhook.router)

# (6) ヘルスチェック
@app.get("/system/health", tags=["admin"], summary="ヘルスチェック")
def health():
    return {"status": "ok"}
