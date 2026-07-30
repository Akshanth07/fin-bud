from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class GoalBase(BaseSchema):
    goal_name: str
    goal_type: str = Field(default="custom", description="house, car, education, retirement, vacation, emergency_fund, wedding, custom")
    target_amount: float = Field(default=0.00, ge=0)
    current_amount: float = Field(default=0.00, ge=0)
    target_date: Optional[date] = None
    priority: str = Field(default="medium", description="high, medium, low")
    status: str = Field(default="in_progress", description="e.g. in_progress, achieved, paused")


class GoalCreate(BaseSchema):
    goal_name: str
    goal_type: str = Field(default="custom")
    target_amount: float = Field(ge=0)
    current_amount: float = Field(default=0.00, ge=0)
    target_date: Optional[date] = None
    priority: str = Field(default="medium")
    status: str = Field(default="in_progress")


class GoalUpdate(BaseModel):
    goal_name: Optional[str] = None
    goal_type: Optional[str] = None
    target_amount: Optional[float] = Field(default=None, ge=0)
    current_amount: Optional[float] = Field(default=None, ge=0)
    target_date: Optional[date] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class GoalContribution(BaseModel):
    amount: float = Field(gt=0, description="Contribution amount to add")


class GoalResponse(GoalBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
