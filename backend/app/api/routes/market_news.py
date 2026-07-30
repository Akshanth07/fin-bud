import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, Query, Body, status

from app.schemas.news import MarketNewsItemSchema
from app.services.market_news_service import market_news_service
from app.services.groq_service import groq_service
from app.utils.response import success_response

router = APIRouter(prefix="/market-news", tags=["Market News"])

# 15-minute in-memory cache for AI Market Summary
_SUMMARY_CACHE: Dict[str, Any] = {}
_SUMMARY_CACHE_TIMESTAMP: float = 0.0
CACHE_TTL_SECONDS = 900.0  # 15 minutes

# 24-hour in-memory cache for Article AI Insights (key: article title or uuid)
_ARTICLE_INSIGHT_CACHE: Dict[str, Dict[str, Any]] = {}
ARTICLE_CACHE_TTL_SECONDS = 86400.0  # 24 hours


@router.get("", response_model=None)
async def get_market_news(
    search: Optional[str] = Query(None, description="Search query string"),
    category: Optional[str] = Query(None, description="Filter by category (e.g. Repo Rate, Inflation, Tax, Insurance, Gold, Mutual Funds, Stocks, General Finance)"),
    time_filter: Optional[str] = Query(None, alias="time_filter", description="Time filter (today, this week, this month)"),
    today: Optional[bool] = Query(False, description="Filter today's news"),
    this_week: Optional[bool] = Query(False, description="Filter this week's news"),
    this_month: Optional[bool] = Query(False, description="Filter this month's news"),
    sort: Optional[str] = Query("latest", description="Sort order (latest, oldest)"),
    limit: int = Query(20, ge=1, le=100, description="Max number of items")
):
    """
    Retrieve market news from MarketAux service.
    Supports search, category, time filters (today, this week, this month), and sorting.
    """
    tf = time_filter
    if not tf:
        if today:
            tf = "today"
        elif this_week:
            tf = "this week"
        elif this_month:
            tf = "this month"

    items = await market_news_service.fetch_market_news(
        search=search,
        category=category,
        time_filter=tf,
        sort=sort,
        limit=limit
    )

    return success_response(
        data=items,
        message="Market news feed retrieved successfully"
    )


@router.get("/ai-summary", response_model=None)
async def get_market_news_ai_summary(
    force_refresh: bool = Query(False, description="Force refresh cache and generate fresh AI summary"),
):
    """
    Generate or return 15-minute cached AI-powered market news summary using Groq LLM.
    """
    global _SUMMARY_CACHE, _SUMMARY_CACHE_TIMESTAMP

    now = time.time()
    if not force_refresh and _SUMMARY_CACHE and (now - _SUMMARY_CACHE_TIMESTAMP < CACHE_TTL_SECONDS):
        return success_response(
            data=_SUMMARY_CACHE,
            message="Cached AI market news summary retrieved successfully"
        )

    # Fetch latest articles to generate summary
    items = await market_news_service.fetch_market_news(limit=20)
    
    # Convert item schemas/dicts to article list
    articles_data = []
    for item in items:
        if isinstance(item, dict):
            articles_data.append(item)
        elif hasattr(item, "model_dump"):
            articles_data.append(item.model_dump(mode="json"))

    # Generate summary using existing Groq service
    ai_result = groq_service.generate_market_news_summary(articles_data)
    ai_result["last_updated"] = datetime.now(timezone.utc).isoformat()

    # Update cache
    _SUMMARY_CACHE = ai_result
    _SUMMARY_CACHE_TIMESTAMP = now

    return success_response(
        data=ai_result,
        message="AI market news summary generated successfully"
    )


@router.post("/article-insight", response_model=None)
async def get_single_article_insight(
    article: Dict[str, Any] = Body(..., description="Article payload object"),
    force_refresh: bool = Query(False, description="Bypass 24h cache")
):
    """
    Generate or return 24-hour cached AI insight for a single article using Groq LLM.
    """
    global _ARTICLE_INSIGHT_CACHE

    cache_key = str(article.get("uuid") or article.get("title") or article.get("url") or "").strip()
    if not cache_key:
        cache_key = "default_article"

    now = time.time()
    cached_entry = _ARTICLE_INSIGHT_CACHE.get(cache_key)
    if not force_refresh and cached_entry and (now - cached_entry.get("cached_at", 0) < ARTICLE_CACHE_TTL_SECONDS):
        return success_response(
            data=cached_entry.get("data"),
            message="Cached article AI insight retrieved successfully"
        )

    # Generate deep single article insight
    insight_data = groq_service.analyze_single_article(article)

    # Store in 24h cache
    _ARTICLE_INSIGHT_CACHE[cache_key] = {
        "cached_at": now,
        "data": insight_data
    }

    return success_response(
        data=insight_data,
        message="Article AI insight generated successfully"
    )
