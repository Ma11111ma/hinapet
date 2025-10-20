from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session


def get_shelters(
    db: Session,
    type: Optional[str],
    crowd_level: Optional[str],
    lat: Optional[float],
    lng: Optional[float],
    radius_km: float,
    q: Optional[str],
    limit: int,
    offset: int,
) -> List[Dict[str, Any]]:
    """
    避難所一覧取得:
      - type: 種別フィルタ（companion/accompany）
      - crowd_level: 混雑度フィルタ（low/medium/high など任意の文字列）
      - q   : 名称/住所の部分一致（ILIKE）
      - lat/lng: 位置があれば ST_DWithin で半径抽出し、近い順で並べる
      - limit/offset: 軽量ページング
    """
    params: Dict[str, Any] = {"limit": limit, "offset": offset}
    sql = """
        SELECT
            id::text AS id,
            name,
            address,
            type::text AS type,
            capacity,
            crowd_level,
            ST_Y(geom::geometry) AS lat,
            ST_X(geom::geometry) AS lng
        FROM shelters
        WHERE 1=1
    """

    if type:
        sql += " AND type = :type"
        params["type"] = type

    if q:
        sql += " AND (name ILIKE :kw OR address ILIKE :kw)"
        params["kw"] = f"%{q}%"

    if crowd_level:
        sql += " AND crowd_level = :crowd_level"
        params["crowd_level"] = crowd_level

    # 既定は名称昇順（位置未指定時）
    order_clause = " ORDER BY name"

    if lat is not None and lng is not None:
        sql += """
            AND ST_DWithin(
                geom,
                ST_MakePoint(:lng, :lat)::geography,
                :dist_m
            )
        """
        params.update({"lat": lat, "lng": lng, "dist_m": float(radius_km) * 1000.0})
        # 位置が指定されたときは「距離の近い順」
        order_clause = """
            ORDER BY ST_Distance(
                geom,
                ST_MakePoint(:lng, :lat)::geography
            ) ASC
        """

    sql += f"{order_clause} LIMIT :limit OFFSET :offset"

    rows = db.execute(text(sql), params).mappings().all()
    return [dict(row) for row in rows]


def get_shelter_by_id(db: Session, shelter_id: str) -> Optional[Dict[str, Any]]:
    """
    避難所詳細取得（存在しない場合は None）
    """
    sql = """
        SELECT
            id::text AS id,
            name,
            address,
            type::text AS type,
            capacity,
            crowd_level,
            ST_Y(geom::geometry) AS lat,
            ST_X(geom::geometry) AS lng
        FROM shelters
        WHERE id = :id
        LIMIT 1
    """
    row = db.execute(text(sql), {"id": shelter_id}).mappings().first()
    return dict(row) if row else None
