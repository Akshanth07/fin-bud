from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import Text, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class IncomeSource(Base, TimestampMixin):
    __tablename__ = "income_sources"
    __table_args__ = {"schema": "public"}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name: Mapped[str] = mapped_column(Text, nullable=False)
    monthly_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    frequency: Mapped[str] = mapped_column(Text, nullable=False, default="monthly")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="income_sources")
