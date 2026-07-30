from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.user_repository import user_repository


class UserService:
    async def get_user_by_id(self, db: AsyncSession, user_id: UUID) -> Optional[User]:
        return await user_repository.get_by_id(db, user_id)

    async def get_or_create_user(self, db: AsyncSession, user_id: UUID, email: str, full_name: Optional[str] = None) -> User:
        user = await user_repository.get_by_id(db, user_id)
        if user:
            return user

        if email:
            user_by_email = await user_repository.get_by_email(db, email)
            if user_by_email:
                return user_by_email

        try:
            created_user = await user_repository.create(db, {
                "id": user_id,
                "email": email,
                "full_name": full_name or ""
            })
            await db.commit()
            return created_user
        except Exception:
            await db.rollback()
            user = await user_repository.get_by_id(db, user_id)
            if user:
                return user
            raise

    async def update_user(self, db: AsyncSession, user_id: UUID, user_in: UserUpdate) -> Optional[User]:
        user = await user_repository.get_by_id(db, user_id)
        if not user:
            return None
        return await user_repository.update(db, db_obj=user, obj_in=user_in.model_dump(exclude_unset=True))


user_service = UserService()
