# backend/app/models/shelter.py
import enum, uuid
from sqlalchemy import Column, String, Integer, Enum as SAEnum, text
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geography
from app.db.base import Base

class ShelterType(str, enum.Enum):
    companion = "companion"   # 同行
    accompany = "accompany"   # 同伴

class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=True)
    type = Column(SAEnum(ShelterType, name="shelter_type"), nullable=False)
    capacity = Column(Integer, server_default=text("0"))
    geom = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)
