import pytest
from app.services.groq_service import groq_service


def test_groq_fallback_explanation():
    policy = {
        "company": "Star Health",
        "policy_type": "Health Insurance",
        "coverage_amount": 500000.0,
        "premium_amount": 12000.0,
        "status": "Active"
    }

    analysis = {
        "insurance_health_score": 75.0,
        "missing_insurance_types": ["Term Life Insurance", "Personal Accident Insurance"],
        "coverage_gap_warnings": ["No active Term Life policy detected."]
    }

    exp = groq_service.explain_insurance_analysis(policy, analysis)

    assert "summary" in exp
    assert "strengths" in exp
    assert "risks" in exp
    assert "recommendations" in exp
    assert isinstance(exp["strengths"], list)
    assert len(exp["strengths"]) > 0
