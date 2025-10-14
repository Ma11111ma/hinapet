# backend/app/main.py
from fastapi import FastAPI
from app.routers import shelter   # 既存
from fastapi.middleware.cors import CORSMiddleware

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

# ③ 既存の shelter ルーター
app.include_router(shelter.router)  # /shelters を提供

# ④ premium ルーターの登録（←これを追加）
from app.routers import premium
app.include_router(premium.router)  # /premium/checkout など

# ヘルスチェック
@app.get("/system/health")
def health():
    return {"status": "ok"}
