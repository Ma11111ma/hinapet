# main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models
import database
import crud
import schemas

# データベースのテーブル作成
# models.Base.metadata.create_all(bind=database.engine)

# app = FastAPI(title="Pet Evacuation App API")

# # DBセッションの取得
# def get_db():
#     db = database.SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # ユーザー作成API
# @app.post("/users/", response_model=schemas.UserRead)
# def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
#     return crud.create_user(db, user)

# # ユーザー一覧取得API
# @app.get("/users/", response_model=list[schemas.UserRead])
# def read_users(db: Session = Depends(get_db)):
#     return crud.get_users(db)


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}
