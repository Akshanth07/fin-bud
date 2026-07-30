from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class LifeEventSimulationBase(BaseSchema):
    event_type: str = Field(..., description="e.g. Marriage, Buying Home, Retirement, Job Change")
    input_data: Dict[str, Any] = Field(default_factory=dict)
    ai_result: Optional[Dict[str, Any]] = Field(default_factory=dict)


class LifeEventSimulationCreate(LifeEventSimulationBase):
    pass


class LifeEventSimulationUpdate(BaseModel):
    event_type: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    ai_result: Optional[Dict[str, Any]] = None


class LifeEventSimulationResponse(LifeEventSimulationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
