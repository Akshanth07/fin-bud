import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_unauthorized_access_returns_403_or_401(async_client: AsyncClient):
    """Test that calling protected endpoints without authorization header returns HTTP 403/401."""
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_invalid_bearer_token_returns_401(async_client: AsyncClient):
    """Test that calling with invalid Bearer token returns 401 Unauthorized."""
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    response = await async_client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401
