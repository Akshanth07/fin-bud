import pytest
from app.services.eligibility_service import eligibility_service


def test_eligible_user():
    user_profile = {
        "monthly_income": 40000,  # Annual = 4,80,000
        "date_of_birth": "1995-05-15",  # ~31 years old
        "gender": "Female",
        "occupation": "Student",
        "state": "Tamil Nadu"
    }

    scheme = {
        "state": "Tamil Nadu",
        "eligibility_rules": {
            "income_max": 800000,
            "income_min": 0,
            "age_min": 18,
            "age_max": 60,
            "gender": ["Female"],
            "occupation": ["Student"],
            "state": ["Tamil Nadu"]
        }
    }

    result = eligibility_service.calculate_eligibility(user_profile, scheme)
    assert result["eligible"] is True
    assert result["eligibility_percentage"] > 70
    assert any("Income requirement satisfied" in r for r in result["reasons"])


def test_ineligible_high_income():
    user_profile = {
        "monthly_income": 100000,  # Annual = 12,00,000
        "date_of_birth": "1990-01-01",
        "gender": "Male",
        "occupation": "Salaried",
        "state": "All"
    }

    scheme = {
        "state": "All",
        "eligibility_rules": {
            "income_max": 500000,
            "age_min": 18,
            "age_max": 60,
            "gender": ["Any"],
            "occupation": ["Any"],
            "state": ["All"]
        }
    }

    result = eligibility_service.calculate_eligibility(user_profile, scheme)
    assert result["eligible"] is False
    assert any("exceeds maximum threshold" in r for r in result["reasons"])
