import uuid, enum
from sqlalchemy import Column, Text, TIMESTAMP, Enum, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base

class NewsLevel(str, enum.Enum):
    info = "info"
    alert = "alert"
    emergency = "emergency"

class NewsStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"

class News(Base):
    __tablename__ = "news"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    body = Column(Text, nullable=False)
    level = Column(Enum(NewsLevel, name="news_level"))
    area = Column(Text)
    source_url = Column(Text)
    published_at = Column(TIMESTAMP(timezone=True))
    expires_at = Column(TIMESTAMP(timezone=True))
    status = Column(Enum(NewsStatus, name="news_status"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
