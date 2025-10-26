# backend/tests/test_favorites_crud.py
from __future__ import annotations
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from tests.factories import create_shelter

@pytest.mark.asyncio
async def test_favorites_put_list_delete_flow(client, auth_header, db_session):
    """
    お気に入りCRUDのハッピーパス:
      1) Shelter を1件作成
      2) PUT /favorites/{id} → 200
      3) GET /favorites → 200 & items に含まれる
      4) DELETE /favorites/{id} → 204
      5) GET /favorites → 200 & items が空
    """
    s = create_shelter(db_session, name="CRUD対象", lat=35.1, lng=139.1, type="accompany")
    shelter_id = s["id"]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver", headers=auth_header) as ac:
        # 2) 追加
        r = await ac.put(f"/favorites/{shelter_id}")
        assert r.status_code == 200
        assert r.json().get("ok") is True

        # 3) 一覧（避難所情報なし）
        r = await ac.get("/favorites")
        assert r.status_code == 200
        body = r.json()
        assert "items" in body and isinstance(body["items"], list)
        assert any(item["shelter_id"] == shelter_id for item in body["items"])

        # 4) 削除
        r = await ac.delete(f"/favorites/{shelter_id}")
        assert r.status_code == 204

        # 5) 再取得で空（少なくとも CRUD対象は消えている）
        r = await ac.get("/favorites")
        assert r.status_code == 200
        body = r.json()
        assert not any(item["shelter_id"] == shelter_id for item in body.get("items", []))
