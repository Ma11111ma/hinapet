import uuid
from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    shelter_id = Column(UUID(as_uuid=True), ForeignKey("shelters.id", ondelete="CASCADE"), index=True, nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "shelter_id", name="uq_fav_user_shelter"),)
