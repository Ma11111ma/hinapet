# backend/tests/test_favorites_with_shelter.py
from __future__ import annotations
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from tests.factories import create_shelter

@pytest.mark.asyncio
async def test_favorites_list_with_shelter(client, auth_header, db_session):
    """
    include_shelter=True で、name/address/type/lat/lng が一緒に返ること。
    """
    s = create_shelter(db_session, name="一覧に詳細", lat=35.2, lng=139.2, type="companion")
    shelter_id = s["id"]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver", headers=auth_header) as ac:
        # 事前に登録
        r = await ac.put(f"/favorites/{shelter_id}")
        assert r.status_code == 200

        # include_shelter=True で一覧
        r = await ac.get("/favorites", params={"include_shelter": "true"})
        assert r.status_code == 200
        data = r.json()
        assert "items" in data and isinstance(data["items"], list)

        # 期待フィールドが含まれる
        found = next((i for i in data["items"] if i["shelter_id"] == shelter_id), None)
        assert found is not None
        for k in ("name", "type", "lat", "lng"):
            assert k in found
