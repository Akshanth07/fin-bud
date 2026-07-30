from typing import Any, Dict


class SchemeNormalizer:
    """Normalizes raw input objects from varied data adapters into standardized GovernmentScheme dict format."""

    @staticmethod
    def normalize(raw_obj: Dict[str, Any], default_source: str = "myScheme") -> Dict[str, Any]:
        scheme_code = str(raw_obj.get("scheme_code", "")).strip().upper()
        name = str(raw_obj.get("name") or raw_obj.get("scheme_name") or "").strip()

        category = str(raw_obj.get("category", "General")).strip()
        description = str(raw_obj.get("description", "")).strip()

        # Handle benefits format (dict or string wrapped into dict)
        benefits_raw = raw_obj.get("benefits") or raw_obj.get("benefit")
        if isinstance(benefits_raw, dict):
            benefits = benefits_raw
        elif isinstance(benefits_raw, str):
            benefits = {"summary": benefits_raw}
        else:
            benefits = {}

        # Eligibility rules
        eligibility_rules = raw_obj.get("eligibility_rules") or {}
        if not isinstance(eligibility_rules, dict):
            eligibility_rules = {}

        # Generate fallback summary if empty
        eligibility_summary = raw_obj.get("eligibility_summary")
        if not eligibility_summary:
            inc_max = eligibility_rules.get("income_max")
            age_min = eligibility_rules.get("age_min")
            age_max = eligibility_rules.get("age_max")
            st = raw_obj.get("state", "All")
            parts = []
            if age_min is not None and age_max is not None:
                parts.append(f"Age {age_min}–{age_max}")
            if inc_max:
                parts.append(f"Income up to ₹{inc_max:,.0f}")
            if st and st != "All":
                parts.append(f"{st} resident")
            eligibility_summary = " • ".join(parts) if parts else "Standard eligibility applies"

        official_url = raw_obj.get("official_url") or raw_obj.get("official_link")
        documents_required = raw_obj.get("documents_required") or []
        if isinstance(documents_required, str):
            documents_required = [documents_required]

        application_process = raw_obj.get("application_process") or []

        state = str(raw_obj.get("state", "All")).strip()
        ministry = str(raw_obj.get("ministry", "Government of India")).strip()
        source = str(raw_obj.get("source", default_source)).strip()
        version = int(raw_obj.get("version", 1))
        deadline = str(raw_obj.get("deadline", "Ongoing")).strip()
        status = str(raw_obj.get("status", "ACTIVE")).strip().upper()

        if status not in ("ACTIVE", "INACTIVE", "EXPIRED", "ARCHIVED"):
            status = "ACTIVE"

        return {
            "scheme_code": scheme_code,
            "name": name,
            "category": category,
            "description": description,
            "benefits": benefits,
            "eligibility_rules": eligibility_rules,
            "eligibility_summary": eligibility_summary,
            "official_url": official_url,
            "documents_required": documents_required,
            "application_process": application_process,
            "state": state,
            "ministry": ministry,
            "source": source,
            "version": version,
            "deadline": deadline,
            "status": status,
        }
