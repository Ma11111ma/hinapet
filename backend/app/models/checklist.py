import uuid
from sqlalchemy import Column, Text, ForeignKey, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base_class import Base

class Checklist(Base):
    __tablename__ = "checklists"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(Text)
    items_json = Column(JSONB)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
