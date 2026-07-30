from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.insurance import InsurancePolicy
from app.schemas.insurance import InsurancePolicyCreate, InsurancePolicyUpdate
from app.repositories.insurance_repository import insurance_repository
from app.services.user_service import user_service
from app.services.insurance_analysis_service import insurance_analysis_service
from app.services.groq_service import groq_service


class InsuranceService:
    async def get_user_policies(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[InsurancePolicy]:
        return await insurance_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_policy(self, db: AsyncSession, policy_id: UUID, user_id: UUID) -> Optional[InsurancePolicy]:
        policy = await insurance_repository.get_by_id(db, policy_id)
        if policy and policy.user_id == user_id:
            return policy
        return None

    async def create_policy(self, db: AsyncSession, user_id: UUID, obj_in: InsurancePolicyCreate) -> InsurancePolicy:
        data = obj_in.model_dump()
        data["user_id"] = user_id

        # Normalize aliases
        data["company"] = data.get("company") or data.get("provider") or "Insurance Provider"
        data["provider"] = data["company"]
        data["plan_name"] = data.get("plan_name") or data.get("policy_name") or f"{data['company']} Policy"
        data["policy_name"] = data["plan_name"]

        data["premium_amount"] = float(data.get("premium_amount") or data.get("premium") or 0.0)
        data["premium"] = data["premium_amount"]

        if data.get("end_date") and not data.get("renewal_date"):
            data["renewal_date"] = data["end_date"]
        elif data.get("renewal_date") and not data.get("end_date"):
            data["end_date"] = data["renewal_date"]

        # Re-run Groq explanation on creation if not set
        if not data.get("ai_summary"):
            user = await user_service.get_user_by_id(db, user_id)
            user_prof = {"monthly_income": float(user.monthly_income or 0.0)} if user else {}
            analysis = insurance_analysis_service.analyze_user_insurance_portfolio([data], user_prof)
            ai_exp = groq_service.explain_insurance_analysis(data, analysis)
            data["ai_summary"] = ai_exp.get("summary", "")

        return await insurance_repository.create(db, data)

    async def update_policy(
        self, db: AsyncSession, policy_id: UUID, user_id: UUID, obj_in: InsurancePolicyUpdate
    ) -> Optional[InsurancePolicy]:
        policy = await self.get_policy(db, policy_id, user_id)
        if not policy:
            return None

        update_data = obj_in.model_dump(exclude_unset=True)

        if "company" in update_data:
            update_data["provider"] = update_data["company"]
        elif "provider" in update_data:
            update_data["company"] = update_data["provider"]

        if "plan_name" in update_data:
            update_data["policy_name"] = update_data["plan_name"]
        elif "policy_name" in update_data:
            update_data["plan_name"] = update_data["policy_name"]

        if "premium_amount" in update_data:
            update_data["premium"] = update_data["premium_amount"]
        elif "premium" in update_data:
            update_data["premium_amount"] = update_data["premium"]

        if "end_date" in update_data and update_data["end_date"]:
            update_data["renewal_date"] = update_data["end_date"]

        return await insurance_repository.update(
            db, db_obj=policy, obj_in=update_data
        )

    async def delete_policy(self, db: AsyncSession, policy_id: UUID, user_id: UUID) -> Optional[InsurancePolicy]:
        policy = await self.get_policy(db, policy_id, user_id)
        if not policy:
            return None
        return await insurance_repository.delete(db, id=policy_id)

    async def get_user_portfolio_analysis(self, db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        """
        Calculates user-wide portfolio Insurance Health Score, Coverage Gap, and active policies.
        """
        policies = await self.get_user_policies(db, user_id=user_id)
        user = await user_service.get_user_by_id(db, user_id)
        user_prof = {"monthly_income": float(user.monthly_income or 0.0), "annual_income": float(user.annual_income or 0.0)} if user else {}

        pol_dicts = [
            {
                "id": str(p.id),
                "company": p.company or p.provider,
                "policy_type": p.policy_type,
                "plan_name": p.plan_name or p.policy_name,
                "coverage_amount": float(p.coverage_amount or 0.0),
                "premium_amount": float(p.premium_amount or p.premium or 0.0),
                "premium_frequency": p.premium_frequency,
                "start_date": p.start_date.isoformat() if p.start_date else None,
                "end_date": (p.end_date or p.renewal_date).isoformat() if (p.end_date or p.renewal_date) else None,
                "status": p.status,
            }
            for p in policies
        ]

        analysis = insurance_analysis_service.analyze_user_insurance_portfolio(pol_dicts, user_prof)
        return analysis


insurance_service = InsuranceService()
