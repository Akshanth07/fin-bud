import pytest
from app.services.recommendation_service import recommendation_service


def test_recommendation_priority_score_with_goal_match():
    user_profile = {
        "monthly_income": 35000,
        "monthly_expenses": 25000,
        "savings": 20000,
        "state": "Tamil Nadu"
    }

    scheme = {
        "name": "PMAY Housing Subsidy",
        "category": "Housing",
        "state": "Tamil Nadu",
        "benefits": {"max_subsidy": 267000}
    }

    user_goals = [
        {"goal_name": "Buy First Apartment", "goal_type": "house"}
    ]

    eligibility_result = {
        "eligible": True,
        "eligibility_percentage": 95.0,
        "reasons": ["✓ Income requirement satisfied"]
    }

    result = recommendation_service.compute_priority_score(
        user_profile, scheme, user_goals, eligibility_result
    )

    assert result["priority_score"] >= 75.0
    assert result["goal_matched"] is True
    assert result["estimated_financial_benefit"] == 267000.0
