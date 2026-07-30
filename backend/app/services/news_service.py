from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.news import MarketNews
from app.schemas.news import MarketNewsCreate
from app.repositories.news_repository import news_repository


class MarketNewsService:
    async def get_latest_news(self, db: AsyncSession, limit: int = 20) -> List[MarketNews]:
        return await news_repository.get_latest_news(db, limit=limit)

    async def get_news_by_id(self, db: AsyncSession, news_id: UUID) -> Optional[MarketNews]:
        return await news_repository.get_by_id(db, news_id)

    async def create_news(self, db: AsyncSession, obj_in: MarketNewsCreate) -> MarketNews:
        return await news_repository.create(db, obj_in.model_dump())


news_service = MarketNewsService()
