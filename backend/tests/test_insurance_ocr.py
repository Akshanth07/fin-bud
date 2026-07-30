import pytest
from app.services.ocr_service import ocr_service


def test_ocr_pattern_extraction():
    sample_text = """
    Star Health and Allied Insurance Company Limited
    Policy Number: P/111222/01/2026/000123
    Insured Person: Rajesh Kumar
    Plan Name: Star Health Family Optima
    Sum Insured: Rs. 500,000
    Total Premium: Rs. 18,500
    Start Date: 15/05/2026
    End Date: 14/05/2027
    Nominee: Sunita Kumar
    Toll Free Claim Helpline: 1800-425-2255
    """

    extracted = ocr_service.parse_policy_data(sample_text, "sample_policy.pdf", 92.5)

    assert extracted["company"] == "Star Health and Allied Insurance"
    assert extracted["policy_number"] == "P/111222/01/2026/000123"
    assert extracted["policy_holder"] == "Rajesh Kumar"
    assert extracted["policy_type"] == "Health Insurance"
    assert extracted["coverage_amount"] == 500000.0
    assert extracted["premium_amount"] == 18500.0
    assert extracted["nominee"] == "Sunita Kumar"
    assert extracted["status"] == "Active"
    assert extracted["ocr_confidence"] == 92.5


def test_ocr_custom_coverage_and_premium():
    custom_text_1 = """
    HDFC ERGO General Insurance
    Policy No: HDFC/998877/2026
    Insured: Ananya Sharma
    Sum Insured
    INR 15,00,000
    Gross Premium Payable: Rs. 24,500.00
    """
    extracted_1 = ocr_service.parse_policy_data(custom_text_1, "hdfc_policy.pdf", 90.0)
    assert extracted_1["company"] == "HDFC ERGO General Insurance"
    assert extracted_1["coverage_amount"] == 1500000.0
    assert extracted_1["premium_amount"] == 24500.0

    custom_text_2 = """
    ICICI Lombard Health Plan
    Sum Assured: 1.5 Crores
    Total Amount Payable: 35000
    """
    extracted_2 = ocr_service.parse_policy_data(custom_text_2, "icici_policy.pdf", 88.0)
    assert extracted_2["coverage_amount"] == 15000000.0
    assert extracted_2["premium_amount"] == 35000.0
