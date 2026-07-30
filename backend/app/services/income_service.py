from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.income import IncomeSource
from app.schemas.income import IncomeSourceCreate, IncomeSourceUpdate
from app.repositories.income_repository import income_repository


class IncomeService:
    async def get_user_income_sources(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[IncomeSource]:
        return await income_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_income_source(self, db: AsyncSession, income_id: UUID, user_id: UUID) -> Optional[IncomeSource]:
        income = await income_repository.get_by_id(db, income_id)
        if income and income.user_id == user_id:
            return income
        return None

    async def create_income_source(self, db: AsyncSession, user_id: UUID, obj_in: IncomeSourceCreate) -> IncomeSource:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await income_repository.create(db, data)

    async def update_income_source(
        self, db: AsyncSession, income_id: UUID, user_id: UUID, obj_in: IncomeSourceUpdate
    ) -> Optional[IncomeSource]:
        income = await self.get_income_source(db, income_id, user_id)
        if not income:
            return None
        return await income_repository.update(
            db, db_obj=income, obj_in=obj_in.model_dump(exclude_unset=True)
        )

    async def delete_income_source(self, db: AsyncSession, income_id: UUID, user_id: UUID) -> Optional[IncomeSource]:
        income = await self.get_income_source(db, income_id, user_id)
        if not income:
            return None
        return await income_repository.delete(db, id=income_id)


income_service = IncomeService()
