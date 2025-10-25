import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_shelters_endpoint_exists():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        r = await ac.get("/shelters", params={"lat":35.0, "lng":139.0, "radius":1000})
        # まずは404でないことを担保（後で仕様に合わせて厳密化）
        assert r.status_code != 404
