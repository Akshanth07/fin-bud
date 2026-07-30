"use client";

import React, { useState, useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Activity, Zap, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useInvestments } from "@/hooks/useInvestments";
import { getLiveMarketTickers, LiveTickerData } from "@/lib/api/news";

const INITIAL_TICKERS: LiveTickerData[] = [
  { symbol: "NIFTY 50", name: "NSE Nifty 50 Index", price: 24850.40, change: 160.25, changePercent: 0.65, source: "Market Feed" },
  { symbol: "SENSEX", name: "BSE Sensex Index", price: 81420.15, change: 472.10, changePercent: 0.58, source: "Market Feed" },
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2980.50, change: 35.40, changePercent: 1.20, source: "Market Feed" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 4210.00, change: -14.80, changePercent: -0.35, source: "Market Feed" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1645.75, change: 13.90, changePercent: 0.85, source: "Market Feed" },
  { symbol: "INFY", name: "Infosys Limited", price: 1820.30, change: 26.10, changePercent: 1.45, source: "Market Feed" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 1215.60, change: 8.40, changePercent: 0.70, source: "Market Feed" },
  { symbol: "GOLD", name: "Gold 24k (10g)", price: 74200.00, change: 295.00, changePercent: 0.40, source: "Market Feed" },
];

export function StockTickerBar() {
  const [tickers, setTickers] = useState<LiveTickerData[]>(INITIAL_TICKERS);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const { investments } = useInvestments();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Fetch real live quotes from free Yahoo Finance API backend route
  const fetchRealTickers = async () => {
    setIsFetchingLive(true);
    try {
      const realData = await getLiveMarketTickers();
      if (realData && realData.length > 0) {
        setTickers(realData);
      }
    } catch (err) {
      console.warn("Using fallback stock ticker data:", err);
    } finally {
      setIsFetchingLive(false);
      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
  };

  useEffect(() => {
    fetchRealTickers();
    // Poll real market data every 15 seconds
    const liveInterval = setInterval(fetchRealTickers, 15000);
    return () => clearInterval(liveInterval);
  }, []);

  // Merge user holdings into ticker if applicable
  const userStockTickers = (investments || [])
    .filter((inv) => inv.asset_type === "Stocks" || inv.asset_type === "Mutual Funds" || inv.asset_type === "ETFs")
    .map((inv) => ({
      symbol: inv.asset_name.split(" ")[0].toUpperCase(),
      name: inv.asset_name,
      price: Number(inv.current_price) || 500,
      change: Number(inv.current_price) * 0.008,
      changePercent: 0.8,
      source: "User Portfolio Holding",
    }));

  const combinedTickers = [...userStockTickers, ...tickers].filter(
    (item, index, self) => index === self.findIndex((t) => t.symbol === item.symbol)
  );

  return (
    <div className="w-full max-w-full min-w-0 mb-6 rounded-card border border-border bg-white shadow-card overflow-hidden">
      {/* HEADER STRIP */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface/60 border-b border-border/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-[#14181C] tracking-wide flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" /> LIVE MARKET TICKER
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
          {/* Scroll Navigation Controls */}
          <div className="flex items-center gap-1 border-r border-border/60 pr-2">
            <button
              onClick={() => handleScroll("left")}
              className="p-1 rounded hover:bg-gray-200/70 text-gray-600 transition-colors"
              title="Scroll Left"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="p-1 rounded hover:bg-gray-200/70 text-gray-600 transition-colors"
              title="Scroll Right"
              aria-label="Scroll Right"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={fetchRealTickers}
            disabled={isFetchingLive}
            className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isFetchingLive ? "animate-spin text-primary" : ""} />
            <span>{isFetchingLive ? "Updating..." : "Refresh Feed"}</span>
          </button>
          <span>Last Updated: <strong className="text-gray-800">{lastUpdated}</strong></span>
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE TICKER STRIP */}
      <div className="relative group min-w-0 w-full">
        {/* Overlay Scroll Hint Buttons on Hover */}
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 shadow-md border border-border text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Scroll Left"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 shadow-md border border-border text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Scroll Right"
        >
          <ChevronRight size={16} />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-3 p-3 overflow-x-auto whitespace-nowrap min-w-0 w-full custom-horizontal-scrollbar scroll-smooth"
        >
          {combinedTickers.map((t) => {
            const isPositive = t.change >= 0;
            return (
              <div
                key={t.symbol}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface/50 border border-border/80 hover:bg-white hover:border-primary/30 transition-all shrink-0 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-[#14181C]">{t.symbol}</span>
                    {isPositive ? (
                      <TrendingUp size={13} className="text-emerald-600" />
                    ) : (
                      <TrendingDown size={13} className="text-rose-600" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 truncate max-w-[110px] block">
                    {t.name}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#14181C] block">
                    ₹{t.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isPositive ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}{t.change.toFixed(2)} ({isPositive ? "+" : ""}{t.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

