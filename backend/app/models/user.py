import enum, uuid
from sqlalchemy import Column, String, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class UserPlan(str, enum.Enum):
    free = "free"
    premium = "premium"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    display_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    firebase_uid = Column(String, unique=True, nullable=True)
    plan = Column(Enum(UserPlan, name="user_plan"), nullable=False, default=UserPlan.free)
