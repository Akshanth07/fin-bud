from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from app.schemas.common import BaseSchema


class MarketNewsItemSchema(BaseModel):
    uuid: str
    title: str
    description: str
    image_url: str
    source: str
    published_at: str
    category: str
    url: str
    symbols: List[str] = []
    industries: List[str] = []
    sentiment: str = "Neutral"


class MarketNewsListResponse(BaseModel):
    success: bool = True
    message: str = "Market news retrieved successfully"
    data: List[MarketNewsItemSchema]


class MarketNewsBase(BaseSchema):
    title: str
    source: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None
    published_at: Optional[datetime] = None


class MarketNewsCreate(MarketNewsBase):
    pass


class MarketNewsUpdate(BaseModel):
    title: Optional[str] = None
    source: Optional[str] = None
    url: Optional[str] = None
    summary: Optional[str] = None
    published_at: Optional[datetime] = None


class MarketNewsResponse(MarketNewsBase):
    id: UUID
    created_at: datetime
