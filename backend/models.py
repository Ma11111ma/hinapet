# models.py
# from sqlalchemy import Column, Integer, String, TIMESTAMP, func
# import database  # ←ここも絶対インポートに変更

# class User(database.Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100), nullable=False)
#     email = Column(String(100), unique=True, nullable=False)
#     created_at = Column(TIMESTAMP, server_default=func.now())
