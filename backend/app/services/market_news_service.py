import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
import httpx

from app.core.config import settings

logger = logging.getLogger("financialos.market_news_service")

# High quality financial placeholder images from Unsplash
FINANCE_PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&auto=format&fit=crop&q=80"
]

def get_placeholder_image(index_key: str) -> str:
    """Select a deterministic placeholder image based on string hash."""
    idx = abs(hash(index_key)) % len(FINANCE_PLACEHOLDER_IMAGES)
    return FINANCE_PLACEHOLDER_IMAGES[idx]

def determine_category_and_impact(title: str, description: str, raw_categories: List[str] = None) -> str:
    """Determine financial category based on text analysis or raw category."""
    text = (title + " " + (description or "")).lower()
    
    if any(k in text for k in ["repo rate", "rbi", "fed rate", "interest rate", "central bank"]):
        return "Repo Rate"
    elif any(k in text for k in ["inflation", "cpi", "wpi", "price index", "cost of living"]):
        return "Inflation"
    elif any(k in text for k in ["tax", "gst", "income tax", "capital gains", "tds", "fiscal"]):
        return "Tax"
    elif any(k in text for k in ["insurance", "policy", "premium", "coverage", "claim"]):
        return "Insurance"
    elif any(k in text for k in ["gold", "silver", "precious metal", "bullion"]):
        return "Gold"
    elif any(k in text for k in ["mutual fund", "sip", "etf", "nav", "asset management"]):
        return "Mutual Funds"
    elif any(k in text for k in ["stock", "equity", "share", "nifty", "sensex", "nasdaq", "earnings", "bull", "bear"]):
        return "Stocks"
    else:
        return "General Finance"


