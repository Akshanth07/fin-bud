from datetime import datetime
from typing import Any, Dict, Optional, List
from uuid import UUID, uuid4
from sqlalchemy import Text, Boolean, Integer, Numeric, DateTime, func, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class GovernmentScheme(Base, TimestampMixin):
    __tablename__ = "government_schemes"
    __table_args__ = (
        Index("idx_schemes_code", "scheme_code"),
        Index("idx_schemes_category", "category"),
        Index("idx_schemes_state", "state"),
        Index("idx_schemes_status", "status"),
        Index("idx_schemes_ministry", "ministry"),
        {"schema": "public"}
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    scheme_code: Mapped[str] = mapped_column(Text, unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    scheme_name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(Text, nullable=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    benefits: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")
    eligibility_rules: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False, server_default="{}")
    eligibility_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    official_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    documents_required: Mapped[List[Any]] = mapped_column(JSONB, nullable=False, server_default="[]")
    application_process: Mapped[List[Any]] = mapped_column(JSONB, nullable=False, server_default="[]")
    state: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default="All", index=True)
    ministry: Mapped[Optional[str]] = mapped_column(Text, nullable=True, index=True)
    source: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default="myScheme")
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    deadline: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="ACTIVE", index=True)  # ACTIVE, INACTIVE, EXPIRED, ARCHIVED
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    saved_by: Mapped[List["SavedScheme"]] = relationship("SavedScheme", back_populates="scheme", cascade="all, delete-orphan")
    matches: Mapped[List["UserSchemeMatch"]] = relationship("UserSchemeMatch", back_populates="scheme", cascade="all, delete-orphan")


class UserSchemeMatch(Base):
    __tablename__ = "user_scheme_matches"
    __table_args__ = (
        UniqueConstraint("user_id", "scheme_id", name="user_scheme_matches_unique"),
        {"schema": "public"}
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id: Mapped[UUID] = mapped_column(ForeignKey("public.government_schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    eligibility_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.00)
    matched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="scheme_matches")
    scheme: Mapped["GovernmentScheme"] = relationship("GovernmentScheme", back_populates="matches")


class SavedScheme(Base):
    __tablename__ = "saved_schemes"
    __table_args__ = (
        UniqueConstraint("user_id", "scheme_id", name="saved_schemes_user_scheme_unique"),
        Index("idx_saved_schemes_user", "user_id"),
        Index("idx_saved_schemes_status", "application_status"),
        {"schema": "public"}
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id: Mapped[UUID] = mapped_column(ForeignKey("public.government_schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    application_status: Mapped[str] = mapped_column(Text, nullable=False, default="Interested")  # Interested, Applied, Approved, Rejected, Completed
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="saved_schemes")
    scheme: Mapped["GovernmentScheme"] = relationship("GovernmentScheme", back_populates="saved_by")


class SchemeSyncLog(Base):
    __tablename__ = "scheme_sync_logs"
    __table_args__ = (
        Index("idx_sync_logs_source", "source"),
        Index("idx_sync_logs_status", "sync_status"),
        {"schema": "public"}
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    source: Mapped[str] = mapped_column(Text, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    new_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    inactive_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    sync_status: Mapped[str] = mapped_column(Text, nullable=False, default="IN_PROGRESS")  # SUCCESS, FAILED, IN_PROGRESS
