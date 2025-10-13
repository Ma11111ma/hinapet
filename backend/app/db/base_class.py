# backend/app/db/base_class.py
# - SQLAlchemy の Declarative Base を定義するだけのファイル。
# - モデルはみんなここから Base を import する（= 循環を断つため）。

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
