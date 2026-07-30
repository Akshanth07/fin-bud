from datetime import date
from typing import Any, Dict, List
from app.services.eligibility_service import eligibility_service


class RecommendationService:
    """
    Weighted Recommendation Engine for Government Schemes (No LLM).
    Calculates personalized Priority Score (0 to 100) using:
    - Eligibility (+50)
    - Financial Goal Match (+20)
    - Category Priority (+10)
    - Financial Need (+10)
    - State Match (+5)
    - Age Priority (+5)
    """

    # Goal-to-Category Mapping
    GOAL_CATEGORY_MAP = {
        "house": ["Housing", "Real Estate"],
        "retirement": ["Pension", "Investment & Pension", "Investment"],
        "education": ["Education", "Education & Scholarship", "Scholarship"],
        "emergency_fund": ["Health Insurance", "Insurance", "Social Welfare"],
        "wedding": ["Social Security", "Child Welfare"],
        "car": ["Insurance", "General"],
        "vacation": ["General"],
        "custom": ["General"]
    }

    def compute_priority_score(
        self,
        user_profile: Dict[str, Any],
        scheme: Dict[str, Any],
        user_goals: List[Dict[str, Any]],
        eligibility_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        is_eligible = eligibility_result.get("eligible", False)
        eligibility_pct = eligibility_result.get("eligibility_percentage", 0.0)
        reasons = list(eligibility_result.get("reasons", []))

        score = 0.0

        # 1. Eligibility Weight (max 50 pts)
        if is_eligible:
            score += 50.0
        else:
            score += (eligibility_pct / 100.0) * 20.0

        # 2. Goal Match Weight (max 20 pts)
        scheme_category = str(scheme.get("category", "")).strip()
        has_goal_match = False
        matched_goal_name = ""

        for goal in user_goals:
            g_type = str(goal.get("goal_type", "")).lower()
            allowed_cats = self.GOAL_CATEGORY_MAP.get(g_type, [])
            if any(cat.lower() in scheme_category.lower() or scheme_category.lower() in cat.lower() for cat in allowed_cats):
                has_goal_match = True
                matched_goal_name = goal.get("goal_name") or g_type.replace("_", " ").title()
                break

        if has_goal_match:
            score += 20.0
            reasons.append(f"🎯 Directly aligns with your '{matched_goal_name}' financial goal")

        # 3. Category Priority Weight (max 10 pts)
        if scheme_category in ["Health Insurance", "Housing", "Pension", "Agriculture"]:
            score += 10.0
        else:
            score += 5.0

        # 4. Financial Need Weight (max 10 pts)
        monthly_income = float(user_profile.get("monthly_income", 0) or 0)
        monthly_expenses = float(user_profile.get("monthly_expenses", 0) or 0)
        savings = float(user_profile.get("savings", 0) or 0)
        emergency_fund = float(user_profile.get("emergency_fund", 0) or 0)

        need_score = 0.0
        if monthly_income > 0 and monthly_income <= 50000:
            need_score += 4.0
        if (savings + emergency_fund) < (monthly_expenses * 3) and monthly_expenses > 0:
            need_score += 4.0
            if scheme_category in ["Health Insurance", "Insurance", "Direct Benefit Transfer"]:
                reasons.append("⚡ Low emergency savings — scheme provides critical safety net")
        if need_score > 0:
            score += min(need_score + 2.0, 10.0)

        # 5. State Match Weight (max 5 pts)
        user_state = str(user_profile.get("state", "All")).strip().lower()
        scheme_state = str(scheme.get("state", "All")).strip().lower()

        if user_state != "all" and user_state == scheme_state:
            score += 5.0
            reasons.append(f"📌 Tailored specifically for {scheme.get('state')} residents")
        elif scheme_state in ["all", "national"]:
            score += 3.0

        # 6. Age Priority Weight (max 5 pts)
        dob = user_profile.get("date_of_birth")
        user_age = 30
        if dob:
            if isinstance(dob, str):
                try:
                    dob = date.fromisoformat(dob)
                except ValueError:
                    dob = None
            if isinstance(dob, date):
                today = date.today()
                user_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

        if user_age >= 60 and "Senior Citizens" in str(scheme.get("name", "")):
            score += 5.0
        elif user_age <= 25 and scheme_category in ["Education", "Education & Scholarship"]:
            score += 5.0

        final_priority = round(min(score, 100.0), 1)

        # Estimate financial benefit
        benefits = scheme.get("benefits") or {}
        estimated_financial_benefit = 0.0
        if isinstance(benefits, dict):
            amt = benefits.get("amount") or benefits.get("max_subsidy") or benefits.get("coverage_amount")
            if amt and isinstance(amt, (int, float)):
                estimated_financial_benefit = float(amt)

        return {
            "priority_score": final_priority,
            "eligibility_percentage": eligibility_pct,
            "eligible": is_eligible,
            "reasons": reasons,
            "estimated_financial_benefit": estimated_financial_benefit,
            "goal_matched": has_goal_match,
        }


recommendation_service = RecommendationService()
