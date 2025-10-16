from sqlalchemy import Column, ForeignKey, PrimaryKeyConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import DateTime
from app.db.base_class import Base

class Favorite(Base):
    __tablename__ = "favorites"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
                     nullable=False, index=True, primary_key=True)
    shelter_id = Column(UUID(as_uuid=True), ForeignKey("shelters.id", ondelete="CASCADE"),
                        nullable=False, index=True, primary_key=True)

    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"))

    __table_args__ = (
        PrimaryKeyConstraint("user_id", "shelter_id", name="pk_favorites_user_shelter"),
    )
