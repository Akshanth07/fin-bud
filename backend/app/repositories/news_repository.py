from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.news import MarketNews
from app.repositories.base import BaseRepository


class MarketNewsRepository(BaseRepository[MarketNews]):
    def __init__(self):
        super().__init__(MarketNews)

    async def get_latest_news(self, db: AsyncSession, limit: int = 20) -> List[MarketNews]:
        """Fetch latest published market news."""
        result = await db.execute(
            select(MarketNews)
            .order_by(MarketNews.published_at.desc().nullslast(), MarketNews.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())


news_repository = MarketNewsRepository()
