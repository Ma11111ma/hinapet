import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_users_me_authorized(client, db_session):
    """
    Firebaseトークンをモックしているため、Authorizationヘッダを付ければ200想定。
    レスポンスの基本構造（email 等）をゆるめに検証。
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        r = await ac.get("/users/me", headers={"Authorization": "Bearer any.token"})
        assert r.status_code == 200
        body = r.json()
        assert isinstance(body, dict)
        # スキーマはプロジェクト実装に依存するため、代表キーをゆるく検証
        assert "email" in body or "firebase_uid" in body or "id" in body
