# backend/app/main.py
from fastapi import FastAPI
from app.routers import shelter  # ★ 単数で統一
from app.routers import users 
from fastapi.middleware.cors import CORSMiddleware

from app.routers import premium
from app.routers import stripe_webhook  # ← 追加



# ① .env をロード（先頭付近に追加）
import os
from dotenv import load_dotenv
load_dotenv()  # backend/.env を読み込む

app = FastAPI(title="Pet Evacuation App API")

# ② CORS（FRONTEND_URL と Vercel を許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shelter.router)  # ★ /shelters を提供
app.include_router(users.router)  

app.include_router(premium.router)       # 既存
app.include_router(stripe_webhook.router)  # ← 追加
#　ヘルスチェック動作確認用
@app.get("/system/health")
def health():
    return {"status": "ok"}
