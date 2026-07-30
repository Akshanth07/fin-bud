"use client";

import React, { useState } from "react";
import { MarketNewsArticle } from "@/lib/api/news";
import { ArticleAIInsightModal } from "@/components/modals/ArticleAIInsightModal";
import { ExternalLink, BrainCircuit, Clock, Building2, TrendingUp } from "lucide-react";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80",
];

export function getImpactBadge(category: string) {
  const cat = (category || "").trim().toLowerCase();

  if (cat.includes("repo") || cat.includes("inflation") || cat.includes("tax")) {
    return {
      level: "High",
      label: "🔴 High",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    };
  }
  if (
    cat.includes("insurance") ||
    cat.includes("gold") ||
    cat.includes("mutual") ||
    cat.includes("stock")
  ) {
    return {
      level: "Medium",
      label: "🟠 Medium",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    };
  }

  return {
    level: "Low",
    label: "🟢 Low",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1d ago";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

interface MarketNewsCardProps {
  article: MarketNewsArticle;
}

export function MarketNewsCard({ article }: MarketNewsCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const impact = getImpactBadge(article.category || "");
  const fallbackIndex = Math.abs((article.uuid || article.title || "article").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % FALLBACK_IMAGES.length;
  const fallbackUrl = FALLBACK_IMAGES[fallbackIndex];
  
  const [imgSrc, setImgSrc] = useState<string>(article.image_url || fallbackUrl);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl hover:shadow-cyan-900/10">
        <div>
          {/* Large Thumbnail Header */}
          <div className="relative h-48 w-full overflow-hidden bg-slate-950">
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-slate-850" />
            )}
            <img
              src={imgSrc}
              alt={article.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgSrc(fallbackUrl)}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-md">
                {article.category}
              </span>

              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold backdrop-blur-md ${impact.badgeClass}`}>
                {impact.label}
              </span>
            </div>

            {/* Sentiment Pill (if present) */}
            {article.sentiment && (
              <div className="absolute bottom-2 left-3">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                  article.sentiment.toLowerCase() === "bullish"
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
                    : article.sentiment.toLowerCase() === "bearish"
                    ? "bg-rose-950/80 text-rose-300 border-rose-800/50"
                    : "bg-slate-800/80 text-slate-300 border-slate-700/50"
                }`}>
                  <TrendingUp size={12} />
                  {article.sentiment}
                </span>
              </div>
            )}
          </div>

          {/* Content Body */}
          <div className="p-5">
            {/* Source & Published Time */}
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-slate-300 font-semibold">
                <Building2 size={13} className="text-cyan-400" />
                {article.source}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock size={13} />
                {formatRelativeTime(article.published_at || "")}
              </span>
            </div>

            {/* Headline */}
            <h3 className="mb-2 text-base font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
              {article.title}
            </h3>

            {/* Short Description */}
            <p className="mb-4 text-xs leading-relaxed text-slate-400 line-clamp-3 font-normal">
              {article.description}
            </p>

            {/* Stock Symbols Tag (if present) */}
            {article.symbols && article.symbols.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {article.symbols.map((sym) => (
                  <span
                    key={sym}
                    className="rounded border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-[10px] font-bold text-slate-400 tracking-wide"
                  >
                    ${sym}
                  </span>
                ))}
              </div>
            )}

            {/* AI INSIGHTS BUTTON (Replaces Coming Soon Placeholder) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="mb-4 flex w-full items-center justify-between rounded-xl border border-teal-500/30 bg-teal-950/40 p-3 transition-all duration-200 hover:border-teal-400 hover:bg-teal-900/60 group/btn shadow-sm"
              title="Click to view AI Financial Analyst Insights"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <BrainCircuit size={18} />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-teal-300">AI Insights</span>
                  <span className="block text-[10px] text-slate-400">Financial Analyst Breakdown</span>
                </div>
              </div>
              <span className="rounded-lg bg-teal-500/20 px-2.5 py-1 text-[10px] font-bold text-teal-300 border border-teal-500/30 group-hover/btn:bg-teal-500 group-hover/btn:text-slate-950 transition-colors">
                Analyze Article →
              </span>
            </button>
          </div>
        </div>

        {/* Footer / Read Full Article Button */}
        <div className="px-5 pb-5 pt-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]"
          >
            <span>Read Full Article</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* ARTICLE AI INSIGHT MODAL */}
      <ArticleAIInsightModal
        article={article}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