# Fallback dataset when MarketAux API key is invalid or unreachable
DEMO_FALLBACK_NEWS: List[Dict[str, Any]] = [
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f001",
        "title": "RBI Monetary Policy Committee Keeps Repo Rate Unchanged at 6.5%",
        "description": "The Reserve Bank of India governor announced that the MPC unanimously decided to hold the benchmark repo rate at 6.5% while retaining the stance of withdrawal of accommodation.",
        "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
        "source": "Financial Express",
        "published_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
        "category": "Repo Rate",
        "url": "https://www.financialexpress.com/market/rbi-monetary-policy-live-updates-repo-rate-decision-2026/34001/",
        "symbols": ["RBI", "BANKNIFTY"],
        "industries": ["Banking", "Macroeconomics"],
        "sentiment": "Neutral"
    },
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f002",
        "title": "Consumer Inflation Cools Down to 4.8% as Food Prices Moderating Rapidly",
        "description": "India's retail inflation based on Consumer Price Index (CPI) moderated significantly, providing relief to households and boosting consumer sentiment across urban centers.",
        "image_url": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
        "source": "Bloomberg",
        "published_at": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat(),
        "category": "Inflation",
        "url": "https://www.bloomberg.com/news/articles/2026-07-30/india-cpi-inflation-cools",
        "symbols": ["CPI", "INFLATION"],
        "industries": ["Consumer Goods", "Economy"],
        "sentiment": "Bullish"
    },
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f003",
        "title": "New Tax Slabs Revision: Standard Deduction Boosted for Salaried Individuals",
        "description": "The Finance Ministry has proposed enhanced tax benefits under the New Tax Regime, giving salaried employees higher disposable income and simplified tax filing procedures.",
        "image_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
        "source": "Economic Times",
        "published_at": (datetime.now(timezone.utc) - timedelta(hours=7)).isoformat(),
        "category": "Tax",
        "url": "https://economictimes.indiatimes.com/wealth/tax/new-tax-regime-updates-standard-deduction-2026/articleshow/10901234.cms",
        "symbols": ["TAX", "INCOMETAX"],
        "industries": ["Public Policy", "Personal Finance"],
        "sentiment": "Bullish"
    },
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f004",
        "title": "IRDAI Streamlines Health Insurance Claims Settlement within 3 Hours",
        "description": "Insurance Regulatory and Development Authority of India issues new directives ordering health insurance firms to settle cashless claims within three hours of discharge approval.",
        "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
        "source": "Mint",
        "published_at": (datetime.now(timezone.utc) - timedelta(hours=11)).isoformat(),
        "category": "Insurance",
        "url": "https://www.livemint.com/insurance/news/irdai-3-hour-cashless-claim-settlement-guidelines-2026.html",
        "symbols": ["HDFCLIFE", "SBILIFE"],
        "industries": ["Insurance", "Healthcare"],
        "sentiment": "Bullish"
    },
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f005",
        "title": "Gold Prices Surge Near All-Time Highs Amid Global Central Bank Purchases",
        "description": "Bullion markets experienced robust demand as international central banks continue diversifying reserves into physical gold bullion, sending domestic gold rates upward.",
        "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80",
        "source": "Reuters",
        "published_at": (datetime.now(timezone.utc) - timedelta(hours=14)).isoformat(),
        "category": "Gold",
        "url": "https://www.reuters.com/markets/commodities/gold-prices-rally-central-bank-buying-2026/",
        "symbols": ["GOLD", "XAUUSD"],
        "industries": ["Commodities", "Precious Metals"],
        "sentiment": "Bullish"
    },
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f006",
        "title": "Mutual Fund Monthly SIP Inflows Hit Record ₹21,000 Crore",
        "description": "Retail investors demonstrated unwavering confidence as Systematic Investment Plan (SIP) contributions reached an all-time high, driving strong liquidity in equity markets.",
        "image_url": "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&auto=format&fit=crop&q=80",
        "source": "Business Standard",
        "published_at": (datetime.now(timezone.utc) - timedelta(days=1, hours=3)).isoformat(),
        "category": "Mutual Funds",
        "url": "https://www.business-standard.com/markets/news/amfi-sip-inflow-record-high-july-2026.html",
        "symbols": ["AMFI", "NIFTY50"],
        "industries": ["Asset Management", "Investing"],
        "sentiment": "Bullish"
    },
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f007",
        "title": "Tech Sector Leads Benchmark Indices Rally Following Strong Quarterly Earnings",
        "description": "Major IT exporters posted better-than-expected operating margins and upbeat deal pipelines, driving Nifty IT index up by 2.4% in early morning trading.",
        "image_url": "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&auto=format&fit=crop&q=80",
        "source": "Wall Street Journal",
        "published_at": (datetime.now(timezone.utc) - timedelta(days=1, hours=8)).isoformat(),
        "category": "Stocks",
        "url": "https://www.wsj.com/finance/stocks/tech-rally-quarterly-earnings-2026.html",
        "symbols": ["TCS", "INFY", "AAPL", "NVDA"],
        "industries": ["Technology", "Stock Market"],
        "sentiment": "Bullish"
    },
    {
        "uuid": "4f18392a-8b1e-4c7b-b51d-91a10024f008",
        "title": "Global Market Wrap: Asian Equities Mixed as Investors Await Economic Data",
        "description": "Equity markets across Asia showed cautious trading as market participants evaluate global growth indicators, currency movements, and oil price fluctuations.",
        "image_url": "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&auto=format&fit=crop&q=80",
        "source": "CNBC",
        "published_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        "category": "General Finance",
        "url": "https://www.cnbc.com/2026/07/30/asia-markets-wrap-stocks-currencies.html",
        "symbols": ["NIKKEI", "HANGSENG"],
        "industries": ["Global Markets", "Macroeconomics"],
        "sentiment": "Neutral"
    }
]


