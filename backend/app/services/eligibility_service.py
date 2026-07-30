from datetime import date
from typing import Any, Dict, List, Optional


class EligibilityService:
    """
    Deterministic Rule-Based Eligibility Engine (No LLM).
    Evaluates user profile against scheme eligibility rules JSON and produces
    eligibility boolean, percentage score, and structured qualification reasons.
    """

    def calculate_eligibility(
        self, user_profile: Dict[str, Any], scheme: Dict[str, Any]
    ) -> Dict[str, Any]:
        rules = scheme.get("eligibility_rules") or {}
        reasons: List[str] = []
        is_eligible = True
        match_score = 100.0

        # User profile attributes (with safe fallbacks)
        user_income = float(user_profile.get("monthly_income", 0) or 0) * 12
        if user_income == 0:
            user_income = float(user_profile.get("annual_income", 0) or 0)

        dob = user_profile.get("date_of_birth")
        user_age = 30  # Default assumption if DOB not provided
        if dob:
            if isinstance(dob, str):
                try:
                    dob = date.fromisoformat(dob)
                except ValueError:
                    dob = None
            if isinstance(dob, date):
                today = date.today()
                user_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

        user_gender = str(user_profile.get("gender", "Any")).strip().capitalize()
        user_occupation = str(user_profile.get("occupation", "Any")).strip().capitalize()
        user_state = str(user_profile.get("state", "All")).strip().lower()

        # 1. Income Check
        inc_min = rules.get("income_min")
        inc_max = rules.get("income_max")

        if inc_max is not None and user_income > inc_max:
            is_eligible = False
            match_score -= 40
            reasons.append(f"❌ Annual income (₹{user_income:,.0f}) exceeds maximum threshold of ₹{inc_max:,.0f}")
        elif inc_min is not None and user_income < inc_min:
            is_eligible = False
            match_score -= 30
            reasons.append(f"❌ Annual income below minimum requirement of ₹{inc_min:,.0f}")
        else:
            if inc_max:
                reasons.append(f"✓ Income requirement satisfied (₹{user_income:,.0f} <= ₹{inc_max:,.0f})")
            else:
                reasons.append("✓ Income requirement satisfied")

        # 2. Age Check
        age_min = rules.get("age_min")
        age_max = rules.get("age_max")

        if age_min is not None and user_age < age_min:
            is_eligible = False
            match_score -= 35
            reasons.append(f"❌ Age ({user_age} yrs) is below minimum required age of {age_min} yrs")
        elif age_max is not None and user_age > age_max:
            is_eligible = False
            match_score -= 35
            reasons.append(f"❌ Age ({user_age} yrs) exceeds maximum allowed age of {age_max} yrs")
        else:
            if age_min is not None and age_max is not None:
                reasons.append(f"✓ Age requirement satisfied ({user_age} yrs within {age_min}–{age_max} yrs)")
            else:
                reasons.append(f"✓ Age requirement satisfied ({user_age} yrs)")

        # 3. Gender Check
        allowed_genders = rules.get("gender") or ["Any"]
        if isinstance(allowed_genders, str):
            allowed_genders = [allowed_genders]
        allowed_genders_clean = [g.capitalize() for g in allowed_genders]

        if "Any" not in allowed_genders_clean and user_gender not in allowed_genders_clean:
            is_eligible = False
            match_score -= 30
            reasons.append(f"❌ Scheme restricted to {', '.join(allowed_genders_clean)} applicants")
        else:
            reasons.append("✓ Gender eligibility matched")

        # 4. State Check
        allowed_states = rules.get("state") or scheme.get("state") or ["All"]
        if isinstance(allowed_states, str):
            allowed_states = [allowed_states]
        allowed_states_clean = [s.lower() for s in allowed_states]

        if "all" not in allowed_states_clean and user_state not in allowed_states_clean and user_state != "all":
            is_eligible = False
            match_score -= 25
            reasons.append(f"❌ Scheme specific to {scheme.get('state', 'selected states')}")
        else:
            state_label = scheme.get("state") or "National"
            reasons.append(f"✓ State residency eligible ({state_label})")

        # 5. Occupation Check
        allowed_occupations = rules.get("occupation") or ["Any"]
        if isinstance(allowed_occupations, str):
            allowed_occupations = [allowed_occupations]
        allowed_occupations_clean = [o.capitalize() for o in allowed_occupations]

        if "Any" not in allowed_occupations_clean and user_occupation not in allowed_occupations_clean:
            # Non-blocking penalty if user occupation is not explicitly listed, but mark note
            match_score -= 15
            reasons.append(f"ℹ️ Target occupation: {', '.join(allowed_occupations_clean)}")
        else:
            reasons.append("✓ Occupation category eligible")

        # 6. Senior Citizen Check
        senior_required = rules.get("senior_citizen", False)
        if senior_required and user_age < 60:
            is_eligible = False
            match_score -= 40
            reasons.append("❌ Reserved for Senior Citizens (60+ years)")
        elif senior_required:
            reasons.append("✓ Senior Citizen criteria satisfied")

        final_percentage = round(max(min(match_score, 100.0), 0.0), 1)
        if not is_eligible:
            final_percentage = min(final_percentage, 45.0)

        return {
            "eligible": is_eligible,
            "eligibility_percentage": final_percentage,
            "reasons": reasons,
        }


eligibility_service = EligibilityService()
