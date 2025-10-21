from __future__ import annotations
import enum, uuid
from sqlalchemy import Column, String, Boolean, Text, TIMESTAMP, Enum as SAEnum, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base

class PetSpecies(str, enum.Enum):
    dog = "dog"
    cat = "cat"
    other = "other"

class Pet(Base):
    __tablename__ = "pets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 所有者
    owner_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # 基本情報
    name = Column(String, nullable=False)
    species = Column(SAEnum(PetSpecies, name="pet_species"), nullable=False)

    # 追加列（Migration users_pets_extensions に合わせる）
    vaccinated = Column(Boolean, server_default=text("false"), nullable=True)
    memo = Column(Text, nullable=True)
    certificate_image_url = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=True)
