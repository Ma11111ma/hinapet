from __future__ import annotations
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

# 💡 デモ用の軽い設定（上書き可能）
POOL_SIZE = int(os.getenv("POOL_SIZE", "5"))
MAX_OVERFLOW = int(os.getenv("MAX_OVERFLOW", "4"))
POOL_RECYCLE = int(os.getenv("POOL_RECYCLE", "1800"))  # 秒。DB接続を再利用
POOL_TIMEOUT = int(os.getenv("POOL_TIMEOUT", "30"))    # 秒。待ち時間（安全策）

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # 切断を自動復旧
    pool_size=POOL_SIZE,       # 常時確保する接続数
    max_overflow=MAX_OVERFLOW, # ピーク時の一時的増枠
    pool_recycle=POOL_RECYCLE, # 長寿命接続を再利用
    pool_timeout=POOL_TIMEOUT, # プール取得の待機上限
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
