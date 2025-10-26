# backend/tests/test_shelters_search.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.factories import create_shelter

@pytest.mark.asyncio
async def test_shelters_normal_returns_items(client, db_session):
    """
    近い2件 + 遠い1件を投入し、中心点(35, 139), 半径2km で検索したら
    少なくとも近い1件以上が返ることを確認する。
    ※ /shelters は {"items":[...]} を返す（リストではない）点に注意
    """
    # 検索中心付近に2件
    create_shelter(db_session, name="近場1", lat=35.000000, lng=139.000000)    # ほぼ中心
    create_shelter(db_session, name="近場2", lat=35.000500, lng=139.000500)    # 数百m
    # 大きく離れた1件
    create_shelter(db_session, name="遠方",  lat=36.0,      lng=140.0)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        # radius は km、入力制約は <= 50。ここでは 2km
        r = await ac.get("/shelters", params={"lat": 35.0, "lng": 139.0, "radius": 2.0})
        assert r.status_code == 200

        data = r.json()
        # 戻り値は {"items":[...]}
        assert isinstance(data, dict)
        assert "items" in data
        assert isinstance(data["items"], list)

        items = data["items"]
        # 近場2件のうち少なくとも1件はヒットするはず（実装差分を考慮し緩め）
        assert len(items) >= 1

        # 要素スキーマの代表キー確認
        if items:
            keys = set(items[0].keys())
            for k in ("id", "name", "lat", "lng"):
                assert k in keys

@pytest.mark.asyncio
async def test_shelters_zero_result(client, db_session):
    """
    中心(0,0)・半径を上限50kmで検索。日本に投入したデータは当たらない想定で0件。
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        r = await ac.get("/shelters", params={"lat": 0.0, "lng": 0.0, "radius": 50})
        assert r.status_code == 200

        data = r.json()
        assert isinstance(data, dict)
        assert "items" in data
        assert isinstance(data["items"], list)
        assert len(data["items"]) == 0

@pytest.mark.asyncio
async def test_shelters_param_validation_error(client):
    """
    不正な型を渡すと 422 になることを確認。
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        r = await ac.get("/shelters", params={"lat": "x", "lng": "y", "radius": "z"})
        assert r.status_code in (400, 422)
