from datetime import date, datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.schemas.common import BaseSchema


class UserBase(BaseSchema):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: float = 0.00
    monthly_income: float = 0.00
    monthly_expenses: float = 0.00
    savings: float = 0.00
    emergency_fund: float = 0.00
    total_assets: float = 0.00
    total_liabilities: float = 0.00
    risk_profile: Optional[str] = "moderate"
    marital_status: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    currency: Optional[str] = "INR"
    investment_goal: Optional[str] = None
    emergency_fund_goal: Optional[float] = 0.00
    financial_health_score: float = 0.00

    @field_validator("date_of_birth", mode="before")
    def parse_dob(cls, v: Any) -> Optional[date]:
        if v == "" or v is None:
            return None
        return v


class UserCreate(UserBase):
    id: UUID
    email: EmailStr


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None
    annual_income: Optional[float] = None
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    savings: Optional[float] = None
    emergency_fund: Optional[float] = None
    total_assets: Optional[float] = None
    total_liabilities: Optional[float] = None
    risk_profile: Optional[str] = None
    marital_status: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    currency: Optional[str] = None
    investment_goal: Optional[str] = None
    emergency_fund_goal: Optional[float] = None
    financial_health_score: Optional[float] = None

    @field_validator("date_of_birth", mode="before")
    def parse_dob(cls, v: Any) -> Optional[date]:
        if v == "" or v is None:
            return None
        return v


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
