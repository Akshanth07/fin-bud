from datetime import date
from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import Text, Numeric, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Goal(Base, TimestampMixin):
    __tablename__ = "goals"
    __table_args__ = {"schema": "public"}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_name: Mapped[str] = mapped_column(Text, nullable=False)
    goal_type: Mapped[str] = mapped_column(Text, nullable=False, default="custom", server_default="custom")
    target_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    current_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(Text, nullable=False, default="medium", server_default="medium")
    status: Mapped[str] = mapped_column(Text, nullable=False, default="in_progress", index=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="goals")
