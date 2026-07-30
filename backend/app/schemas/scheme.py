from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class GovernmentSchemeBase(BaseSchema):
    scheme_code: str
    name: str
    category: Optional[str] = "General"
    description: Optional[str] = None
    benefits: Dict[str, Any] = Field(default_factory=dict)
    eligibility_rules: Dict[str, Any] = Field(default_factory=dict)
    eligibility_summary: Optional[str] = None
    official_url: Optional[str] = None
    documents_required: List[Any] = Field(default_factory=list)
    application_process: List[Any] = Field(default_factory=list)
    state: Optional[str] = "All"
    ministry: Optional[str] = None
    source: Optional[str] = "myScheme"
    version: int = 1
    deadline: Optional[str] = "Ongoing"
    status: str = "ACTIVE"


class GovernmentSchemeCreate(GovernmentSchemeBase):
    pass


class GovernmentSchemeUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[Dict[str, Any]] = None
    eligibility_rules: Optional[Dict[str, Any]] = None
    eligibility_summary: Optional[str] = None
    official_url: Optional[str] = None
    documents_required: Optional[List[Any]] = None
    application_process: Optional[List[Any]] = None
    state: Optional[str] = None
    ministry: Optional[str] = None
    source: Optional[str] = None
    version: Optional[int] = None
    deadline: Optional[str] = None
    status: Optional[str] = None


class GovernmentSchemeResponse(GovernmentSchemeBase):
    id: UUID
    last_seen_at: datetime
    last_synced_at: datetime
    created_at: datetime
    updated_at: datetime


class RecommendedSchemeResponse(BaseModel):
    id: UUID
    scheme_code: str
    name: str
    category: Optional[str]
    description: Optional[str]
    benefits: Dict[str, Any]
    eligibility_summary: Optional[str]
    official_url: Optional[str]
    documents_required: List[Any]
    application_process: List[Any]
    state: Optional[str]
    ministry: Optional[str]
    source: Optional[str]
    deadline: Optional[str]
    status: str
    priority_score: float
    eligibility_percentage: float
    eligible: bool
    reasons: List[str]
    estimated_financial_benefit: float
    goal_matched: bool
    is_saved: bool = False
    saved_status: Optional[str] = None


class SaveSchemeCreate(BaseModel):
    scheme_id: UUID
    application_status: str = Field(default="Interested", description="Interested, Applied, Approved, Rejected, Completed")


class SavedSchemeStatusUpdate(BaseModel):
    scheme_id: UUID
    application_status: str = Field(..., description="Interested, Applied, Approved, Rejected, Completed")


class SavedSchemeResponse(BaseSchema):
    id: UUID
    user_id: UUID
    scheme_id: UUID
    application_status: str
    saved_at: datetime
    scheme: Optional[GovernmentSchemeResponse] = None


# Backward compatibility schemas
class UserSchemeMatchBase(BaseSchema):
    scheme_id: UUID
    eligibility_score: float = Field(default=0.00, ge=0.0, le=100.0)


class UserSchemeMatchCreate(UserSchemeMatchBase):
    pass


class UserSchemeMatchResponse(UserSchemeMatchBase):
    id: UUID
    user_id: UUID
    matched_at: datetime
    scheme: Optional[GovernmentSchemeResponse] = None
