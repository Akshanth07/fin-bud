from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import Text, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Investment(Base, TimestampMixin):
    __tablename__ = "investments"
    __table_args__ = {"schema": "public"}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_name: Mapped[str] = mapped_column(Text, nullable=False)
    asset_type: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(15, 4), nullable=False, default=0.0)
    purchase_price: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    current_price: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.00)
    platform: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    interest_rate: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True, default=7.0)
    tenure_years: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True, default=1.0)
    compounding_frequency: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default="Quarterly")

    @property
    def current_value(self) -> float:
        """Dynamically calculates total valuation with special compound interest formula for Fixed Deposits."""
        if self.asset_type and "fixed deposit" in self.asset_type.lower():
            principal = float(self.purchase_price or 0.0)
            if principal <= 0:
                principal = float(self.quantity or 1.0) * float(self.current_price or 0.0)
            if principal <= 0:
                principal = float(self.current_price or 0.0)

            rate = float(self.interest_rate or 7.0)
            tenure = float(self.tenure_years or 1.0)
            freq = str(self.compounding_frequency or "Quarterly").lower()

            n = 4  # Default quarterly compounding for Indian FD
            if "monthly" in freq:
                n = 12
            elif "half" in freq or "semi" in freq:
                n = 2
            elif "annual" in freq:
                n = 1
            elif "simple" in freq:
                n = 0

            if n == 0:
                maturity = principal * (1.0 + (rate * tenure / 100.0))
            else:
                maturity = principal * ((1.0 + (rate / (100.0 * n))) ** (n * tenure))

            return round(maturity, 2)

        if self.quantity is not None and self.current_price is not None:
            return round(float(self.quantity) * float(self.current_price), 2)
        return 0.0

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="investments")

