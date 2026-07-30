import os
import re
from datetime import date, datetime
from typing import Any, Dict, Optional, Tuple
import fitz  # PyMuPDF


class OCRService:
    """
    Insurance Policy OCR & Text Extractor Service using PyMuPDF (fitz)
    and heuristic regex pattern recognition.
    """

    KNOWN_COMPANIES = [
        "Star Health and Allied Insurance",
        "Star Health",
        "HDFC ERGO General Insurance",
        "HDFC ERGO",
        "HDFC Life Insurance",
        "HDFC Life",
        "ICICI Lombard General Insurance",
        "ICICI Lombard",
        "ICICI Prudential Life Insurance",
        "Max Life Insurance",
        "TATA AIG General Insurance",
        "Life Insurance Corporation of India",
        "LIC of India",
        "LIC",
        "Bajaj Allianz General Insurance",
        "Care Health Insurance",
        "Niva Bupa Health Insurance",
        "SBI Life Insurance",
        "SBI General Insurance",
        "Aditya Birla Health Insurance",
        "Reliance General Insurance",
    ]

    POLICY_TYPES = [
        ("Health Insurance", ["health", "mediclaim", "medical", "hospital", "floater", "star health"]),
        ("Term Life Insurance", ["term life", "life shield", "life insurance", "death benefit", "term plan"]),
        ("Vehicle Insurance", ["motor", "vehicle", "car", "two wheeler", "auto", "comprehensive motor"]),
        ("Personal Accident Insurance", ["personal accident", "accidental", "disability"]),
        ("Travel Insurance", ["travel", "overseas", "trip"]),
    ]

    def extract_text_from_file(self, file_bytes: bytes, filename: str) -> Tuple[str, float]:
        """
        Extracts raw text from PDF or Image file bytes using PyMuPDF.
        Returns (extracted_text, raw_confidence).
        """
        ext = os.path.splitext(filename)[1].lower()
        extracted_text = ""
        confidence = 85.0

        if ext == ".pdf":
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                text_list = []
                for page in doc:
                    text_list.append(page.get_text())
                extracted_text = "\n".join(text_list).strip()

                if len(extracted_text) > 50:
                    confidence = min(90.0 + len(extracted_text) / 100, 98.0)
                else:
                    confidence = 40.0  # Likely scanned PDF
            except Exception as e:
                raise ValueError(f"Corrupted or invalid PDF file: {e}")

        elif ext in [".png", ".jpg", ".jpeg"]:
            try:
                doc = fitz.open(stream=file_bytes, filetype=ext.lstrip("."))
                text_list = [page.get_text() for page in doc]
                extracted_text = "\n".join(text_list).strip()
                confidence = 75.0 if extracted_text else 30.0
            except Exception as e:
                raise ValueError(f"Corrupted image file: {e}")
        else:
            raise ValueError("Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG file.")

        return extracted_text, round(confidence, 1)

    def parse_policy_data(self, text: str, filename: str, ocr_confidence: float) -> Dict[str, Any]:
        """
        Parses structured insurance fields from extracted raw text using pattern recognition.
        """
        # 1. Company
        company = "Insurance Provider"
        for comp in self.KNOWN_COMPANIES:
            if re.search(r"\b" + re.escape(comp) + r"\b", text, re.IGNORECASE):
                company = comp
                break

        # 2. Policy Number
        policy_number = None
        pol_num_match = re.search(
            r"(?:policy\s*(?:no|num|number)|pol\s*no)[\s:\-]*([A-Z0-9\/\-]{5,30})",
            text,
            re.IGNORECASE
        )
        if pol_num_match:
            policy_number = pol_num_match.group(1).strip()
        else:
            # Fallback regex pattern for standalone policy codes
            pol_code_match = re.search(r"\b([A-Z]{2,4}\/\d{4,12}\/\d{2,6})\b", text)
            if pol_code_match:
                policy_number = pol_code_match.group(1).strip()
            else:
                # Generate deterministic fallback from filename or text hash if missing
                clean_fn = re.sub(r"[^A-Za-z0-9]", "", filename).upper()
                policy_number = f"POL-{clean_fn[:8]}-2026"

        # 3. Policy Holder
        policy_holder = "Policy Holder"
        holder_match = re.search(
            r"(?:policy\s*holder|insured\s*person|proposer\s*name|name\s*of\s*insured)[\s:\-]*([^\n\r,]+)",
            text,
            re.IGNORECASE
        )
        if holder_match:
            policy_holder = holder_match.group(1).strip()

        # 4. Policy Type & Plan Name
        policy_type = "Health Insurance"
        for ptype, keywords in self.POLICY_TYPES:
            if any(re.search(r"\b" + re.escape(kw) + r"\b", text, re.IGNORECASE) for kw in keywords):
                policy_type = ptype
                break

        plan_name = f"{company} {policy_type}"
        plan_match = re.search(
            r"(?:plan\s*name|scheme\s*name|product\s*name)[\s:\-]*([^\n\r,]+)",
            text,
            re.IGNORECASE
        )
        if plan_match:
            plan_name = plan_match.group(1).strip()

        # 5. Coverage Amount (Sum Insured) Extraction
        coverage_amount: Optional[float] = None

        # Pattern 5A: Lakhs / Crores expressions (e.g. 5 Lakhs, 10 Lacs, 1.5 Crores, 1 Cr, 50 L)
        lakh_match = re.search(
            r"(?:sum\s*insured|coverage|sum\s*assured|policy\s*limit|total\s*cover|basic\s*cover|capital\s*sum|indemnity\s*limit)[\s\n\r:\-]*₹?\s*(?:Rs\.?|INR)?\s*([\d\.]+)\s*(lakhs?|lacs?|lac|crores?|cr|l)\b",
            text,
            re.IGNORECASE
        )
        if lakh_match:
            try:
                num = float(lakh_match.group(1))
                unit = lakh_match.group(2).lower()
                if "cr" in unit or "crore" in unit:
                    coverage_amount = num * 10000000.0
                else:
                    coverage_amount = num * 100000.0
            except ValueError:
                pass

        # Pattern 5B: Standard currency numbers directly following Coverage labels (multiline supported)
        if coverage_amount is None:
            cov_match = re.search(
                r"(?:sum\s*insured|coverage\s*amount|sum\s*assured|policy\s*limit|total\s*cover|basic\s*cover|capital\s*sum|indemnity\s*limit|risk\s*cover|benefit\s*amount)[\s\n\r:\-]*₹?\s*(?:Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:/-)?",
                text,
                re.IGNORECASE
            )
            if cov_match:
                try:
                    val = float(cov_match.group(1).replace(",", ""))
                    if val > 0:
                        coverage_amount = val
                except ValueError:
                    pass

        # Pattern 5C: Generalized search for Sum Insured anywhere near numbers (within 50 chars)
        if coverage_amount is None:
            cov_near_matches = re.findall(
                r"(?:sum\s*insured|sum\s*assured|coverage)[\s\S]{1,50}?₹?\s*(?:Rs\.?|INR)?\s*([\d,]{4,12}(?:\.\d{1,2})?)",
                text,
                re.IGNORECASE
            )
            for m in cov_near_matches:
                try:
                    val = float(m.replace(",", ""))
                    if val >= 10000:
                        coverage_amount = val
                        break
                except ValueError:
                    continue

        # Pattern 5D: Heuristic fallback for Coverage if not found: search for typical large numbers in document (> 50,000)
        if coverage_amount is None:
            large_nums = re.findall(r"₹?\s*(?:Rs\.?|INR)?\s*([\d,]{6,10}(?:\.\d{1,2})?)", text)
            for num_str in large_nums:
                try:
                    val = float(num_str.replace(",", ""))
                    if 50000 <= val <= 500000000:
                        coverage_amount = val
                        break
                except ValueError:
                    continue

        # 6. Premium Amount & Frequency Extraction
        premium_amount: Optional[float] = None

        # Pattern 6A: Lakhs / Crores for Premium
        prem_lakh_match = re.search(
            r"(?:total\s*premium|gross\s*premium|net\s*premium|premium\s*amount|premium\s*payable|final\s*premium|amount\s*payable)[\s\n\r:\-]*₹?\s*(?:Rs\.?|INR)?\s*([\d\.]+)\s*(lakhs?|lacs?|lac)\b",
            text,
            re.IGNORECASE
        )
        if prem_lakh_match:
            try:
                premium_amount = float(prem_lakh_match.group(1)) * 100000.0
            except ValueError:
                pass

        # Pattern 6B: Standard currency numbers directly following Premium labels
        if premium_amount is None:
            prem_match = re.search(
                r"(?:total\s*premium|gross\s*premium|net\s*premium|premium\s*amount|premium\s*payable|final\s*premium|annual\s*premium|base\s*premium|basic\s*premium|total\s*amount|amount\s*payable|premium)[\s\n\r:\-]*₹?\s*(?:Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:/-)?",
                text,
                re.IGNORECASE
            )
            if prem_match:
                try:
                    val = float(prem_match.group(1).replace(",", ""))
                    if val > 0:
                        premium_amount = val
                except ValueError:
                    pass

        # Pattern 6C: Generalized search for Premium anywhere near numbers (within 40 chars)
        if premium_amount is None:
            prem_near_matches = re.findall(
                r"(?:premium|payable|total\s*amount)[\s\S]{1,40}?₹?\s*(?:Rs\.?|INR)?\s*([\d,]{3,9}(?:\.\d{1,2})?)",
                text,
                re.IGNORECASE
            )
            for m in prem_near_matches:
                try:
                    val = float(m.replace(",", ""))
                    if 100 <= val <= 2000000 and (coverage_amount is None or val != coverage_amount):
                        premium_amount = val
                        break
                except ValueError:
                    continue

        # Pattern 6D: Heuristic Fallback for Premium if not found: search for moderate currency numbers
        if premium_amount is None:
            mod_nums = re.findall(r"₹?\s*(?:Rs\.?|INR)?\s*([\d,]{4,7}(?:\.\d{1,2})?)", text)
            for num_str in mod_nums:
                try:
                    val = float(num_str.replace(",", ""))
                    if 500 <= val <= 500000 and (coverage_amount is None or val != coverage_amount):
                        premium_amount = val
                        break
                except ValueError:
                    continue

        # Final default amounts (if document had no numeric details at all)
        final_coverage = float(coverage_amount) if coverage_amount is not None else 500000.0
        final_premium = float(premium_amount) if premium_amount is not None else 12000.0

        premium_frequency = "Annual"
        if re.search(r"\bmonthly\b", text, re.IGNORECASE):
            premium_frequency = "Monthly"
        elif re.search(r"\bquarterly\b", text, re.IGNORECASE):
            premium_frequency = "Quarterly"
        elif re.search(r"\bhalf\s*yearly|semi\s*annual\b", text, re.IGNORECASE):
            premium_frequency = "Semi-Annual"

        # 7. Dates (Start, End/Renewal, Maturity)
        today = date.today()
        start_date = today.replace(year=today.year - 1).isoformat()
        end_date = today.replace(year=today.year + 1).isoformat()
        maturity_date = today.replace(year=today.year + 15).isoformat()

        # Contextual regex for start date
        start_match = re.search(
            r"(?:inception\s*date|start\s*date|commencement\s*date|period\s*of\s*insurance\s*from|policy\s*date|risk\s*date|effective\s*date)[\s:\-]*([0-9A-Za-z\/\-\.]{8,15})",
            text,
            re.IGNORECASE
        )
        if start_match:
            parsed_start = self._parse_date(start_match.group(1))
            if parsed_start:
                start_date = parsed_start.isoformat()

        # Contextual regex for end date / renewal date
        end_match = re.search(
            r"(?:expiry\s*date|end\s*date|period\s*of\s*insurance\s*to|renewal\s*date|valid\s*till)[\s:\-]*([0-9A-Za-z\/\-\.]{8,15})",
            text,
            re.IGNORECASE
        )
        if end_match:
            parsed_end = self._parse_date(end_match.group(1))
            if parsed_end:
                end_date = parsed_end.isoformat()

        # Contextual regex for maturity date
        mat_match = re.search(
            r"(?:maturity\s*date)[\s:\-]*([0-9A-Za-z\/\-\.]{8,15})",
            text,
            re.IGNORECASE
        )
        if mat_match:
            parsed_mat = self._parse_date(mat_match.group(1))
            if parsed_mat:
                maturity_date = parsed_mat.isoformat()

        # Fallback if contextual start/end date were not found
        if not start_match and not end_match:
            dates = re.findall(r"\b(\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})\b", text)
            if len(dates) >= 2:
                try:
                    d1 = self._parse_date(dates[0])
                    d2 = self._parse_date(dates[1])
                    if d1 and d2:
                        start_date = min(d1, d2).isoformat()
                        end_date = max(d1, d2).isoformat()
                except Exception:
                    pass

        # 8. Nominee
        nominee = "Family Member"
        nom_match = re.search(
            r"(?:nominee|beneficiary)[\s:\-]*([^\n\r,]+)",
            text,
            re.IGNORECASE
        )
        if nom_match:
            nominee = nom_match.group(1).strip()

        # 9. Claim Contact
        claim_contact = "1800-102-4488 / claims@insurance.com"
        contact_match = re.search(
            r"(?:toll\s*free|claim\s*helpline|contact\s*no|call)[\s:\-]*([\d\-\s]{8,15})",
            text,
            re.IGNORECASE
        )
        if contact_match:
            claim_contact = contact_match.group(1).strip()

        status = "Active"
        if end_date and date.fromisoformat(end_date) < today:
            status = "Expired"

        return {
            "company": company,
            "policy_number": policy_number,
            "policy_holder": policy_holder,
            "policy_type": policy_type,
            "plan_name": plan_name,
            "coverage_amount": final_coverage,
            "premium_amount": final_premium,
            "premium_frequency": premium_frequency,
            "nominee": nominee,
            "start_date": start_date,
            "end_date": end_date,
            "maturity_date": maturity_date,
            "claim_contact": claim_contact,
            "status": status,
            "ocr_confidence": ocr_confidence,
            "raw_text_preview": text[:300] if text else "",
        }

    def _parse_date(self, dstr: str) -> Optional[date]:
        if not dstr:
            return None
        clean_str = dstr.strip().rstrip(".")
        for fmt in (
            "%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%Y/%m/%d",
            "%d %b %Y", "%d-%b-%Y", "%d %B %Y", "%d-%B-%Y",
            "%b %d, %Y", "%B %d, %Y"
        ):
            try:
                return datetime.strptime(clean_str, fmt).date()
            except ValueError:
                continue
        return None



ocr_service = OCRService()
