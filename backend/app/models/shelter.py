import enum, uuid
from sqlalchemy import Column, String, Integer, Boolean, Text, Date, Enum as SAEnum, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from geoalchemy2 import Geography
from app.db.base_class import Base

class ShelterType(str, enum.Enum):
    companion = "companion"   # 同行
    accompany = "accompany"   # 同伴

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=True)
    phone = Column(Text, nullable=True)
    website_url = Column(Text, nullable=True)

    type = Column(SAEnum(ShelterType, name="shelter_type"), nullable=False)
    capacity = Column(Integer, server_default=text("0"))
    geom = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)

    # PDF由来
    is_emergency_flood = Column(Boolean, server_default=text("false"))
    is_emergency_landslide = Column(Boolean, server_default=text("false"))
    is_emergency_tidalwave = Column(Boolean, server_default=text("false"))
    is_emergency_large_fire = Column(Boolean, server_default=text("false"))
    emergency_space_note = Column(Text)
    has_parking = Column(Boolean, server_default=text("false"))
    has_barrier_free_toilet = Column(Boolean, server_default=text("false"))
    has_pet_space = Column(Boolean, server_default=text("false"))
    is_designated_shelter = Column(Boolean, server_default=text("false"))
    is_welfare_shelter_primary = Column(Boolean, server_default=text("false"))
    notes = Column(Text)
    contact_hq = Column(Text)
    source_asof_date = Column(Date)

    # 最新ステータス
    latest_status = Column(Text)
    latest_congestion = Column(Integer)
    latest_reported_at = Column(String)  # timestamptz でも可
    pin_icon = Column(Text)
    image_urls = Column(ARRAY(Text))

    created_at = Column(String, server_default=text("now()"))
    updated_at = Column(String, server_default=text("now()"))

    # ✅ ここを追加
    crowd_level = Column(Text, nullable=True)
