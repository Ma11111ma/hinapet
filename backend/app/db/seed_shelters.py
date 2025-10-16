# backend/app/db/seed_shelters.py
from __future__ import annotations
import os, csv, uuid
from pathlib import Path
from typing import Any, Dict, Optional
from sqlalchemy import text
from app.db.session import engine

PROJECT_ROOT = Path(__file__).resolve().parents[2]   # .../backend
DEFAULT_CSV = PROJECT_ROOT / "data" / "processed" / "fujisawa_shelters_with_geo.csv"
CSV_PATH = Path(os.getenv("CSV_PATH") or DEFAULT_CSV)

SQL = text("""
INSERT INTO shelters (
  id, name, address, phone, website_url, type, capacity,
  geom,
  is_emergency_flood, is_emergency_landslide, is_emergency_tidalwave, is_emergency_large_fire,
  emergency_space_note, has_parking, has_barrier_free_toilet, has_pet_space,
  is_designated_shelter, is_welfare_shelter_primary, notes, contact_hq, source_asof_date,
  latest_status, latest_congestion, latest_reported_at, pin_icon, image_urls
)
VALUES (
  :id, :name, :address, :phone, :website_url, :type, :capacity,
  ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
  :is_emergency_flood, :is_emergency_landslide, :is_emergency_tidalwave, :is_emergency_large_fire,
  :emergency_space_note, :has_parking, :has_barrier_free_toilet, :has_pet_space,
  :is_designated_shelter, :is_welfare_shelter_primary, :notes, :contact_hq, :source_asof_date,
  :latest_status, :latest_congestion, :latest_reported_at, :pin_icon, :image_urls
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  website_url = EXCLUDED.website_url,
  type = EXCLUDED.type,
  capacity = EXCLUDED.capacity,
  geom = EXCLUDED.geom,
  is_emergency_flood = EXCLUDED.is_emergency_flood,
  is_emergency_landslide = EXCLUDED.is_emergency_landslide,
  is_emergency_tidalwave = EXCLUDED.is_emergency_tidalwave,
  is_emergency_large_fire = EXCLUDED.is_emergency_large_fire,
  emergency_space_note = EXCLUDED.emergency_space_note,
  has_parking = EXCLUDED.has_parking,
  has_barrier_free_toilet = EXCLUDED.has_barrier_free_toilet,
  has_pet_space = EXCLUDED.has_pet_space,
  is_designated_shelter = EXCLUDED.is_designated_shelter,
  is_welfare_shelter_primary = EXCLUDED.is_welfare_shelter_primary,
  notes = EXCLUDED.notes,
  contact_hq = EXCLUDED.contact_hq,
  source_asof_date = EXCLUDED.source_asof_date,
  latest_status = EXCLUDED.latest_status,
  latest_congestion = EXCLUDED.latest_congestion,
  latest_reported_at = EXCLUDED.latest_reported_at,
  pin_icon = EXCLUDED.pin_icon,
  image_urls = EXCLUDED.image_urls
""")

def _bool(v: Any) -> Optional[bool]:
    if v is None: return None
    s = str(v).strip().lower()
    if s == "": return None
    return s in {"1","true","t","yes","y","on","○"}

def _int(v: Any) -> Optional[int]:
    try:
        s = str(v).strip()
        if s == "": return None
        return int(float(s))
    except: return None

def _uuid5(name: str, address: str, typ: str) -> str:
    ns = uuid.UUID("00000000-0000-0000-0000-000000000000")
    return str(uuid.uuid5(ns, f"{name}|{address}|{typ}"))

def _find_existing(conn, name: str, address: str) -> Optional[str]:
    row = conn.execute(text("SELECT id::text FROM shelters WHERE name=:n AND address=:a LIMIT 1"),
                       {"n": name, "a": address}).mappings().first()
    return row["id"] if row else None

def run():
    if not CSV_PATH.exists():
        raise SystemExit(f"CSV not found: {CSV_PATH}")
    with engine.begin() as conn, open(CSV_PATH, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        headers = set(r.fieldnames or [])
        count = 0
        for row in r:
            name = (row.get("name") or "").strip()
            address = (row.get("address") or "").strip()
            typ = (row.get("type") or "accompany").strip()
            lat = row.get("lat"); lng = row.get("lng")
            if not name or not lat or not lng:  # lat/lng ない行はスキップ
                continue

            existed = _find_existing(conn, name, address)
            sid = (row.get("id") or "").strip() or existed or _uuid5(name, address, typ)

            params: Dict[str, Any] = {
                "id": sid, "name": name, "address": address,
                "phone": (row.get("phone") or "").strip(),
                "website_url": (row.get("website_url") or "").strip(),
                "type": typ, "capacity": _int(row.get("capacity")) or 0,
                "lat": float(lat), "lng": float(lng),
                "emergency_space_note": (row.get("emergency_space_note") or "").strip(),
                "notes": (row.get("notes") or "").strip(),
                "contact_hq": (row.get("contact_hq") or "").strip(),
                "source_asof_date": (row.get("source_asof_date") or None),
                "latest_status": (row.get("latest_status") or None),
                "latest_congestion": _int(row.get("latest_congestion")),
                "latest_reported_at": (row.get("latest_reported_at") or None),
                "pin_icon": (row.get("pin_icon") or "").strip(),
                "image_urls": None,  # CSVで配列化したい時はセミコロン区切りでsplit()する
            }
            # boolean 群
            for col in [
                "is_emergency_flood","is_emergency_landslide","is_emergency_tidalwave",
                "is_emergency_large_fire","has_parking","has_barrier_free_toilet",
                "has_pet_space","is_designated_shelter","is_welfare_shelter_primary"
            ]:
                params[col] = _bool(row.get(col))
            conn.execute(SQL, params); count += 1
    print(f"✅ shelters seed completed (rows: {count})")

if __name__ == "__main__":
    run()
