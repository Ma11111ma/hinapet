# backend/app/db/base.py


from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# ---- Alembic の自動検出用に全モデルを import（順序大事）----
# noqa で未使用警告を抑止。import するだけで Base.metadata に載る。
from app.models.user import User          # noqa: F401
from app.models.pet import Pet            # noqa: F401
from app.models.shelter import Shelter    # noqa: F401
from app.models.favorite import Favorite  # noqa: F401

# チーム向け補足：エディタ補完用
__all__ = ["Base", "User", "Pet", "Shelter", "Favorite"]
