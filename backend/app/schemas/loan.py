from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class LoanBase(BaseSchema):
    loan_type: str = Field(..., description="Type of loan e.g. Home Loan, Personal Loan, Auto Loan")
    lender: str = Field(..., description="Lender/Bank name")
    principal_amount: float = Field(default=0.00, ge=0)
    outstanding_amount: float = Field(default=0.00, ge=0)
    interest_rate: float = Field(default=0.00, ge=0)
    emi: float = Field(default=0.00, ge=0)
    tenure: int = Field(default=0, ge=0, description="Tenure in months")


class LoanCreate(LoanBase):
    pass


class LoanUpdate(BaseModel):
    loan_type: Optional[str] = None
    lender: Optional[str] = None
    principal_amount: Optional[float] = Field(default=None, ge=0)
    outstanding_amount: Optional[float] = Field(default=None, ge=0)
    interest_rate: Optional[float] = Field(default=None, ge=0)
    emi: Optional[float] = Field(default=None, ge=0)
    tenure: Optional[int] = Field(default=None, ge=0)


class LoanResponse(LoanBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
