from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.scheme import GovernmentScheme, UserSchemeMatch
from app.repositories.base import BaseRepository


class GovernmentSchemeRepository(BaseRepository[GovernmentScheme]):
    def __init__(self):
        super().__init__(GovernmentScheme)

    async def get_active_schemes(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[GovernmentScheme]:
        """Fetch active government schemes."""
        result = await db.execute(
            select(GovernmentScheme)
            .where(GovernmentScheme.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())


class UserSchemeMatchRepository(BaseRepository[UserSchemeMatch]):
    def __init__(self):
        super().__init__(UserSchemeMatch)

    async def get_user_matches(self, db: AsyncSession, user_id: UUID) -> List[UserSchemeMatch]:
        """Fetch scheme matches for a user with joined scheme data."""
        result = await db.execute(
            select(UserSchemeMatch)
            .options(joinedload(UserSchemeMatch.scheme))
            .where(UserSchemeMatch.user_id == user_id)
            .order_by(UserSchemeMatch.eligibility_score.desc())
        )
        return list(result.scalars().all())


scheme_repository = GovernmentSchemeRepository()
user_scheme_match_repository = UserSchemeMatchRepository()
