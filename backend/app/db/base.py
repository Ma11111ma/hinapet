# backend/app/db/base.py
# - Alembic の自動検出用に「全モデルを import して登録」する集約ファイル。
# - アプリ本体のコードはここを import しない（= 循環防止）。
from app.db.base_class import Base  # Base 定義だけを持ち込む

# ↓ Alembic のために全モデルを import（未使用でもOKにするため noqa）
from app.models.user import User            # noqa: F401
from app.models.shelter import Shelter      # noqa: F401
from app.models.pet import Pet              # noqa: F401
from app.models.favorite import Favorite    # noqa: F401
