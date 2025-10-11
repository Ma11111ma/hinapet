import csv, uuid, os
from sqlalchemy import text
from app.db.session import engine

CSV_PATH = os.path.join(os.path.dirname(__file__), "../../data/shelters_seed.csv")

sql = text("""
INSERT INTO shelters (id, name, address, type, capacity, geom)
VALUES (:id, :name, :address, :type, :capacity,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography)
ON CONFLICT DO NOTHING
""")

def run():
    with engine.begin() as conn, open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            conn.execute(sql, {
                "id": row["id"] or str(uuid.uuid4()),
                "name": row["name"],
                "address": row["address"],
                "type": row["type"],     # companion / accompany
                "capacity": int(row["capacity"] or 0),
                "lat": float(row["lat"]),
                "lng": float(row["lng"]),
            })

if __name__ == "__main__":
    run()
    print("✅ shelters seeding done")
