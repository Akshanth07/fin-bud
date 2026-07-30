from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class AIInsightBase(BaseSchema):
    insight_type: str = Field(..., description="e.g. portfolio_risk, tax_saving, scheme_alert, expense_warning")
    title: str
    description: Optional[str] = None
    priority: Optional[str] = Field(default="medium", description="low, medium, high, critical")


class AIInsightCreate(AIInsightBase):
    pass


class AIInsightUpdate(BaseModel):
    insight_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None


class AIInsightResponse(AIInsightBase):
    id: UUID
    user_id: UUID
    created_at: datetime
