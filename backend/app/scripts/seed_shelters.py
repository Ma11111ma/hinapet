# backend/app/scripts/seed_shelters.py （フル修正版）
import sys, os, csv, uuid
from sqlalchemy import text
from app.db.session import engine

CSV_PATH = os.path.join(os.path.dirname(__file__), "../../data/shelters_seed.csv")

sql = text("""
INSERT INTO shelters (id, name, address, type, capacity, geom)
VALUES (:id, :name, :address, :type, :capacity,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    address = EXCLUDED.address,
    type = EXCLUDED.type,
    capacity = EXCLUDED.capacity,
    geom = EXCLUDED.geom
""")

def stable_uuid(row: dict) -> uuid.UUID:
    # CSVでidが空なら name+address+type を材料にUUID5を生成（安定）
    ns = uuid.UUID("00000000-0000-0000-0000-000000000000")
    key = f'{row.get("name","")}|{row.get("address","")}|{row.get("type","")}'.strip()
    return uuid.uuid5(ns, key)

def run():
    with engine.begin() as conn, open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            lat = float(row["lat"])
            lng = float(row["lng"])
            # ざっくりバリデーション（日本の範囲に近いか）
            assert 20.0 <= lat <= 46.0, f"lat out of range: {lat}"
            assert 120.0 <= lng <= 154.0, f"lng out of range: {lng}"
            sid = row["id"].strip() if row.get("id") else None
            sid = sid or str(stable_uuid(row))
            conn.execute(sql, {
                "id": sid,
                "name": row["name"],
                "address": row["address"],
                "type": row["type"],     # companion / accompany
                "capacity": int(row["capacity"] or 0),
                "lat": lat,              # ← CSVはlat,lng
                "lng": lng,              # ← ST_MakePointはlng,latで呼び出す（正）
            })

if __name__ == "__main__":
    run()
    print("✅ shelters seeding done")
