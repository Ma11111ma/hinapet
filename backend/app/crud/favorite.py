from __future__ import annotations
from typing import Any, Dict, List
from sqlalchemy import text
from sqlalchemy.orm import Session

def list_user_favorites(db: Session, user_id: str) -> List[Dict[str, Any]]:
    sql = text("""
        SELECT shelter_id::text AS shelter_id, created_at
        FROM favorites
        WHERE user_id = :uid
        ORDER BY created_at DESC NULLS LAST
    """)
    rows = db.execute(sql, {"uid": user_id}).mappings().all()
    return [dict(r) for r in rows]

def list_user_favorites_with_shelter(db: Session, user_id: str) -> List[Dict[str, Any]]:
    sql = text("""
        SELECT f.shelter_id::text AS shelter_id,
               s.name, s.address, s.type::text AS type,
               ST_Y(s.geom::geometry) AS lat, ST_X(s.geom::geometry) AS lng
        FROM favorites f
        JOIN shelters s ON s.id = f.shelter_id
        WHERE f.user_id = :uid
        ORDER BY s.name ASC
    """)
    rows = db.execute(sql, {"uid": user_id}).mappings().all()
    return [dict(r) for r in rows]

def add_favorite(db: Session, user_id: str, shelter_id: str) -> None:
    sql = text("""
        INSERT INTO favorites (user_id, shelter_id)
        VALUES (:uid, :sid)
        ON CONFLICT (user_id, shelter_id) DO NOTHING
    """)
    db.execute(sql, {"uid": user_id, "sid": shelter_id})

def delete_favorite(db: Session, user_id: str, shelter_id: str) -> int:
    sql = text("""
        DELETE FROM favorites
        WHERE user_id = :uid AND shelter_id = :sid
    """)
    result = db.execute(sql, {"uid": user_id, "sid": shelter_id})
    return result.rowcount or 0
