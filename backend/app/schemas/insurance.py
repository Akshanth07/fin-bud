from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class InsurancePolicyBase(BaseSchema):
    company: str = "Insurance Provider"
    provider: Optional[str] = "Insurance Provider"
    policy_number: Optional[str] = None
    policy_holder: Optional[str] = None
    policy_type: str = "Health Insurance"
    plan_name: Optional[str] = None
    policy_name: Optional[str] = None
    coverage_amount: float = Field(default=0.00, ge=0)
    premium_amount: float = Field(default=0.00, ge=0)
    premium: Optional[float] = Field(default=0.00, ge=0)
    premium_frequency: str = "Annual"
    nominee: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    renewal_date: Optional[date] = None
    maturity_date: Optional[date] = None
    claim_contact: Optional[str] = None
    status: str = "Active"
    ocr_confidence: float = 100.0
    document_url: Optional[str] = None
    ai_summary: Optional[str] = None


class InsurancePolicyCreate(InsurancePolicyBase):
    pass


class InsurancePolicyUpdate(BaseModel):
    company: Optional[str] = None
    provider: Optional[str] = None
    policy_number: Optional[str] = None
    policy_holder: Optional[str] = None
    policy_type: Optional[str] = None
    plan_name: Optional[str] = None
    policy_name: Optional[str] = None
    coverage_amount: Optional[float] = Field(default=None, ge=0)
    premium_amount: Optional[float] = Field(default=None, ge=0)
    premium: Optional[float] = Field(default=None, ge=0)
    premium_frequency: Optional[str] = None
    nominee: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    renewal_date: Optional[date] = None
    maturity_date: Optional[date] = None
    claim_contact: Optional[str] = None
    status: Optional[str] = None
    ocr_confidence: Optional[float] = None
    document_url: Optional[str] = None
    ai_summary: Optional[str] = None


class InsurancePolicyResponse(InsurancePolicyBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class OCRUploadResponse(BaseModel):
    extracted_data: Dict[str, Any]
    analysis: Dict[str, Any]
    ai_explanation: Dict[str, Any]
    validation_warnings: List[str]
