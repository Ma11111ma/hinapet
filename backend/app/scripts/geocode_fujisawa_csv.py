# app/scripts/geocode_fujisawa_csv.py
from __future__ import annotations
import os, json, time, re
from pathlib import Path
from typing import Optional, Tuple
import pandas as pd

RAW_CSV = Path("data/raw/fujisawa_shelters.csv")
OUT_CSV = Path("data/processed/fujisawa_shelters_with_geo.csv")
UNRESOLVED_CSV = Path("data/processed/fujisawa_unresolved.csv")
CACHE_JSON = Path("data/processed/geocode_cache.json")
ERROR_LOG = Path("data/processed/errors.log")

GOOGLE_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# -----------------------
# 住所の正規化
# -----------------------
def normalize_address(addr: str) -> str:
    a = str(addr or "").strip()
    if not a:
        return a
    # 【…】や（…）や周辺/他 を削除
    a = re.sub(r"【.*?】", "", a)
    a = re.sub(r"（.*?）", "", a)
    a = re.sub(r"(周辺|他)$", "", a)
    a = a.replace("　", " ").strip()
    # 既に市区町村があればOK、なければ付与
    if "藤沢" not in a and "藤沢市" not in a:
        a = f"藤沢市{a}"
    if not a.startswith("神奈川県"):
        a = f"神奈川県{a}"
    return a

def load_cache():
    return json.loads(CACHE_JSON.read_text(encoding="utf-8")) if CACHE_JSON.exists() else {}

def save_cache(c):
    CACHE_JSON.parent.mkdir(parents=True, exist_ok=True)
    CACHE_JSON.write_text(json.dumps(c, ensure_ascii=False, indent=2), encoding="utf-8")

def log_err(msg):
    ERROR_LOG.parent.mkdir(parents=True, exist_ok=True)
    with ERROR_LOG.open("a", encoding="utf-8") as f:
        f.write(msg + "\n")

# -----------------------
# Google → Nominatim の順で照会
# -----------------------
def geocode_google(addr: str) -> Optional[Tuple[float,float]]:
    import requests
    # components で日本/神奈川/藤沢を強める
    params = {
        "address": addr,
        "key": GOOGLE_KEY,
        "language": "ja",
        "region": "jp",
        "components": "country:JP|administrative_area_level_1:神奈川県|locality:藤沢市",
    }
    r = requests.get("https://maps.googleapis.com/maps/api/geocode/json",
                     params=params, timeout=25)
    r.raise_for_status()
    data = r.json()
    if data.get("status") != "OK":
        return None
    loc = data["results"][0]["geometry"]["location"]
    return float(loc["lat"]), float(loc["lng"])

def geocode_nominatim(addr: str) -> Optional[Tuple[float,float]]:
    from geopy.geocoders import Nominatim
    from geopy.extra.rate_limiter import RateLimiter
    if not hasattr(geocode_nominatim, "_geo"):
        geocode_nominatim._geo = Nominatim(user_agent="fujisawa-geocoder")
        geocode_nominatim._rate = RateLimiter(
            geocode_nominatim._geo.geocode,
            min_delay_seconds=1.2,  # 呼び過ぎ防止
            swallow_exceptions=False
        )
    loc = geocode_nominatim._rate(addr)
    return (float(loc.latitude), float(loc.longitude)) if loc else None

def geocode(addr: str, cache: dict) -> Optional[Tuple[float,float]]:
    raw = (addr or "").strip()
    if not raw:
        return None
    norm = normalize_address(raw)
    if norm in cache:
        return cache[norm]
    try:
        latlng = geocode_google(norm) if GOOGLE_KEY else None
        if not latlng:
            latlng = geocode_nominatim(norm + ", Japan")
        if latlng:
            cache[norm] = latlng
            return latlng
        log_err(f"NOT_FOUND: {raw} -> {norm}")
    except Exception as e:
        log_err(f"ERROR: {raw} -> {norm} -> {e}")
    return None

def main():
    if not RAW_CSV.exists():
        raise SystemExit(f"CSV missing: {RAW_CSV}")
    # 毎回リセットしたい時はコメントアウト解除
    # if CACHE_JSON.exists(): CACHE_JSON.unlink()

    df = pd.read_csv(RAW_CSV)
    cache = load_cache()
    lats, lngs = [], []
    unresolved_rows = []

    for _, r in df.iterrows():
        # 既に lat/lng があるならそれを採用
        if "lat" in df.columns and "lng" in df.columns and pd.notna(r.get("lat")) and pd.notna(r.get("lng")):
            lats.append(r["lat"]); lngs.append(r["lng"]); continue
        g = geocode(str(r.get("address") or ""), cache)
        if g:
            lats.append(g[0]); lngs.append(g[1])
        else:
            lats.append(None); lngs.append(None)
            unresolved_rows.append({"name": r.get("name"), "address": r.get("address")})
        time.sleep(0.2)  # API叩きすぎ防止

    df["lat"], df["lng"] = lats, lngs
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    save_cache(cache)

    if unresolved_rows:
        pd.DataFrame(unresolved_rows).to_csv(UNRESOLVED_CSV, index=False, encoding="utf-8")

    print(f"✅ 抽出完了: {OUT_CSV}")
    if unresolved_rows:
        print(f"⚠ 未解決 {len(unresolved_rows)} 件 → {UNRESOLVED_CSV} を確認してください")

if __name__ == "__main__":
    main()
