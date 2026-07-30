from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.loan import Loan
from app.schemas.loan import LoanCreate, LoanUpdate
from app.repositories.loan_repository import loan_repository


class LoanService:
    async def get_user_loans(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Loan]:
        return await loan_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_loan(self, db: AsyncSession, loan_id: UUID, user_id: UUID) -> Optional[Loan]:
        loan = await loan_repository.get_by_id(db, loan_id)
        if loan and loan.user_id == user_id:
            return loan
        return None

    async def create_loan(self, db: AsyncSession, user_id: UUID, obj_in: LoanCreate) -> Loan:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await loan_repository.create(db, data)

    async def update_loan(
        self, db: AsyncSession, loan_id: UUID, user_id: UUID, obj_in: LoanUpdate
    ) -> Optional[Loan]:
        loan = await self.get_loan(db, loan_id, user_id)
        if not loan:
            return None
        return await loan_repository.update(
            db, db_obj=loan, obj_in=obj_in.model_dump(exclude_unset=True)
        )

    async def delete_loan(self, db: AsyncSession, loan_id: UUID, user_id: UUID) -> Optional[Loan]:
        loan = await self.get_loan(db, loan_id, user_id)
        if not loan:
            return None
        return await loan_repository.delete(db, id=loan_id)


loan_service = LoanService()