class MarketNewsService:
    """Service dedicated to fetching and normalizing financial news from MarketAux API with high quality fallbacks."""

    def __init__(self):
        self.api_url = "https://api.marketaux.com/v1/news/all"

    async def fetch_market_news(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        time_filter: Optional[str] = None,
        sort: Optional[str] = "latest",
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Fetch MarketAux news, normalize response structure, and return.
        If MarketAux key is missing or fails, return normalized fallback news.
        """
        api_key = settings.MARKETAUX_API_KEY.strip()
        is_placeholder_key = not api_key or "PASTE_YOUR_API_KEY" in api_key or api_key == "your_marketaux_api_key"

        if not is_placeholder_key:
            try:
                # Prepare MarketAux query parameters
                params: Dict[str, Any] = {
                    "api_token": api_key,
                    "language": "en",
                    "limit": min(limit, 50)
                }

                if search and search.strip():
                    params["search"] = search.strip()

                if category and category.lower() != "all":
                    # Map UI categories to search keywords or MarketAux categories
                    params["search"] = f"{params.get('search', '')} {category}".strip()

                # Handle time filter
                now = datetime.now(timezone.utc)
                if time_filter == "today":
                    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                    params["published_after"] = today_start.strftime("%Y-%m-%dT%H:%M:%S")
                elif time_filter == "this week":
                    week_start = now - timedelta(days=7)
                    params["published_after"] = week_start.strftime("%Y-%m-%dT%H:%M:%S")
                elif time_filter == "this month":
                    month_start = now - timedelta(days=30)
                    params["published_after"] = month_start.strftime("%Y-%m-%dT%H:%M:%S")

                # Handle sort parameter
                if sort == "latest":
                    params["sort"] = "published_at"

                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(self.api_url, params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_articles = data.get("data", [])
                        if raw_articles:
                            return [self._normalize_marketaux_item(item) for item in raw_articles]
                    else:
                        logger.warning(f"MarketAux API returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Error fetching news from MarketAux: {e}", exc_info=True)

        # Return filtered fallback news if MarketAux API call was not performed or failed
        return self._get_fallback_news(search=search, category=category, time_filter=time_filter, sort=sort)

    def _normalize_marketaux_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize MarketAux raw item into standardized FinancialOS schema."""
        raw_uuid = str(item.get("uuid") or uuid.uuid4())
        title = item.get("title") or "Financial Market Update"
        description = item.get("description") or item.get("snippet") or "No description provided."
        
        # Image URL fallback logic
        image_url = item.get("image_url")
        if not image_url or not isinstance(image_url, str) or not image_url.startswith("http"):
            image_url = get_placeholder_image(raw_uuid + title)

        source = item.get("source") or "MarketAux News"
        published_at = item.get("published_at") or datetime.now(timezone.utc).isoformat()
        raw_cats = item.get("categories") or []
        cat_name = determine_category_and_impact(title, description, raw_cats)
        
        # Extract entities / symbols & industries
        entities = item.get("entities") or []
        symbols = []
        industries = []
        sentiment_scores = []
        
        for ent in entities:
            if isinstance(ent, dict):
                if ent.get("symbol"):
                    symbols.append(str(ent.get("symbol")).upper())
                if ent.get("industry"):
                    industries.append(str(ent.get("industry")))
                if ent.get("sentiment_score") is not None:
                    sentiment_scores.append(float(ent.get("sentiment_score")))

        # Deduplicate
        symbols = list(dict.fromkeys(symbols))[:5]
        industries = list(dict.fromkeys(industries))[:3]

        # Calculate sentiment text
        sentiment = "Neutral"
        if sentiment_scores:
            avg_score = sum(sentiment_scores) / len(sentiment_scores)
            if avg_score > 0.15:
                sentiment = "Bullish"
            elif avg_score < -0.15:
                sentiment = "Bearish"

        return {
            "uuid": raw_uuid,
            "title": title,
            "description": description,
            "image_url": image_url,
            "source": source,
            "published_at": published_at,
            "category": cat_name,
            "url": item.get("url") or "#",
            "symbols": symbols if symbols else ["FINANCE"],
            "industries": industries if industries else ["Finance"],
            "sentiment": sentiment
        }

    def _get_fallback_news(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        time_filter: Optional[str] = None,
        sort: Optional[str] = "latest"
    ) -> List[Dict[str, Any]]:
        """Filter and sort local fallback dataset."""
        items = list(DEMO_FALLBACK_NEWS)

        # Filter by search string
        if search and search.strip():
            s = search.strip().lower()
            items = [
                i for i in items
                if s in i["title"].lower()
                or s in i["description"].lower()
                or s in i["source"].lower()
                or any(s in sym.lower() for sym in i.get("symbols", []))
            ]

        # Filter by category
        if category and category.lower() != "all":
            c = category.strip().lower()
            items = [i for i in items if i["category"].lower() == c]

        # Sort items
        if sort == "oldest":
            items.sort(key=lambda x: x["published_at"])
        else:
            items.sort(key=lambda x: x["published_at"], reverse=True)

        return items


market_news_service = MarketNewsService()
