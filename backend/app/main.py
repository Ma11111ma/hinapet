# backend/app/main.py
from fastapi import FastAPI

# アプリ本体
app = FastAPI(title="Pet Evacuation App API")

# ヘルスチェック（動作確認・監視用に追加）
@app.get("/system/health")
def health():
    return {"status": "ok"}
