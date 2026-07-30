from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.insight import AIInsight
from app.schemas.insight import AIInsightCreate
from app.repositories.insight_repository import insight_repository


class AIInsightService:
    async def get_user_insights(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[AIInsight]:
        return await insight_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_insight_by_id(self, db: AsyncSession, insight_id: UUID, user_id: UUID) -> Optional[AIInsight]:
        insight = await insight_repository.get_by_id(db, insight_id)
        if insight and insight.user_id == user_id:
            return insight
        return None

    async def create_insight(self, db: AsyncSession, user_id: UUID, obj_in: AIInsightCreate) -> AIInsight:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await insight_repository.create(db, data)

    async def delete_insight(self, db: AsyncSession, insight_id: UUID, user_id: UUID) -> Optional[AIInsight]:
        insight = await self.get_insight_by_id(db, insight_id, user_id)
        if not insight:
            return None
        return await insight_repository.delete(db, id=insight_id)


insight_service = AIInsightService()
