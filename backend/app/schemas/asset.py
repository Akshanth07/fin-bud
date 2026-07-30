from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class AssetBase(BaseSchema):
    asset_name: str = Field(..., description="Name of the asset e.g. Primary Residence, Emergency Cash, Gold Bars")
    asset_type: str = Field(..., description="Cash, Savings, Gold, Real Estate, Vehicle, Crypto, Other")
    valuation: float = Field(default=0.00, ge=0.0)
    institution: Optional[str] = None
    notes: Optional[str] = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_name: Optional[str] = None
    asset_type: Optional[str] = None
    valuation: Optional[float] = Field(default=None, ge=0.0)
    institution: Optional[str] = None
    notes: Optional[str] = None


class AssetResponse(AssetBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
