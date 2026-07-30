from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.repositories.expense_repository import expense_repository


class ExpenseService:
    async def get_user_expenses(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Expense]:
        return await expense_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_expense(self, db: AsyncSession, expense_id: UUID, user_id: UUID) -> Optional[Expense]:
        expense = await expense_repository.get_by_id(db, expense_id)
        if expense and expense.user_id == user_id:
            return expense
        return None

    async def create_expense(self, db: AsyncSession, user_id: UUID, obj_in: ExpenseCreate) -> Expense:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await expense_repository.create(db, data)

    async def update_expense(
        self, db: AsyncSession, expense_id: UUID, user_id: UUID, obj_in: ExpenseUpdate
    ) -> Optional[Expense]:
        expense = await self.get_expense(db, expense_id, user_id)
        if not expense:
            return None
        return await expense_repository.update(
            db, db_obj=expense, obj_in=obj_in.model_dump(exclude_unset=True)
        )

    async def delete_expense(self, db: AsyncSession, expense_id: UUID, user_id: UUID) -> Optional[Expense]:
        expense = await self.get_expense(db, expense_id, user_id)
        if not expense:
            return None
        return await expense_repository.delete(db, id=expense_id)


expense_service = ExpenseService()
