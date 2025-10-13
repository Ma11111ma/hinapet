from fastapi import FastAPI
from app.routers import shelter  # ★ 単数で統一
from app.routers import users 
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Pet Evacuation App API")

# B（フロント）が別オリジンの場合はCORSを許可（必要なオリジンに置き換えてOK）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 例：フロントのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shelter.router)  # ★ /shelters を提供
app.include_router(users.router)  
#　ヘルスチェック動作確認用
@app.get("/system/health")
def health():
    return {"status": "ok"}
