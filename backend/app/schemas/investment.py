from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class InvestmentBase(BaseSchema):
    asset_name: str = Field(..., description="Name of the asset")
    asset_type: str = Field(..., description="Type of investment e.g. Equity, Mutual Fund, Crypto, Fixed Deposit")
    quantity: float = Field(default=0.0, ge=0)
    purchase_price: float = Field(default=0.0, ge=0)
    current_price: float = Field(default=0.0, ge=0)
    platform: Optional[str] = None
    interest_rate: Optional[float] = Field(default=7.0, ge=0)
    tenure_years: Optional[float] = Field(default=1.0, ge=0)
    compounding_frequency: Optional[str] = Field(default="Quarterly")


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentUpdate(BaseModel):
    asset_name: Optional[str] = None
    asset_type: Optional[str] = None
    quantity: Optional[float] = Field(default=None, ge=0)
    purchase_price: Optional[float] = Field(default=None, ge=0)
    current_price: Optional[float] = Field(default=None, ge=0)
    platform: Optional[str] = None
    interest_rate: Optional[float] = Field(default=None, ge=0)
    tenure_years: Optional[float] = Field(default=None, ge=0)
    compounding_frequency: Optional[str] = None


class InvestmentResponse(InvestmentBase):
    id: UUID
    user_id: UUID
    current_value: Optional[float] = None
    created_at: datetime
    updated_at: datetime

