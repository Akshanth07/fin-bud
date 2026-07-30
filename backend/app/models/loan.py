from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import Text, Numeric, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Loan(Base, TimestampMixin):
    __tablename__ = "loans"
    __table_args__ = {"schema": "public"}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False, index=True)
    loan_type: Mapped[str] = mapped_column(Text, nullable=False)
    lender: Mapped[str] = mapped_column(Text, nullable=False)
    principal_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    outstanding_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    interest_rate: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.00)
    emi: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    tenure: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="loans")
