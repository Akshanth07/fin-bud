from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.investments import router as investments_router
from app.api.routes.loans import router as loans_router
from app.api.routes.insurance import router as insurance_router
from app.api.routes.goals import router as goals_router
from app.api.routes.life_events import router as life_events_router
from app.api.routes.government_schemes import router as government_schemes_router
from app.api.routes.ai_insights import router as ai_insights_router
from app.api.routes.market_news import router as market_news_router
from app.api.routes.notifications import router as notifications_router
from app.api.routes.income import router as income_router
from app.api.routes.expenses import router as expenses_router
from app.api.routes.assets import router as assets_router
from app.api.routes.market_tickers import router as market_tickers_router

__all__ = [
    "health_router",
    "auth_router",
    "users_router",
    "dashboard_router",
    "investments_router",
    "loans_router",
    "insurance_router",
    "goals_router",
    "life_events_router",
    "government_schemes_router",
    "ai_insights_router",
    "market_news_router",
    "notifications_router",
    "income_router",
    "expenses_router",
    "assets_router",
    "market_tickers_router",
]
