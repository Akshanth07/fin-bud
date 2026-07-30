import math
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate
from app.repositories.goal_repository import goal_repository
from app.services.dashboard_service import dashboard_service


class GoalService:
    async def get_user_goals(
        self, db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Goal]:
        return await goal_repository.get_multi_by_user(db, user_id=user_id, skip=skip, limit=limit)

    async def get_goal(self, db: AsyncSession, goal_id: UUID, user_id: UUID) -> Optional[Goal]:
        goal = await goal_repository.get_by_id(db, goal_id)
        if goal and goal.user_id == user_id:
            return goal
        return None

    async def create_goal(self, db: AsyncSession, user_id: UUID, obj_in: GoalCreate) -> Goal:
        data = obj_in.model_dump()
        data["user_id"] = user_id
        return await goal_repository.create(db, data)

    async def update_goal(
        self, db: AsyncSession, goal_id: UUID, user_id: UUID, obj_in: GoalUpdate
    ) -> Optional[Goal]:
        goal = await self.get_goal(db, goal_id, user_id)
        if not goal:
            return None
        return await goal_repository.update(
            db, db_obj=goal, obj_in=obj_in.model_dump(exclude_unset=True)
        )

    async def delete_goal(self, db: AsyncSession, goal_id: UUID, user_id: UUID) -> Optional[Goal]:
        goal = await self.get_goal(db, goal_id, user_id)
        if not goal:
            return None
        return await goal_repository.delete(db, id=goal_id)

    async def add_contribution(
        self, db: AsyncSession, goal_id: UUID, user_id: UUID, amount: float
    ) -> Optional[Goal]:
        """Add a contribution amount to a goal's current_amount."""
        goal = await self.get_goal(db, goal_id, user_id)
        if not goal:
            return None

        new_amount = float(goal.current_amount or 0) + amount
        target = float(goal.target_amount or 0)

        update_data: Dict[str, Any] = {"current_amount": round(new_amount, 2)}
        if target > 0 and new_amount >= target:
            update_data["status"] = "achieved"

        return await goal_repository.update(db, db_obj=goal, obj_in=update_data)

    async def get_goal_prediction(
        self, db: AsyncSession, goal_id: UUID, user_id: UUID
    ) -> Optional[Dict[str, Any]]:
        """
        Compute AI-powered goal prediction and recommendation
        using the user's financial profile from the dashboard service.
        """
        goal = await self.get_goal(db, goal_id, user_id)
        if not goal:
            return None

        summary = await dashboard_service.get_user_dashboard_summary(db, user_id)

        target_amount = float(goal.target_amount or 0)
        current_amount = float(goal.current_amount or 0)
        remaining = max(target_amount - current_amount, 0)
        progress_pct = (current_amount / target_amount * 100) if target_amount > 0 else 0

        monthly_income = float(summary.get("monthly_income", 0))
        monthly_expenses = float(summary.get("monthly_expenses", 0))
        monthly_surplus = max(monthly_income - monthly_expenses, 0)
        total_investments = float(summary.get("total_investments", 0))
        savings_rate = float(summary.get("savings_rate", 0))

        # Calculate months remaining to target date
        today = date.today()
        target_date = goal.target_date
        months_remaining = 0
        if target_date and target_date > today:
            months_remaining = (target_date.year - today.year) * 12 + (target_date.month - today.month)

        # Required monthly savings to hit target on time
        required_monthly = 0.0
        if months_remaining > 0:
            required_monthly = remaining / months_remaining
        elif remaining > 0:
            required_monthly = remaining  # Need it all now

        # Predicted completion date based on current surplus
        predicted_months = 0
        predicted_date = None
        if monthly_surplus > 0 and remaining > 0:
            predicted_months = math.ceil(remaining / monthly_surplus)
            predicted_date = date(
                today.year + (today.month + predicted_months - 1) // 12,
                (today.month + predicted_months - 1) % 12 + 1,
                min(today.day, 28)
            )
        elif remaining <= 0:
            predicted_months = 0
            predicted_date = today

        # Success probability
        success_probability = 0.0
        if remaining <= 0:
            success_probability = 100.0
        elif months_remaining > 0 and monthly_surplus > 0:
            ratio = monthly_surplus / required_monthly if required_monthly > 0 else 0
            success_probability = min(ratio * 100, 100)
        elif monthly_surplus > 0:
            success_probability = min((monthly_surplus / remaining) * 100, 95)

        # Goal health score (0-100)
        health_score = 0.0
        if remaining <= 0:
            health_score = 100.0
        elif months_remaining > 0 and monthly_surplus > 0:
            affordability = monthly_surplus / required_monthly if required_monthly > 0 else 0
            health_score = min(affordability * 80, 100)
            # Bonus for having investments as a buffer
            if total_investments > 0:
                buffer_ratio = min(total_investments / target_amount, 1.0)
                health_score = min(health_score + buffer_ratio * 20, 100)
        elif monthly_surplus > 0:
            health_score = min((monthly_surplus / remaining) * 50, 60)

        health_score = round(health_score, 1)

        # Risk level & status
        if health_score >= 70:
            risk_level = "low"
            goal_status = "on_track"
        elif health_score >= 40:
            risk_level = "medium"
            goal_status = "needs_attention"
        else:
            risk_level = "high"
            goal_status = "high_risk"

        if remaining <= 0:
            risk_level = "none"
            goal_status = "achieved"

        # Suggested savings increase
        suggested_increase = 0.0
        if required_monthly > monthly_surplus and monthly_surplus > 0:
            suggested_increase = round(required_monthly - monthly_surplus, 2)

        # AI confidence
        ai_confidence = min(success_probability * 0.9 + (savings_rate * 0.1), 100)

        # Build recommendation text
        recommendation_lines = []
        if monthly_surplus > 0:
            recommendation_lines.append(
                f"You currently save approximately ₹{monthly_surplus:,.0f} every month."
            )
        if required_monthly > 0 and target_date:
            goal_label = goal.goal_name or goal.goal_type.replace("_", " ").title()
            recommendation_lines.append(
                f"To reach your {goal_label} goal of ₹{target_amount:,.0f} before "
                f"{target_date.strftime('%B %Y')}, you should save ₹{required_monthly:,.0f}/month."
            )
        if success_probability > 0:
            recommendation_lines.append(
                f"Based on your current finances, your success probability is {success_probability:.0f}%."
            )
        if suggested_increase > 0:
            recommendation_lines.append(
                f"Increasing your monthly savings by ₹{suggested_increase:,.0f} could help you stay on track."
            )
        if health_score < 40 and remaining > 0:
            recommendation_lines.append(
                "⚠️ Warning: This goal may be unrealistic with your current income and expenses. "
                "Consider extending the target date or reducing the target amount."
            )

        return {
            "goal_id": str(goal.id),
            "goal_name": goal.goal_name,
            "goal_type": goal.goal_type,
            "target_amount": round(target_amount, 2),
            "current_amount": round(current_amount, 2),
            "remaining_amount": round(remaining, 2),
            "progress_percentage": round(progress_pct, 1),
            "monthly_income": round(monthly_income, 2),
            "monthly_expenses": round(monthly_expenses, 2),
            "monthly_surplus": round(monthly_surplus, 2),
            "total_investments": round(total_investments, 2),
            "required_monthly_savings": round(required_monthly, 2),
            "predicted_completion_date": predicted_date.isoformat() if predicted_date else None,
            "predicted_months": predicted_months,
            "months_remaining": months_remaining,
            "success_probability": round(success_probability, 1),
            "health_score": health_score,
            "risk_level": risk_level,
            "goal_status": goal_status,
            "suggested_savings_increase": round(suggested_increase, 2),
            "ai_confidence": round(ai_confidence, 1),
            "recommendation": "\n\n".join(recommendation_lines),
        }


goal_service = GoalService()
