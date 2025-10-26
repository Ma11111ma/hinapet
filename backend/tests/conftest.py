from __future__ import annotations
import os
from typing import AsyncIterator

import pytest
from httpx import AsyncClient
from sqlalchemy import event
from sqlalchemy.orm import Session

# ---- アプリ読み込み（最初にENVをdevへ） ----
os.environ.setdefault("ENV", "development")
from app.main import app  # noqa
from app.db.session import engine as app_engine, SessionLocal as AppSessionLocal  # noqa

# ---------- DB: 1テスト=1トランザクション巻き戻し ----------
TestingSessionLocal = AppSessionLocal

@pytest.fixture()
def db_session() -> Session:
    """
    SQLAlchemy Session をテスト用に提供。
    各テスト後にロールバックされるためDBは汚れない。
    """
    connection = app_engine.connect()
    trans = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # SAVEPOINT によりネスト開始
    session.begin_nested()

    # outer commit/rollback 後に次の SAVEPOINT を貼り直す
    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans_):
        if trans_.nested and not trans_._parent.nested:
            session.begin_nested()

    try:
        yield session
    finally:
        session.close()
        trans.rollback()
        connection.close()

# ---------- FastAPI: 依存差し替え ----------
@pytest.fixture(autouse=True)
def override_get_db(db_session: Session):
    """
    アプリの get_db 依存をテスト用セッションに差し替える。
    本命は app.core.deps.get_db。互換で app.db.session.get_db があれば同時に差し替える。
    """
    # 本命
    from app.core import deps as deps_module

    def _get_db_for_test():
        try:
            yield db_session
        finally:
            pass  # 片付けは db_session 側で実施

    app.dependency_overrides[deps_module.get_db] = _get_db_for_test

    # 互換（存在する場合のみ）
    try:
        from app.db import session as db_module
        if hasattr(db_module, "get_db"):
            app.dependency_overrides[db_module.get_db] = _get_db_for_test
    except Exception:
        pass

    yield
    app.dependency_overrides.clear()

# ---------- Firebase / Stripe モック ----------
@pytest.fixture(autouse=True)
def mock_firebase(monkeypatch):
    """Firebase Admin SDK の verify を偽装。"""
    def fake_verify(id_token, *args, **kwargs):
        return {
            "uid": "test-uid-123",
            "email": "tester@example.com",
            "claims": {"admin": False, "premium": True},
        }

    try:
        import app.core.firebase_auth as fb
        monkeypatch.setattr(fb.auth, "verify_id_token", fake_verify, raising=True)
    except Exception:
        pass
    yield

@pytest.fixture(autouse=True)
def mock_stripe(monkeypatch):
    """Stripe のAPI呼び出しをダミー化（外部通信しない）。"""
    try:
        import stripe

        class DummySession:
            id = "cs_test_123"
            url = "https://example/checkout"

        def fake_create(**kwargs):
            return DummySession()

        monkeypatch.setattr(stripe.checkout.Session, "create", staticmethod(fake_create), raising=True)
    except Exception:
        pass
    yield

# ---------- HTTP クライアント ----------
from httpx import AsyncClient, ASGITransport

@pytest.fixture()
async def client() -> AsyncIterator[AsyncClient]:
    """httpx v0.24+ では app= は非対応。ASGITransport を使う。"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

# ---------- 便利: 認証ヘッダ ----------
@pytest.fixture()
def auth_header():
    return {"Authorization": "Bearer dummy.token.123"}

# ==== Rate Limiter の Redis 初期化を無効化（sessionスコープ安全版） ====
@pytest.fixture(autouse=True, scope="session")
def _patch_rate_limiter():
    """
    FastAPI-Limiter の init() をダミー化して、起動時に Redis へ接続しないようにする。
    session スコープでも安全なように pytest.MonkeyPatch を直接使う。
    """
    try:
        from fastapi_limiter import FastAPILimiter
    except Exception:
        yield
        return

    mp = pytest.MonkeyPatch()
    async def _fake_init(_redis):
        return None
    mp.setattr(FastAPILimiter, "init", staticmethod(_fake_init), raising=True)
    try:
        yield
    finally:
        mp.undo()
