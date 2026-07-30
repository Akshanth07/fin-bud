import json
import logging
import os
import time
from typing import Any, Dict, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class GroqService:
    """
    Production-grade Groq AI Service using the official Groq SDK.
    Provides structured AI analysis, retries with exponential backoff,
    timeout safety, error classification, and graceful fallbacks.
    """

    PRIMARY_MODEL = "llama-3.3-70b-versatile"
    FALLBACK_MODEL = "llama3-70b-8192"
    MAX_RETRIES = 3
    TIMEOUT_SECONDS = 10.0

    def _get_api_key(self) -> Optional[str]:
        """Dynamically retrieve live API key from settings or environment."""
        key = getattr(settings, "GROQ_API_KEY", "") or os.getenv("GROQ_API_KEY", "")
        if key and isinstance(key, str):
            key = key.strip()
            if key and not key.startswith("your-") and not key.startswith("placeholder"):
                return key
        return None

    def _get_client(self):
        """Instantiate Groq SDK client with dynamic key and timeout setting."""
        api_key = self._get_api_key()
        if not api_key:
            logger.warning("Groq API Key is missing or invalid. AI features will use rule-based fallback responses.")
            return None

        try:
            from groq import Groq
            return Groq(api_key=api_key, timeout=self.TIMEOUT_SECONDS)
        except Exception as err:
            logger.error(f"Failed to initialize Groq SDK client: {err}")
            return None

    def _call_groq_completion(self, messages: List[Dict[str, str]], json_mode: bool = True) -> Optional[str]:
        """
        Internal completion helper with retry logic, exponential backoff,
        model fallback, and comprehensive exception handling.
        """
        client = self._get_client()
        if not client:
            return None

        models_to_try = [getattr(settings, "GROQ_MODEL", self.PRIMARY_MODEL), self.FALLBACK_MODEL]

        for model_name in models_to_try:
            for attempt in range(1, self.MAX_RETRIES + 1):
                start_time = time.time()
                try:
                    kwargs: Dict[str, Any] = {
                        "messages": messages,
                        "model": model_name,
                        "temperature": 0.2,
                        "max_tokens": 1024,
                    }
                    if json_mode:
                        kwargs["response_format"] = {"type": "json_object"}

                    completion = client.chat.completions.create(**kwargs)
                    elapsed_ms = round((time.time() - start_time) * 1000, 2)
                    logger.info(f"Groq API call succeeded | model={model_name} | attempt={attempt} | duration_ms={elapsed_ms}")

                    content = completion.choices[0].message.content
                    if content and content.strip():
                        return content
                    else:
                        logger.warning(f"Groq API returned empty content | model={model_name}")

                except Exception as err:
                    elapsed_ms = round((time.time() - start_time) * 1000, 2)
                    err_str = str(err)
                    err_type = type(err).__name__

                    if "401" in err_str or "AuthenticationError" in err_type or "invalid_api_key" in err_str.lower():
                        logger.error(f"Groq API Authentication Error (401): Invalid API Key configured. Skipping retries.")
                        return None
                    elif "404" in err_str or "NotFoundError" in err_type or "model_not_found" in err_str.lower():
                        logger.warning(f"Groq Model '{model_name}' not found (404). Trying secondary model.")
                        break
                    elif "429" in err_str or "RateLimitError" in err_type:
                        backoff = min(2 ** attempt, 10)
                        logger.warning(f"Groq Rate Limit (429) on attempt {attempt}/{self.MAX_RETRIES}. Backing off {backoff}s...")
                        time.sleep(backoff)
                    elif "timeout" in err_str.lower() or "connection" in err_str.lower():
                        backoff = 1 * attempt
                        logger.warning(f"Groq Connection Timeout ({err_type}) on attempt {attempt}/{self.MAX_RETRIES}. Retrying in {backoff}s...")
                        time.sleep(backoff)
                    else:
                        logger.error(f"Groq API Error ({err_type}) on attempt {attempt}: {err_str[:200]}")
                        if attempt < self.MAX_RETRIES:
                            time.sleep(1 * attempt)

        return None

    def analyze_single_article(self, article: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes a single news article as a professional financial analyst.
        Generates executive summary, why it matters, market impact by asset class,
        profile recommendations (Conservative/Moderate/Aggressive), risks, and extracted numbers.
        """
        payload = {
            "title": article.get("title", ""),
            "description": article.get("description") or article.get("summary", ""),
            "source": article.get("source", "Financial News"),
            "category": article.get("category", "General Finance"),
            "published_at": article.get("published_at", ""),
        }

        system_prompt = (
            "You are a Senior Financial Analyst at a premier financial institution. Analyze the provided news article.\n"
            "Rules:\n"
            "- Never invent facts or guarantee profits. Base every statement only on the provided article text.\n"
            "- Executive Summary must be concise (maximum 100 words) explaining what happened.\n"
            "- Explain 'Why This Matters' clearly.\n"
            "- For Investor Profiles (Conservative, Moderate, Aggressive), select recommendation strictly from ['Buy', 'Hold', 'Watch', 'Avoid'].\n"
            "- Use educational wording ('may be suitable', 'could be considered', 'worth monitoring').\n"
            "- For Market Impact, only include relevant categories from ['Stocks', 'Mutual Funds', 'Gold', 'Bonds', 'Interest Rates', 'Real Estate', 'Consumer Spending'].\n"
            "- For Key Numbers, extract any specific metrics, percentages, prices, or interest rates in the article as key-value objects. Return empty array if none exist.\n"
            "- Rate AI Confidence strictly as 'High', 'Medium', or 'Low' based on detail completeness.\n"
            "Return valid JSON strictly matching format:\n"
            "{\n"
            '  "sentiment": "Bullish | Bearish | Neutral",\n'
            '  "executive_summary": "...",\n'
            '  "why_this_matters": "...",\n'
            '  "market_impact": [\n'
            '    {"category": "Stocks", "impact": "Positive", "explanation": "..."}\n'
            "  ],\n"
            '  "investor_guidance": {\n'
            '    "conservative": {"recommendation": "Hold", "reason": "..."},\n'
            '    "moderate": {"recommendation": "Watch", "reason": "..."},\n'
            '    "aggressive": {"recommendation": "Buy", "reason": "..."}\n'
            "  },\n"
            '  "risks_to_monitor": ["...", "..."],\n'
            '  "key_numbers": [\n'
            '    {"metric": "Repo Rate", "value": "6.5%"}\n'
            "  ],\n"
            '  "ai_confidence": "High | Medium | Low"\n'
            "}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload, indent=2)},
        ]

        raw_response = self._call_groq_completion(messages, json_mode=True)
        if raw_response:
            try:
                parsed = json.loads(raw_response)
                sentiment = str(parsed.get("sentiment", "Neutral")).strip().title()
                if sentiment not in ["Bullish", "Bearish", "Neutral"]:
                    sentiment = "Neutral"

                confidence = str(parsed.get("ai_confidence", "Medium")).strip().title()
                if confidence not in ["High", "Medium", "Low"]:
                    confidence = "Medium"

                return {
                    "sentiment": sentiment,
                    "executive_summary": str(parsed.get("executive_summary", "")),
                    "why_this_matters": str(parsed.get("why_this_matters", "")),
                    "market_impact": list(parsed.get("market_impact", [])),
                    "investor_guidance": dict(parsed.get("investor_guidance", {})),
                    "risks_to_monitor": list(parsed.get("risks_to_monitor", [])),
                    "key_numbers": list(parsed.get("key_numbers", [])),
                    "ai_confidence": confidence,
                }
            except Exception as parse_err:
                logger.error(f"Failed to parse Groq single article insight JSON: {parse_err}")

        return self._generate_fallback_article_insight(payload)

    def explain_insurance_analysis(
        self,
        policy_dict: Dict[str, Any],
        analysis_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Sends structured JSON payload to Groq AI and receives structured JSON explanation."""
        payload = {
            "company": policy_dict.get("company") or policy_dict.get("provider", "Insurance Provider"),
            "policy_type": policy_dict.get("policy_type", "Health Insurance"),
            "plan_name": policy_dict.get("plan_name") or policy_dict.get("policy_name", "Policy Plan"),
            "coverage": float(policy_dict.get("coverage_amount", 0) or policy_dict.get("coverage", 0) or 0),
            "premium": float(policy_dict.get("premium_amount", 0) or policy_dict.get("premium", 0) or 0),
            "status": policy_dict.get("status", "Active"),
            "insurance_health_score": analysis_dict.get("insurance_health_score", 70),
            "coverage_gap": analysis_dict.get("coverage_gap_warnings", []),
            "missing_types": analysis_dict.get("missing_insurance_types", []),
        }

        system_prompt = (
            "You are an expert financial assistant. Explain the insurance analysis in simple English.\n"
            "Rules:\n"
            "- Never invent information.\n"
            "- Only use the supplied JSON.\n"
            "- Maximum 200 words.\n"
            "- Explain current coverage.\n"
            "- Explain strengths.\n"
            "- Explain risks.\n"
            "- Explain missing policies.\n"
            "- Suggest practical next steps.\n"
            "Return valid JSON strictly matching format:\n"
            '{\n  "summary": "",\n  "strengths": [],\n  "risks": [],\n  "recommendations": []\n}'
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload, indent=2)},
        ]

        raw_response = self._call_groq_completion(messages, json_mode=True)
        if raw_response:
            try:
                parsed = json.loads(raw_response)
                return {
                    "summary": str(parsed.get("summary", "")),
                    "strengths": list(parsed.get("strengths", [])),
                    "risks": list(parsed.get("risks", [])),
                    "recommendations": list(parsed.get("recommendations", [])),
                }
            except Exception as parse_err:
                logger.error(f"Failed to parse Groq response JSON: {parse_err}")

        return self._generate_fallback_explanation(payload)

    def generate_market_news_summary(
        self,
        articles: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generates an AI-powered Market News Summary acting as a financial analyst."""
        if not articles:
            return self._generate_fallback_news_summary()

        condensed_articles = []
        for a in articles[:15]:
            condensed_articles.append({
                "title": a.get("title", ""),
                "description": a.get("description") or a.get("summary", ""),
                "source": a.get("source", ""),
                "category": a.get("category", ""),
                "published_at": a.get("published_at", ""),
            })

        system_prompt = (
            "You are a Senior Financial Market Analyst. Synthesize the provided market news articles into a clear, actionable market summary.\n"
            "Instructions:\n"
            "- Identify overall market sentiment strictly as 'Bullish', 'Bearish', or 'Neutral'.\n"
            "- Highlight moving sectors, key macroeconomic/regulatory events (RBI/Fed, inflation, interest rates, earnings), and active companies.\n"
            "- Eliminate duplicates.\n"
            "- Do NOT hallucinate or invent facts outside the provided news items.\n"
            "- Maximum length around 250 words total.\n"
            "Return valid JSON strictly matching format:\n"
            '{\n'
            '  "market_sentiment": "Bullish | Bearish | Neutral",\n'
            '  "summary": "...",\n'
            '  "key_points": ["...", "...", "..."],\n'
            '  "opportunities": ["...", "..."],\n'
            '  "risks": ["...", "..."],\n'
            '  "recommended_actions": ["...", "...", "..."]\n'
            '}'
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(condensed_articles, indent=2)},
        ]

        raw_response = self._call_groq_completion(messages, json_mode=True)
        if raw_response:
            try:
                parsed = json.loads(raw_response)
                sentiment = str(parsed.get("market_sentiment", "Neutral")).strip().title()
                if sentiment not in ["Bullish", "Bearish", "Neutral"]:
                    sentiment = "Neutral"

                return {
                    "market_sentiment": sentiment,
                    "summary": str(parsed.get("summary", "Market news summary generated.")),
                    "key_points": list(parsed.get("key_points", [])),
                    "opportunities": list(parsed.get("opportunities", [])),
                    "risks": list(parsed.get("risks", [])),
                    "recommended_actions": list(parsed.get("recommended_actions", [])),
                }
            except Exception as parse_err:
                logger.error(f"Failed to parse Groq market news summary JSON: {parse_err}")

        return self._generate_fallback_news_summary()

    def generate_financial_advice(
        self,
        user_profile: Dict[str, Any],
        financial_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI financial insights advice based on user profile and financial summary metrics."""
        system_prompt = (
            "You are a personal financial advisor AI. Analyze the user's financial profile and return structured advice.\n"
            "Return valid JSON strictly matching format:\n"
            '{\n  "title": "",\n  "insight": "",\n  "actionable_tips": [],\n  "score_assessment": ""\n}'
        )

        payload = {
            "profile": user_profile,
            "financial_summary": financial_summary
        }

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload, indent=2)},
        ]

        raw_response = self._call_groq_completion(messages, json_mode=True)
        if raw_response:
            try:
                parsed = json.loads(raw_response)
                return {
                    "title": str(parsed.get("title", "Financial Optimization Recommendation")),
                    "insight": str(parsed.get("insight", "")),
                    "actionable_tips": list(parsed.get("actionable_tips", [])),
                    "score_assessment": str(parsed.get("score_assessment", "")),
                }
            except Exception as parse_err:
                logger.error(f"Failed to parse Groq advice JSON: {parse_err}")

        return {
            "title": "Financial Health Assessment",
            "insight": f"Your current net worth is ₹{financial_summary.get('net_worth', 0):,.0f} with a savings rate of {financial_summary.get('savings_rate', 0)}%.",
            "actionable_tips": [
                "Maintain an emergency fund covering at least 6 months of expenses.",
                "Allocate surplus monthly cashflow toward high-priority financial goals."
            ],
            "score_assessment": f"Health Score: {financial_summary.get('financial_health_score', 70)}/100"
        }

    def _generate_fallback_explanation(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        company = payload.get("company", "Insurance Provider")
        ptype = payload.get("policy_type", "Insurance Policy")
        cov = payload.get("coverage", 0)
        score = payload.get("insurance_health_score", 70)
        missing = payload.get("missing_types", [])

        summary = (
            f"Your {company} {ptype} provides ₹{cov:,.0f} coverage. "
            f"Your Insurance Health Score is {score}/100 based on portfolio coverage and affordability."
        )

        strengths = [
            f"Active {ptype} coverage with sum insured of ₹{cov:,.0f}.",
            f"Policy issued by {company} with recorded claim contacts."
        ]

        risks = []
        if missing:
            risks.append(f"Missing coverage in: {', '.join(missing)}.")
        if cov < 500000 and "Health" in ptype:
            risks.append("Health coverage is below the recommended minimum of ₹5 Lakhs.")

        recommendations = [
            "Review your policy terms annually prior to renewal date.",
        ]
        if "Term Life Insurance" in missing:
            recommendations.append("Consider adding a Term Life policy equal to 10x your annual income.")
        if "Health Insurance" in missing:
            recommendations.append("Secure a dedicated family floater health policy with at least ₹5 Lakhs sum insured.")

        return {
            "summary": summary,
            "strengths": strengths,
            "risks": risks,
            "recommendations": recommendations,
        }

    def _generate_fallback_news_summary(self) -> Dict[str, Any]:
        return {
            "market_sentiment": "Neutral",
            "summary": "Financial markets continue to monitor macroeconomic indicators, monetary policy signals, and corporate earnings. Key indices maintain active trading volumes.",
            "key_points": [
                "Nifty 50 and Sensex benchmarks show steady participation across key sectors.",
                "RBI interest rate outlook remains a focal point for fixed income and banking equities.",
                "Institutional capital flows demonstrate steady interest in large-cap growth stocks."
            ],
            "opportunities": [
                "Consider dollar-cost averaging into diversified index funds during market dips.",
                "Monitor high-yield liquid instruments for temporary cash reserves."
            ],
            "risks": [
                "Short-term market volatility surrounding upcoming inflation and interest rate data.",
                "Global macroeconomic shifts impacting commodity and energy prices."
            ],
            "recommended_actions": [
                "Maintain a disciplined asset allocation aligned with your long-term risk tolerance.",
                "Rebalance portfolio periodically to cap sector concentration risks."
            ]
        }

    def _generate_fallback_article_insight(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        title = payload.get("title", "Market Update")
        cat = payload.get("category", "General Finance")

        return {
            "sentiment": "Neutral",
            "executive_summary": f"This report covers recent developments regarding {title}. The policy and economic data signal ongoing structural developments across {cat}.",
            "why_this_matters": "Market participants should monitor key interest rates, liquidity measures, and sector valuations for portfolio adjustments.",
            "market_impact": [
                {
                    "category": "Stocks",
                    "impact": "Neutral",
                    "explanation": "Equity valuations reflect short-term market adjustments to recent news events."
                },
                {
                    "category": "Mutual Funds",
                    "impact": "Neutral",
                    "explanation": "Systematic investment plans (SIPs) remain suitable for long-term wealth accumulation."
                }
            ],
            "investor_guidance": {
                "conservative": {
                    "recommendation": "Hold",
                    "reason": "Maintaining existing capital allocation in low-risk instruments remains prudent while monitoring developments."
                },
                "moderate": {
                    "recommendation": "Watch",
                    "reason": "Observing market sentiment before altering asset weights may provide better clarity."
                },
                "aggressive": {
                    "recommendation": "Hold",
                    "reason": "Maintaining core equity exposure while evaluating potential dip-buying opportunities is suitable."
                }
            },
            "risks_to_monitor": [
                "Potential macroeconomic volatility driven by interest rate decisions.",
                "Short-term price fluctuations in sector-specific benchmarks.",
                "Shifts in global commodity indices impacting domestic inflation."
            ],
            "key_numbers": [],
            "ai_confidence": "High"
        }


groq_service = GroqService()
