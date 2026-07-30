from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class IncomeSourceBase(BaseSchema):
    source_name: str = Field(..., description="e.g. Salary, Business, Rental, Freelancing, Other")
    monthly_amount: float = Field(default=0.00, ge=0.0)
    frequency: str = Field(default="monthly", description="monthly, annual, one_time")
    notes: Optional[str] = None


class IncomeSourceCreate(IncomeSourceBase):
    pass


class IncomeSourceUpdate(BaseModel):
    source_name: Optional[str] = None
    monthly_amount: Optional[float] = Field(default=None, ge=0.0)
    frequency: Optional[str] = None
    notes: Optional[str] = None


class IncomeSourceResponse(IncomeSourceBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
