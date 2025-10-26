# backend/tests/test_favorites_idempotent.py
from __future__ import annotations
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from tests.factories import create_shelter

@pytest.mark.asyncio
async def test_favorites_put_idempotent(client, auth_header, db_session):
    """
    同一 shelter_id を複数回 PUT しても 200 が返る（ON CONFLICT DO NOTHING）。
    """
    s = create_shelter(db_session, name="冪等PUT", lat=35.25, lng=139.25, type="accompany")
    shelter_id = s["id"]

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver", headers=auth_header) as ac:
        r1 = await ac.put(f"/favorites/{shelter_id}")
        r2 = await ac.put(f"/favorites/{shelter_id}")
        assert r1.status_code == 200
        assert r2.status_code == 200
        assert r2.json().get("ok") is True
