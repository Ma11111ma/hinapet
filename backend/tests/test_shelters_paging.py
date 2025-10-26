import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from tests.factories import create_shelter

@pytest.mark.asyncio
async def test_shelters_radius_edge(client, db_session):
    """
    半径の境界テスト（フレーク回避版）:
    中心から約1.1kmの点を置いて、
      radius=0.99km  -> 0件
      radius=1.20km  -> >=1件
    とする（余裕を持たせる）
    """
    base_lat, base_lng = 35.000000, 139.000000

    # 緯度1度 ≒ 111.132km 前後。0.010度 ≒ 1.11km（安全に1km超）
    delta_deg = 0.0100
    create_shelter(
        db_session,
        name="境界施設",
        lat=base_lat + delta_deg,
        lng=base_lng,
        type="accompany",
    )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        # 1km未満 → 0件（0.99km）
        r_small = await ac.get("/shelters", params={
            "lat": base_lat, "lng": base_lng, "radius": 0.99, "limit": 50
        })
        assert r_small.status_code == 200
        items_small = r_small.json()["items"]
        assert isinstance(items_small, list) and len(items_small) == 0

        # 1km超 → >=1件（1.20km）
        r_big = await ac.get("/shelters", params={
            "lat": base_lat, "lng": base_lng, "radius": 1.20, "limit": 50
        })
        assert r_big.status_code == 200
        items_big = r_big.json()["items"]
        assert isinstance(items_big, list) and len(items_big) >= 1
