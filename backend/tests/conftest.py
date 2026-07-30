import pytest
import pytest_asyncio
from unittest.mock import AsyncMock
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.core.database import get_db


@pytest_asyncio.fixture(scope="function")
async def mock_db_session():
    """Mock AsyncSession for FastAPI endpoint unit tests."""
    session = AsyncMock(spec=AsyncSession)
    session.execute.return_value = AsyncMock()
    yield session


@pytest_asyncio.fixture(scope="function")
async def async_client(mock_db_session: AsyncSession):
    """Async test client with get_db dependency overridden."""
    async def _override_get_db():
        yield mock_db_session

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

    app.dependency_overrides.clear()
