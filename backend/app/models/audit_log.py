import uuid
from sqlalchemy import Column, Text, ForeignKey, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.base_class import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(Text)
    target_type = Column(Text)
    target_id = Column(Text)
    meta = Column(JSONB)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
