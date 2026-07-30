"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MarketNewsCard } from "@/components/cards/MarketNewsCard";
import { useMarketNews } from "@/hooks/useNews";
import {
  Search,
  RotateCw,
  Filter,
  Calendar,
  ArrowUpDown,
  Newspaper,
  AlertTriangle,
  XCircle,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Repo Rate",
  "Inflation",
  "Tax",
  "Insurance",
  "Gold",
  "Mutual Funds",
  "Stocks",
  "General Finance",
];

const TIME_FILTERS = ["All Time", "Today", "This Week", "This Month"];

const SORT_OPTIONS = [
  { label: "Latest First", value: "latest" },
  { label: "Oldest First", value: "oldest" },
];

export default function FinancialIntelligencePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [sort, setSort] = useState("latest");

  // React Query hook for market news feed
  const { articles, isLoading, isFetching, isError, refetch } = useMarketNews({
    search,
    category,
    time_filter: timeFilter,
    sort,
  });

  const handleClearFilters = () => {
    setSearch("");
    setCategory("All");
    setTimeFilter("All Time");
    setSort("latest");
  };

  const highImpactCount = articles.filter((a) => {
    const c = (a.category || "").toLowerCase();
    return c.includes("repo") || c.includes("inflation") || c.includes("tax");
  }).length;

  return (
    <DashboardShell>
      <div className="min-h-screen rounded-2xl bg-slate-950 p-4 md:p-8 text-slate-100 font-sans shadow-2xl border border-slate-900">
        {/* HEADER SECTION */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-400 mb-2">
                <Newspaper size={14} />
                Financial Intelligence
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Financial Intelligence & Market News
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-400">
                Live market news feed with interactive Groq AI article insights.
              </p>
            </div>

            {/* Refresh News Feed Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-95 disabled:opacity-50"
                title="Refresh news feed"
              >
                <RotateCw size={15} className={isFetching ? "animate-spin text-cyan-400" : ""} />
                <span>{isFetching ? "Updating..." : "Refresh Feed"}</span>
              </button>
            </div>
          </div>

          {/* QUICK STATS TICKER BAR */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Live Coverage</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{articles.length}</span>
                <span className="text-xs text-slate-400">Articles</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">High Impact News</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-400">{highImpactCount}</span>
                <span className="text-xs text-rose-500 font-semibold">🔴 High Alert</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Category</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-bold text-cyan-300 truncate">{category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS TOOLBAR */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search headlines, tickers (e.g. RBI, Inflation, Stocks)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <XCircle size={16} />
                </button>
              )}
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {TIME_FILTERS.map((tf) => (
                  <option key={tf} value={tf} className="bg-slate-900 text-slate-200">
                    {tf}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={16} className="text-slate-400 shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
            <span className="text-xs font-semibold text-slate-400 shrink-0">Category:</span>
            <div className="flex items-center gap-2 shrink-0">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                        : "border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        {isLoading ? (
          /* SKELETON LOADING GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-850 bg-slate-900/60 p-5 shadow-lg animate-pulse"
              >
                <div>
                  <div className="h-48 w-full rounded-xl bg-slate-800/60 mb-4" />
                  <div className="h-4 w-1/3 rounded bg-slate-800/60 mb-3" />
                  <div className="h-6 w-5/6 rounded bg-slate-800/60 mb-2" />
                  <div className="h-6 w-4/6 rounded bg-slate-800/60 mb-4" />
                  <div className="h-16 w-full rounded-xl bg-slate-850/60 mb-4" />
                  <div className="h-24 w-full rounded-xl bg-slate-850/60" />
                </div>
                <div className="mt-4 h-10 w-full rounded-xl bg-slate-800/60" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* ERROR STATE */
          <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-rose-900/40 bg-rose-950/20 p-12 text-center shadow-2xl backdrop-blur-md">
            <div className="mb-4 rounded-full bg-rose-900/30 p-4 text-rose-400 border border-rose-800/50">
              <AlertTriangle size={36} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Unable to fetch news.</h3>
            <p className="text-sm text-slate-300 mb-6 max-w-md">
              Please try again later. We couldn&apos;t connect to the financial market data provider.
            </p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-rose-500 active:scale-95"
            >
              <RotateCw size={14} />
              <span>Retry Request</span>
            </button>
          </div>
        ) : articles.length === 0 ? (
          /* EMPTY STATE */
          <div className="my-12 flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center shadow-xl">
            <div className="mb-4 rounded-full bg-slate-800 p-4 text-slate-400 border border-slate-700">
              <Newspaper size={36} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No news available.</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              No financial articles matched your search query or active filter parameters.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
            >
              <span>Clear Filters</span>
            </button>
          </div>
        ) : (
          /* NEWS CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((article) => (
              <MarketNewsCard key={article.uuid || article.title} article={article} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
