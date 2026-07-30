from typing import Any, Dict, Tuple


class SchemeValidator:
    """Validation layer ensuring schemes meet structural and data integrity requirements."""

    @staticmethod
    def validate(raw_obj: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validates raw scheme payload.
        Returns (is_valid: bool, error_reason: str).
        """
        scheme_code = raw_obj.get("scheme_code")
        if not scheme_code or not str(scheme_code).strip():
            return False, "Missing or empty scheme_code"

        name = raw_obj.get("name") or raw_obj.get("scheme_name")
        if not name or not str(name).strip():
            return False, "Missing or empty name"

        eligibility_rules = raw_obj.get("eligibility_rules")
        if not isinstance(eligibility_rules, dict):
            return False, "Invalid or non-dictionary eligibility_rules JSON"

        return True, ""
