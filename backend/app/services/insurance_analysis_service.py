from datetime import date
from typing import Any, Dict, List, Optional


class InsuranceAnalysisService:
    """
    Deterministic Insurance Rule Engine.
    Calculates Coverage Status, Portfolio Coverage Gap, Premium Affordability,
    and Insurance Health Score (0–100).
    """

    REQUIRED_TYPES = [
        "Health Insurance",
        "Term Life Insurance",
        "Personal Accident Insurance",
        "Vehicle Insurance",
        "Travel Insurance",
    ]

    def analyze_user_insurance_portfolio(
        self,
        policies: List[Dict[str, Any]],
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        user_profile = user_profile or {}
        monthly_income = float(user_profile.get("monthly_income", 0) or 0)
        annual_income = monthly_income * 12 if monthly_income > 0 else float(user_profile.get("annual_income", 0) or 0)

        # 1. Identify present vs missing insurance types
        present_types = set()
        total_health_coverage = 0.0
        total_life_coverage = 0.0
        total_annual_premiums = 0.0
        active_policy_count = 0
        expired_policy_count = 0

        today = date.today()

        for pol in policies:
            ptype = str(pol.get("policy_type", "")).strip()
            cov = float(pol.get("coverage_amount", 0) or 0)
            prem = float(pol.get("premium_amount", 0) or pol.get("premium", 0) or 0)
            freq = str(pol.get("premium_frequency", "Annual")).lower()

            # Normalize premium to annual
            annual_prem = prem
            if "monthly" in freq:
                annual_prem = prem * 12
            elif "quarterly" in freq:
                annual_prem = prem * 4
            elif "semi" in freq:
                annual_prem = prem * 2

            total_annual_premiums += annual_prem

            end_d = pol.get("end_date") or pol.get("renewal_date")
            is_active = True
            if end_d:
                if isinstance(end_d, str):
                    try:
                        end_d = date.fromisoformat(end_d)
                    except ValueError:
                        end_d = None
                if isinstance(end_d, date) and end_d < today:
                    is_active = False

            if is_active:
                active_policy_count += 1
                if ptype:
                    present_types.add(ptype)
                if "Health" in ptype:
                    total_health_coverage += cov
                elif "Life" in ptype or "Term" in ptype:
                    total_life_coverage += cov
            else:
                expired_policy_count += 1

        missing_types = [t for t in self.REQUIRED_TYPES if t not in present_types]

        # 2. Insurance Health Score Calculation (0-100)
        score = 0.0

        # Health Insurance (max 30 pts)
        if "Health Insurance" in present_types:
            score += 30.0 if total_health_coverage >= 500000 else 20.0
        elif total_health_coverage > 0:
            score += 15.0

        # Term Life Insurance (max 30 pts)
        recommended_life_cover = annual_income * 10 if annual_income > 0 else 5000000.0
        if "Term Life Insurance" in present_types:
            if annual_income > 0 and total_life_coverage >= recommended_life_cover:
                score += 30.0
            else:
                score += 20.0
        elif total_life_coverage > 0:
            score += 15.0

        # Personal Accident (max 15 pts)
        if "Personal Accident Insurance" in present_types:
            score += 15.0

        # Vehicle Insurance (max 15 pts)
        if "Vehicle Insurance" in present_types:
            score += 15.0
        else:
            score += 10.0  # Neutral if no vehicle owned

        # Premium Affordability (max 10 pts)
        affordability_ratio = (total_annual_premiums / annual_income * 100) if annual_income > 0 else 5.0
        if affordability_ratio <= 10.0:
            score += 10.0
        elif affordability_ratio <= 15.0:
            score += 6.0
        else:
            score += 2.0

        health_score = round(min(max(score, 0.0), 100.0), 1)

        # Health Score Label & Status
        if health_score >= 90:
            score_status = "Excellent Coverage"
            score_color = "emerald"
        elif health_score >= 70:
            score_status = "Good Coverage"
            score_color = "primary"
        elif health_score >= 40:
            score_status = "Needs Improvement"
            score_color = "amber"
        else:
            score_status = "High Risk"
            score_color = "red"

        # Coverage Gap Messages
        coverage_gap_warnings = []
        if "Health Insurance" in missing_types:
            coverage_gap_warnings.append("No active Health Insurance policy detected (Min recommended: ₹5 Lakhs cover).")
        if "Term Life Insurance" in missing_types:
            coverage_gap_warnings.append("No active Term Life Insurance policy detected (Min recommended: 10x annual income).")
        if "Personal Accident Insurance" in missing_types:
            coverage_gap_warnings.append("Missing Personal Accident Insurance policy for disability cover.")

        return {
            "insurance_health_score": health_score,
            "score_status": score_status,
            "score_color": score_color,
            "total_health_coverage": round(total_health_coverage, 2),
            "total_life_coverage": round(total_life_coverage, 2),
            "recommended_life_coverage": round(recommended_life_cover, 2),
            "total_annual_premiums": round(total_annual_premiums, 2),
            "active_policy_count": active_policy_count,
            "expired_policy_count": expired_policy_count,
            "present_insurance_types": list(present_types),
            "missing_insurance_types": missing_types,
            "coverage_gap_warnings": coverage_gap_warnings,
            "affordability_ratio": round(affordability_ratio, 1),
        }


insurance_analysis_service = InsuranceAnalysisService()
