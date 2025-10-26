# backend/tests/factories.py
from __future__ import annotations
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

def create_shelter(
    db: Session,
    name: str = "避難所A",
    lat: float = 35.000000,
    lng: float = 139.000000,
    type: str = "accompany",   # ← Enumに合わせる：accompany / companion
    capacity: int = 0,
    address: Optional[str] = None,
):
    """
    shelters は id(UUID), name, type(Enum), geom(Geography(Point,4326)) が必須。
    ORM の default(uuid4) は生SQLでは効かないため、ここで Python 側で UUID を採番して挿入する。
    geom は ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography で格納。
    """
    sid = str(uuid.uuid4())

    sql = text("""
        INSERT INTO shelters (id, name, address, type, capacity, geom)
        VALUES (:id, :name, :address, :type, :capacity,
                ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)
        RETURNING id
    """)

    rid = db.execute(sql, {
        "id": sid,
        "name": name,
        "address": address,
        "type": type,   # "accompany" or "companion"
        "capacity": capacity,
        "lat": lat,
        "lng": lng,
    }).scalar_one()

    db.commit()
    return {"id": str(rid), "name": name, "lat": lat, "lng": lng, "type": type}
