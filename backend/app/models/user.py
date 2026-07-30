from datetime import date, datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlalchemy import String, Text, Numeric, Date, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"}

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    full_name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(Text, unique=True, index=True, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    occupation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    annual_income: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    monthly_income: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    monthly_expenses: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    savings: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    emergency_fund: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    total_assets: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    total_liabilities: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    risk_profile: Mapped[Optional[str]] = mapped_column(Text, default="moderate")
    marital_status: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    currency: Mapped[Optional[str]] = mapped_column(Text, default="INR")
    investment_goal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emergency_fund_goal: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00)
    financial_health_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.00)

    # Relationships
    investments: Mapped[List["Investment"]] = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    loans: Mapped[List["Loan"]] = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    insurance_policies: Mapped[List["InsurancePolicy"]] = relationship("InsurancePolicy", back_populates="user", cascade="all, delete-orphan")
    goals: Mapped[List["Goal"]] = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    life_event_simulations: Mapped[List["LifeEventSimulation"]] = relationship("LifeEventSimulation", back_populates="user", cascade="all, delete-orphan")
    scheme_matches: Mapped[List["UserSchemeMatch"]] = relationship("UserSchemeMatch", back_populates="user", cascade="all, delete-orphan")
    saved_schemes: Mapped[List["SavedScheme"]] = relationship("SavedScheme", back_populates="user", cascade="all, delete-orphan")
    ai_insights: Mapped[List["AIInsight"]] = relationship("AIInsight", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    income_sources: Mapped[List["IncomeSource"]] = relationship("IncomeSource", back_populates="user", cascade="all, delete-orphan")
    expenses: Mapped[List["Expense"]] = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    assets: Mapped[List["Asset"]] = relationship("Asset", back_populates="user", cascade="all, delete-orphan")
