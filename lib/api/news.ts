import { apiClient } from "./client";

export interface LiveTickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  source: string;
}

export interface MarketNewsArticle {
  uuid?: string;
  id?: string;
  title: string;
  description?: string;
  summary?: string;
  image_url?: string;
  source?: string;
  published_at?: string;
  category?: string;
  url?: string;
  sentiment?: string;
  symbols?: string[];
  industries?: string[];
}

export interface FetchMarketNewsParams {
  search?: string;
  category?: string;
  time_filter?: string;
  sort?: string;
  limit?: number;
}

export interface MarketNewsAISummary {
  market_sentiment: "Bullish" | "Bearish" | "Neutral" | "Unknown";
  summary: string;
  key_points: string[];
  opportunities: string[];
  risks: string[];
  recommended_actions: string[];
  last_updated?: string;
}

export interface MarketImpactItem {
  category: string;
  impact: string;
  explanation: string;
}

export interface InvestorProfileGuidance {
  recommendation: "Buy" | "Hold" | "Watch" | "Avoid";
  reason: string;
}

export interface InvestorGuidanceMap {
  conservative?: InvestorProfileGuidance;
  moderate?: InvestorProfileGuidance;
  aggressive?: InvestorProfileGuidance;
}

export interface KeyNumberItem {
  metric: string;
  value: string;
}

export interface ArticleAIInsight {
  sentiment: "Bullish" | "Bearish" | "Neutral";
  executive_summary: string;
  why_this_matters: string;
  market_impact: MarketImpactItem[];
  investor_guidance: InvestorGuidanceMap;
  risks_to_monitor: string[];
  key_numbers: KeyNumberItem[];
  ai_confidence: "High" | "Medium" | "Low";
}

export const INITIAL_TICKERS: LiveTickerData[] = [
  { symbol: "NIFTY 50", name: "NSE Nifty 50 Index", price: 24850.40, change: 160.25, changePercent: 0.65, source: "Market Feed" },
  { symbol: "SENSEX", name: "BSE Sensex Index", price: 81420.15, change: 472.10, changePercent: 0.58, source: "Market Feed" },
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2980.50, change: 35.40, changePercent: 1.20, source: "Market Feed" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 4210.00, change: -14.80, changePercent: -0.35, source: "Market Feed" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1645.75, change: 13.90, changePercent: 0.85, source: "Market Feed" },
  { symbol: "INFY", name: "Infosys Limited", price: 1820.30, change: 26.10, changePercent: 1.45, source: "Market Feed" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 1215.60, change: 8.40, changePercent: 0.70, source: "Market Feed" },
  { symbol: "GOLD", name: "Gold 24k (10g)", price: 74200.00, change: 295.00, changePercent: 0.40, source: "Market Feed" },
];

export async function getLiveMarketTickers(): Promise<LiveTickerData[]> {
  try {
    const response = await apiClient.get("/market-tickers");
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return INITIAL_TICKERS;
  } catch (error) {
    console.warn("Failed to fetch live market tickers, using fallback data:", error);
    return INITIAL_TICKERS;
  }
}

export async function getMarketNews(params?: FetchMarketNewsParams): Promise<MarketNewsArticle[]> {
  try {
    const response = await apiClient.get("/market-news", { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.warn("Failed to fetch market news from API:", error);
    return [];
  }
}

export async function getMarketNewsAISummary(forceRefresh: boolean = false): Promise<MarketNewsAISummary> {
  try {
    const response = await apiClient.get("/market-news/ai-summary", {
      params: { force_refresh: forceRefresh },
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.warn("Failed to fetch AI market news summary:", error);
    return {
      market_sentiment: "Neutral",
      summary: "AI market summary is temporarily unavailable.",
      key_points: [],
      opportunities: [],
      risks: [],
      recommended_actions: [],
    };
  }
}

export async function getArticleAIInsight(article: MarketNewsArticle, forceRefresh: boolean = false): Promise<ArticleAIInsight> {
  const response = await apiClient.post("/market-news/article-insight", article, {
    params: { force_refresh: forceRefresh }
  });
  return response.data?.data || response.data;
}
