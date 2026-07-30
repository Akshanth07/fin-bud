from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from uuid import UUID
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get_by_id(self, db: AsyncSession, id: UUID) -> Optional[ModelType]:
        """Fetch a single record by primary key UUID."""
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """Fetch multiple records with limit and offset."""
        query = select(self.model).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_multi_by_user(
        self,
        db: AsyncSession,
        *,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        """Fetch multiple records belonging to a specific user_id."""
        if hasattr(self.model, "user_id"):
            query = (
                select(self.model)
                .where(getattr(self.model, "user_id") == user_id)
                .offset(skip)
                .limit(limit)
            )
            result = await db.execute(query)
            return list(result.scalars().all())
        return []

    async def count_by_user(self, db: AsyncSession, user_id: UUID) -> int:
        """Count total records for a user."""
        if hasattr(self.model, "user_id"):
            query = select(func.count()).select_from(self.model).where(getattr(self.model, "user_id") == user_id)
            result = await db.execute(query)
            return result.scalar_one()
        return 0

    async def count(self, db: AsyncSession) -> int:
        """Count total records in table."""
        query = select(func.count()).select_from(self.model)
        result = await db.execute(query)
        return result.scalar_one()

    async def create(self, db: AsyncSession, obj_in: Dict[str, Any]) -> ModelType:
        """Create and return a new record."""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: Dict[str, Any]
    ) -> ModelType:
        """Update an existing record."""
        for field, value in obj_in.items():
            if value is not None and hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, *, id: UUID) -> Optional[ModelType]:
        """Delete a record by ID and return it if existed."""
        db_obj = await self.get_by_id(db, id)
        if db_obj:
            await db.delete(db_obj)
            await db.flush()
        return db_obj
