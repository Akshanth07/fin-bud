from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.scheme import GovernmentScheme, SavedScheme
from app.models.user import User
from app.services.user_service import user_service
from app.services.goal_service import goal_service
from app.services.eligibility_service import eligibility_service
from app.services.recommendation_service import recommendation_service


class SchemeService:
    async def get_all_schemes(
        self,
        db: AsyncSession,
        category: Optional[str] = None,
        state: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[GovernmentScheme]:
        query = select(GovernmentScheme).where(GovernmentScheme.status == "ACTIVE")

        if category and category.lower() != "all":
            query = query.where(GovernmentScheme.category == category)
        if state and state.lower() != "all":
            query = query.where(GovernmentScheme.state.in_([state, "All", "National"]))
        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.where(
                GovernmentScheme.name.ilike(term)
                | GovernmentScheme.description.ilike(term)
                | GovernmentScheme.ministry.ilike(term)
            )

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_scheme_by_id(self, db: AsyncSession, scheme_id: UUID) -> Optional[GovernmentScheme]:
        result = await db.execute(select(GovernmentScheme).where(GovernmentScheme.id == scheme_id))
        return result.scalars().first()

    async def get_personalized_recommendations(
        self,
        db: AsyncSession,
        user_id: UUID,
        category: Optional[str] = None,
        state: Optional[str] = None,
        eligible_only: bool = False,
        search: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        # Fetch user profile & goals
        user = await user_service.get_user_by_id(db, user_id)
        goals = await goal_service.get_user_goals(db, user_id=user_id, limit=100)
        saved_schemes = await self.get_user_saved_schemes(db, user_id=user_id)
        saved_map = {s.scheme_id: s.application_status for s in saved_schemes}

        user_profile_dict = {
            "monthly_income": float(user.monthly_income or 0.0) if user else 0.0,
            "annual_income": float(user.annual_income or 0.0) if user else 0.0,
            "monthly_expenses": float(user.monthly_expenses or 0.0) if user else 0.0,
            "savings": float(user.savings or 0.0) if user else 0.0,
            "emergency_fund": float(user.emergency_fund or 0.0) if user else 0.0,
            "gender": user.gender or "Any" if user else "Any",
            "occupation": user.occupation or "Any" if user else "Any",
            "state": user.state or "All" if user else "All",
            "date_of_birth": user.date_of_birth if user else None,
        }

        user_goals_dicts = [
            {
                "goal_name": g.goal_name,
                "goal_type": getattr(g, "goal_type", "custom"),
                "target_amount": float(g.target_amount or 0.0)
            }
            for g in goals
        ]

        # Fetch active schemes
        schemes = await self.get_all_schemes(db, category=category, state=state, search=search, limit=200)

        recommendations = []
        for s in schemes:
            s_dict = {
                "id": str(s.id),
                "scheme_code": s.scheme_code,
                "name": s.name,
                "category": s.category,
                "description": s.description,
                "benefits": s.benefits or {},
                "eligibility_rules": s.eligibility_rules or {},
                "eligibility_summary": s.eligibility_summary,
                "official_url": s.official_url,
                "documents_required": s.documents_required or [],
                "application_process": s.application_process or [],
                "state": s.state,
                "ministry": s.ministry,
                "source": s.source,
                "deadline": s.deadline,
                "status": s.status,
            }

            eligibility_res = eligibility_service.calculate_eligibility(user_profile_dict, s_dict)
            rec_res = recommendation_service.compute_priority_score(user_profile_dict, s_dict, user_goals_dicts, eligibility_res)

            if eligible_only and not rec_res["eligible"]:
                continue

            item_data = {
                **s_dict,
                "priority_score": rec_res["priority_score"],
                "eligibility_percentage": rec_res["eligibility_percentage"],
                "eligible": rec_res["eligible"],
                "reasons": rec_res["reasons"],
                "estimated_financial_benefit": rec_res["estimated_financial_benefit"],
                "goal_matched": rec_res["goal_matched"],
                "is_saved": s.id in saved_map,
                "saved_status": saved_map.get(s.id),
            }
            recommendations.append(item_data)

        # Sort by Priority Score descending
        recommendations.sort(key=lambda x: x["priority_score"], reverse=True)
        return recommendations[:limit]

    async def get_user_saved_schemes(self, db: AsyncSession, user_id: UUID) -> List[SavedScheme]:
        query = (
            select(SavedScheme)
            .options(selectinload(SavedScheme.scheme))
            .where(SavedScheme.user_id == user_id)
            .order_by(SavedScheme.saved_at.desc())
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    async def save_scheme(self, db: AsyncSession, user_id: UUID, scheme_id: UUID, status: str = "Interested") -> SavedScheme:
        query = select(SavedScheme).where(SavedScheme.user_id == user_id, SavedScheme.scheme_id == scheme_id)
        result = await db.execute(query)
        existing = result.scalars().first()

        if existing:
            existing.application_status = status
            await db.commit()
            await db.refresh(existing)
            return existing

        saved = SavedScheme(
            user_id=user_id,
            scheme_id=scheme_id,
            application_status=status
        )
        db.add(saved)
        await db.commit()
        await db.refresh(saved)
        return saved

    async def unsave_scheme(self, db: AsyncSession, user_id: UUID, scheme_id: UUID) -> bool:
        query = delete(SavedScheme).where(SavedScheme.user_id == user_id, SavedScheme.scheme_id == scheme_id)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0

    async def update_saved_status(self, db: AsyncSession, user_id: UUID, scheme_id: UUID, status: str) -> Optional[SavedScheme]:
        query = select(SavedScheme).where(SavedScheme.user_id == user_id, SavedScheme.scheme_id == scheme_id)
        result = await db.execute(query)
        existing = result.scalars().first()

        if not existing:
            return None

        existing.application_status = status
        await db.commit()
        await db.refresh(existing)
        return existing


GovernmentSchemeService = SchemeService
scheme_service = SchemeService()

