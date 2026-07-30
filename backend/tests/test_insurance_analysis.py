import pytest
from app.services.insurance_analysis_service import insurance_analysis_service


def test_insurance_health_score_calculation():
    policies = [
        {
            "policy_type": "Health Insurance",
            "coverage_amount": 500000.0,
            "premium_amount": 12000.0,
            "premium_frequency": "Annual",
            "end_date": "2027-12-31",
        },
        {
            "policy_type": "Term Life Insurance",
            "coverage_amount": 5000000.0,
            "premium_amount": 15000.0,
            "premium_frequency": "Annual",
            "end_date": "2030-12-31",
        },
    ]

    user_profile = {"monthly_income": 50000.0}  # Annual = 6,00,000

    analysis = insurance_analysis_service.analyze_user_insurance_portfolio(policies, user_profile)

    assert analysis["insurance_health_score"] >= 70.0
    assert "Health Insurance" in analysis["present_insurance_types"]
    assert "Term Life Insurance" in analysis["present_insurance_types"]
    assert "Personal Accident Insurance" in analysis["missing_insurance_types"]
    assert analysis["active_policy_count"] == 2
