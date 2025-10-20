# scripts/extract_fujisawa_pdf.py
import os, re, requests, pandas as pd

PDF_URL = "https://bosaiinfo.city.fujisawa.kanagawa.jp/file/attachment/434.pdf"
RAW_DIR = os.path.join("data", "raw")
PDF_PATH = os.path.join(RAW_DIR, "434.pdf")
CSV_PATH = os.path.join(RAW_DIR, "fujisawa_shelters.csv")

os.makedirs(RAW_DIR, exist_ok=True)

def clean(s): return re.sub(r"\s+", " ", str(s or "")).strip()

def download():
    with requests.get(PDF_URL, stream=True, timeout=60) as r:
        r.raise_for_status()
        with open(PDF_PATH, "wb") as f:
            for ch in r.iter_content(8192):
                if ch: f.write(ch)

def try_pdfplumber():
    import pdfplumber
    rows = []
    with pdfplumber.open(PDF_PATH) as pdf:
        for p in pdf.pages:
            for t in p.extract_tables():
                if not t or len(t) < 2: continue
                head = [clean(h) for h in t[0]]
                for r in t[1:]:
                    rows.append(dict(zip(head, [clean(c) for c in r])))
    return rows

def try_camelot():
    import camelot
    rows = []
    tables = camelot.read_pdf(PDF_PATH, pages="all", flavor="stream")
    for t in tables:
        df = t.df
        if df.empty or df.shape[0] < 2: continue
        head = [clean(x) for x in df.iloc[0].tolist()]
        for i in range(1, df.shape[0]):
            rows.append(dict(zip(head, [clean(x) for x in df.iloc[i].tolist()])))
    return rows

def map_row(rec):
    # PDF見出し→アプリ列のマッピング（○→True）
    def has(circle): return "○" in (rec.get(circle) or "")
    return {
        "name": clean(rec.get("名称") or rec.get("施設名")),
        "address": clean(rec.get("住所") or rec.get("所在地")),
        "type": "accompany",  # PDFに種別が無い前提。必要に応じてルール化
        "has_pet_space": has("ペット用避難スペース"),
        "is_emergency_flood": has("洪水（内水氾濫を含む）") or has("洪水"),
        "is_emergency_landslide": has("崖崩れ・地滑り") or has("土砂災害"),
        "is_emergency_tidalwave": has("高潮") or has("津波"),
        "is_emergency_large_fire": has("大規模火災"),
        "has_parking": has("駐車場"),
        "has_barrier_free_toilet": has("バリアフリートイレ"),
        "is_designated_shelter": has("指定避難所"),
        "is_welfare_shelter_primary": has("福祉避難所（一次）"),
        "emergency_space_note": clean(rec.get("避難スペース（部屋等）") or ""),
        "notes": clean(rec.get("備考") or ""),
        "contact_hq": clean(rec.get("連絡先（地区防災拠点本部）") or rec.get("連絡先") or ""),
        "source_asof_date": "2025-04-01",
        "lat": "", "lng": "", "capacity": "", "phone": "", "website_url": "", "pin_icon": "",
    }

def main():
    print("▶ Downloading PDF...")
    download()
    print("▶ Extracting (pdfplumber)...")
    rows = try_pdfplumber()
    if len(rows) < 5:
        print("ℹ️ Switching to Camelot...")
        rows = try_camelot()
    rows = [map_row(r) for r in rows if clean(r.get("名称") or r.get("施設名"))]
    pd.DataFrame(rows).to_csv(CSV_PATH, index=False, encoding="utf-8")
    print(f"✅ 抽出完了: {CSV_PATH}")

if __name__ == "__main__":
    main()
