# backend/app/core/logging.py
from __future__ import annotations

import json
import logging
import re
from datetime import datetime
from typing import Any, Dict

# ---- 置換対象のキー名（小文字で比較）-----------------------------------------
PII_KEYS = {"uid", "email", "authorization", "id_token", "id-token", "x-id-token"}

# よくあるパターン（保守しやすいよう緩め）
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
BEARER_RE = re.compile(r"(Bearer\s+)[A-Za-z0-9._\-+=:/]+", re.IGNORECASE)

def _mask_value(v: Any) -> Any:
    """値をマスク。辞書/配列は再帰的に処理。
    ※ 数値/真偽値は文字列化しない（uvicorn.access の %d 等を壊さないため）
    """
    if isinstance(v, dict):
        return {k: _mask_value(v) for k, v in v.items()}
    if isinstance(v, (list, tuple)):
        return type(v)(_mask_value(x) for x in v)
    if v is None:
        return None
    if isinstance(v, (int, float, bool)):
        return v  # ← ここが重要（%d/%f を壊さない）

    s = str(v)
    s = EMAIL_RE.sub("***", s)
    s = BEARER_RE.sub(r"\1***", s)  # 'Bearer ' は残しつつトークン伏字
    return s

class PIIFilter(logging.Filter):
    """
    LogRecord とメッセージを通過前にスキャンし、PII を "***" に置換する。
    - record.getMessage() に含まれるメールや Bearer トークンをマスク
    - record.args や record.__dict__ 内に PII キーがあればマスク
    """
    def filter(self, record: logging.LogRecord) -> bool:  # True=出力を許可
        # 1) 代表的な属性をマスク
        for key in list(record.__dict__.keys()):
            low = key.lower() if isinstance(key, str) else key
            if isinstance(low, str) and low in PII_KEYS:
                record.__dict__[key] = "***"
            else:
                record.__dict__[key] = _mask_value(record.__dict__[key])

        # 2) printf 形式 (%s など) の引数にも対応
        if isinstance(record.args, dict):
            record.args = {
                k: ("***" if isinstance(k, str) and k.lower() in PII_KEYS else _mask_value(v))
                for k, v in record.args.items()
            }
        elif isinstance(record.args, tuple):
            record.args = tuple(_mask_value(v) for v in record.args)

        # 3) msg 自体が dict 等の場合
        record.msg = _mask_value(record.msg)
        return True

# --------- フォーマッタ（環境別） ---------------------------------------------

class DevFormatter(logging.Formatter):
    default_time_format = "%Y-%m-%d %H:%M:%S"
    def format(self, record: logging.LogRecord) -> str:
        ts = datetime.utcnow().strftime(self.default_time_format)
        trace = getattr(record, "trace_id", None)
        prefix = f"[{ts}] {record.levelname} {record.name}"
        if trace:
            prefix += f" trace_id={trace}"
        return f"{prefix} - {record.getMessage()}"

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "ts": datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        # 代表的な付帯情報も JSON に
        for k in ("trace_id", "path", "method", "status_code", "client"):
            if hasattr(record, k):
                payload[k] = getattr(record, k)
        return json.dumps(payload, ensure_ascii=False)

# --------- 初期化 -------------------------------------------------------------

def setup_logging(env: str | None) -> None:
    """
    使い方: app 起動の一番早いタイミングで呼ぶ。
      setup_logging(os.getenv("ENV") or os.getenv("APP_ENV"))
    - development:  DEV 形式 / DEBUG
    - production :  JSON 形式 / INFO
    """
    mode = (env or "development").lower()
    level = logging.DEBUG if mode == "development" else logging.INFO
    formatter = DevFormatter() if mode == "development" else JsonFormatter()

    # 既存ハンドラをリセット（Uvicorn が先に作っていても上書き）
    root = logging.getLogger()
    for h in list(root.handlers):
        root.removeHandler(h)

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)
    handler.addFilter(PIIFilter())

    root.setLevel(level)
    root.addHandler(handler)

    # Uvicorn 系ロガーにも同じ設定を適用（access/error など）
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        lg = logging.getLogger(name)
        lg.handlers = []
        lg.propagate = True   # ルートに流して統一的に出力
        lg.setLevel(level)

    # 念のため自分のアプリ系にも最低レベルを合わせる
    logging.getLogger("app").setLevel(level)
