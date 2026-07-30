from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class ExpenseBase(BaseSchema):
    category: str = Field(..., description="e.g. Rent, Food, Transport, Bills, Entertainment, Subscriptions, Other")
    amount: float = Field(default=0.00, ge=0.0)
    frequency: str = Field(default="monthly", description="monthly, annual, weekly, one_time")
    notes: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = Field(default=None, ge=0.0)
    frequency: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponse(ExpenseBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
