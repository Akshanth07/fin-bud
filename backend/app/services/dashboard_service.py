import asyncio
from typing import Any, Dict
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.income_repository import income_repository
from app.repositories.expense_repository import expense_repository
from app.repositories.asset_repository import asset_repository
from app.repositories.investment_repository import investment_repository
from app.repositories.loan_repository import loan_repository
from app.repositories.insurance_repository import insurance_repository
from app.repositories.goal_repository import goal_repository
from app.repositories.user_repository import user_repository


class DashboardService:
    async def get_user_dashboard_summary(self, db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        """
        Calculates all financial metrics dynamically on-the-fly via concurrent database queries:
        - Monthly Income = SUM(income_sources)
        - Monthly Expenses = SUM(expenses)
        - Total Assets = SUM(assets.valuation)
        - Total Investments = SUM(investments.current_value)
        - Total Liabilities = SUM(loans.outstanding_amount)
        - Net Worth = Total Assets + Total Investments - Total Liabilities
        - Monthly Savings = Monthly Income - Monthly Expenses
        - Savings Rate = (Monthly Savings / Monthly Income) * 100
        - Debt-to-Income Ratio = (SUM(loans.emi) / Monthly Income) * 100
        """
        (
            user,
            income_items,
            expense_items,
            asset_items,
            investment_items,
            loan_items,
            insurance_items,
            goal_items,
        ) = await asyncio.gather(
            user_repository.get_by_id(db, user_id),
            income_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            expense_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            asset_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            investment_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            loan_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            insurance_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            goal_repository.get_multi_by_user(db, user_id=user_id, limit=500),
        )


        monthly_income = sum(float(item.monthly_amount or 0.0) for item in income_items)
        monthly_expenses = sum(float(item.amount or 0.0) for item in expense_items)

        # Dedicated Assets Valuation (Cash, Savings, Gold, Real Estate, Vehicle, Crypto, etc.)
        total_assets = sum(float(item.valuation or 0.0) for item in asset_items)

        # Investments Valuation (Stocks, Mutual Funds, ETFs, Bonds)
        total_investments = sum(
            float(item.current_value or 0.0) if getattr(item, "current_value", None) is not None else float((item.quantity or 0.0) * (item.current_price or 0.0))
            for item in investment_items
        )

        user_emergency_fund = float(user.emergency_fund) if user and user.emergency_fund else 0.0

        total_liabilities = sum(float(item.outstanding_amount or 0.0) for item in loan_items)
        total_monthly_emi = sum(float(item.emi or 0.0) for item in loan_items)
        total_insurance_coverage = sum(float(item.coverage_amount or 0.0) for item in insurance_items)

        # Net Worth Formula: Total Assets + Total Investments - Total Liabilities
        net_worth = (total_assets + total_investments + user_emergency_fund) - total_liabilities
        monthly_savings = monthly_income - monthly_expenses

        savings_rate = (monthly_savings / monthly_income * 100.0) if monthly_income > 0 else 0.0
        debt_to_income = (total_monthly_emi / monthly_income * 100.0) if monthly_income > 0 else 0.0
        emergency_coverage = (user_emergency_fund / monthly_expenses) if monthly_expenses > 0 else 0.0

        # Dynamic Financial Health Score (0 - 100)
        score = 0.0

        # 1. Savings Rate Component (max 30 pts)
        if savings_rate >= 30:
            score += 30.0
        elif savings_rate > 0:
            score += (savings_rate / 30.0) * 30.0

        # 2. Debt Ratio Component (max 25 pts)
        if debt_to_income == 0 and monthly_income > 0:
            score += 25.0
        elif debt_to_income <= 30:
            score += 20.0
        elif debt_to_income <= 50:
            score += 10.0

        # 3. Emergency Fund Component (max 20 pts)
        if emergency_coverage >= 6:
            score += 20.0
        elif emergency_coverage > 0:
            score += (emergency_coverage / 6.0) * 20.0

        # 4. Insurance Component (max 15 pts)
        if total_insurance_coverage >= (monthly_income * 12 * 5):
            score += 15.0
        elif len(insurance_items) > 0:
            score += 10.0

        # 5. Goal Completion Component (max 10 pts)
        if goal_items:
            achieved = sum(1 for g in goal_items if getattr(g, "status", "") == "achieved")
            score += (achieved / len(goal_items)) * 10.0
        else:
            score += 5.0

        health_score = round(min(max(score, 0.0), 100.0), 1)

        return {
            "user_id": str(user_id),
            "financial_health_score": health_score,
            "net_worth": round(net_worth, 2),
            "monthly_income": round(monthly_income, 2),
            "monthly_expenses": round(monthly_expenses, 2),
            "monthly_savings": round(monthly_savings, 2),
            "savings_rate": round(savings_rate, 1),
            "debt_to_income_ratio": round(debt_to_income, 1),
            "emergency_fund_coverage": round(emergency_coverage, 1),
            "total_assets": round(total_assets, 2),
            "total_investments": round(total_investments, 2),
            "total_liabilities": round(total_liabilities, 2),
            "summaries": {
                "assets_count": len(asset_items),
                "assets_total_valuation": round(total_assets, 2),
                "investments_count": len(investment_items),
                "investments_total_value": round(total_investments, 2),
                "loans_count": len(loan_items),
                "loans_total_outstanding": round(total_liabilities, 2),
                "insurance_count": len(insurance_items),
                "insurance_total_coverage": round(total_insurance_coverage, 2),
                "goals_count": len(goal_items),
                "income_sources_count": len(income_items),
                "expenses_count": len(expense_items),
            }
        }

    async def get_chart_data(self, db: AsyncSession, user_id: UUID, chart_type: str) -> Dict[str, Any]:
        """Returns dynamic chart data for frontend visualizations."""
        (
            income_items,
            expense_items,
            asset_items,
            investment_items,
            loan_items,
        ) = await asyncio.gather(
            income_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            expense_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            asset_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            investment_repository.get_multi_by_user(db, user_id=user_id, limit=500),
            loan_repository.get_multi_by_user(db, user_id=user_id, limit=500),
        )


        if chart_type == "income-vs-expenses":
            total_income = sum(float(i.monthly_amount or 0.0) for i in income_items)
            total_expenses = sum(float(e.amount or 0.0) for e in expense_items)
            return {
                "chart_type": "income-vs-expenses",
                "categories": ["Monthly Income", "Monthly Expenses", "Monthly Savings"],
                "data": [round(total_income, 2), round(total_expenses, 2), round(max(total_income - total_expenses, 0), 2)]
            }

        elif chart_type in ("assets-by-category", "asset-allocation"):
            category_totals: Dict[str, float] = {}
            for item in asset_items:
                cat = item.asset_type or "Other Asset"
                category_totals[cat] = category_totals.get(cat, 0.0) + float(item.valuation or 0.0)
            
            for item in investment_items:
                cat = item.asset_type or "Investments"
                val = float(item.current_value or 0.0) if getattr(item, "current_value", None) is not None else float((item.quantity or 0.0) * (item.current_price or 0.0))
                category_totals[cat] = category_totals.get(cat, 0.0) + val

            return {
                "chart_type": chart_type,
                "labels": list(category_totals.keys()) if category_totals else ["Cash & Savings"],
                "values": [round(v, 2) for v in category_totals.values()] if category_totals else [0.0]
            }

        elif chart_type == "liabilities-by-category":
            category_totals: Dict[str, float] = {}
            for item in loan_items:
                cat = item.loan_type or "Other Loan"
                category_totals[cat] = category_totals.get(cat, 0.0) + float(item.outstanding_amount or 0.0)

            return {
                "chart_type": "liabilities-by-category",
                "labels": list(category_totals.keys()) if category_totals else ["No Liabilities"],
                "values": [round(v, 2) for v in category_totals.values()] if category_totals else [0.0]
            }

        return {"chart_type": chart_type, "data": []}


dashboard_service = DashboardService()
