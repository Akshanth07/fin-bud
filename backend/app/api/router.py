from fastapi import APIRouter
from app.api.routes import (
    health_router,
    auth_router,
    users_router,
    dashboard_router,
    investments_router,
    loans_router,
    insurance_router,
    goals_router,
    life_events_router,
    government_schemes_router,
    ai_insights_router,
    market_news_router,
    notifications_router,
    income_router,
    expenses_router,
    assets_router,
    market_tickers_router,
)

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(dashboard_router)
api_router.include_router(investments_router)
api_router.include_router(loans_router)
api_router.include_router(insurance_router)
api_router.include_router(goals_router)
api_router.include_router(life_events_router)
api_router.include_router(government_schemes_router)
api_router.include_router(government_schemes_router, prefix="/government-schemes")
api_router.include_router(ai_insights_router)
api_router.include_router(market_news_router)
api_router.include_router(notifications_router)
api_router.include_router(income_router)
api_router.include_router(income_router, prefix="/income")
api_router.include_router(expenses_router)
api_router.include_router(assets_router)
api_router.include_router(market_tickers_router)
