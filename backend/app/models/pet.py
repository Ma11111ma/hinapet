import enum, uuid
from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.base_class import Base  # ← 差し替え

class PetSpecies(str, enum.Enum):
    dog = "dog"
    cat = "cat"
    other = "other"

class Pet(Base):
    __tablename__ = "pets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String, nullable=False)
    species = Column(Enum(PetSpecies, name="pet_species"), nullable=False)
