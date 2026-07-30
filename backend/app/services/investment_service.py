from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.investment import Investment
from app.schemas.investment import InvestmentCreate, InvestmentUpdate
from app.repositories.investment_repository import investment_repository


class InvestmentService:
    async def get_user_investments(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Investment]:
        return await investment_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_investment(self, db: AsyncSession, investment_id: UUID, user_id: UUID) -> Optional[Investment]:
        investment = await investment_repository.get_by_id(db, investment_id)
        if investment and investment.user_id == user_id:
            return investment
        return None

    async def create_investment(self, db: AsyncSession, user_id: UUID, obj_in: InvestmentCreate) -> Investment:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await investment_repository.create(db, data)

    async def update_investment(
        self, db: AsyncSession, investment_id: UUID, user_id: UUID, obj_in: InvestmentUpdate
    ) -> Optional[Investment]:
        investment = await self.get_investment(db, investment_id, user_id)
        if not investment:
            return None
        return await investment_repository.update(
            db, db_obj=investment, obj_in=obj_in.model_dump(exclude_unset=True)
        )

    async def delete_investment(self, db: AsyncSession, investment_id: UUID, user_id: UUID) -> Optional[Investment]:
        investment = await self.get_investment(db, investment_id, user_id)
        if not investment:
            return None
        return await investment_repository.delete(db, id=investment_id)


investment_service = InvestmentService()
