from datetime import date
from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import Text, Numeric, Float, Date, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class InsurancePolicy(Base, TimestampMixin):
    __tablename__ = "insurance_policies"
    __table_args__ = (
        Index("idx_insurance_user", "user_id"),
        Index("idx_insurance_number", "policy_number"),
        Index("idx_insurance_type", "policy_type"),
        {"schema": "public"}
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False, index=True)

    company: Mapped[str] = mapped_column(Text, nullable=False, default="Insurance Provider")
    provider: Mapped[str] = mapped_column(Text, nullable=False, default="Insurance Provider")

    policy_number: Mapped[Optional[str]] = mapped_column(Text, nullable=True, index=True)
    policy_holder: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    policy_type: Mapped[str] = mapped_column(Text, nullable=False, default="Health Insurance")
    plan_name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    policy_name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    coverage_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    premium_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    premium: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    premium_frequency: Mapped[str] = mapped_column(Text, nullable=False, default="Annual")

    nominee: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    renewal_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, index=True)
    maturity_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    claim_contact: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="Active")

    ocr_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    document_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="insurance_policies")
