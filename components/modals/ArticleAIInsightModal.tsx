"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MarketNewsArticle, ArticleAIInsight, getArticleAIInsight } from "@/lib/api/news";
import {
  X,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Building2,
  Clock,
  ExternalLink,
  ShieldCheck,
  TriangleAlert,
  Lightbulb,
  Target,
  RotateCw,
  BarChart3,
  Layers,
  HelpCircle,
} from "lucide-react";
import { formatRelativeTime } from "@/components/cards/MarketNewsCard";

interface ArticleAIInsightModalProps {
  article: MarketNewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleAIInsightModal({ article, isOpen, onClose }: ArticleAIInsightModalProps) {
  const [insight, setInsight] = useState<ArticleAIInsight | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchInsightData = useCallback(async (force: boolean = false) => {
    if (!article) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await getArticleAIInsight(article, force);
      setInsight(data);
    } catch (err) {
      console.error("Failed to load article AI insight:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [article]);

  useEffect(() => {
    if (isOpen && article) {
      fetchInsightData(false);
    } else {
      setInsight(null);
    }
  }, [isOpen, article, fetchInsightData]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  const getRecommendationBadgeClass = (rec: string = "Hold") => {
    const r = rec.trim().toLowerCase();
    if (r === "buy") return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (r === "avoid") return "bg-rose-100 text-rose-800 border-rose-300";
    if (r === "watch") return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-slate-100 text-slate-800 border-slate-300";
  };

  const getConfidenceBadgeClass = (conf: string = "Medium") => {
    const c = conf.trim().toLowerCase();
    if (c === "high") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (c === "low") return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative flex flex-col max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="space-y-2 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                <BrainCircuit size={14} className="text-teal-600" />
                FinancialOS AI Analysis
              </span>

              {article.category && (
                <span className="rounded-md bg-slate-200/70 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {article.category}
                </span>
              )}

              {insight?.sentiment && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold border ${
                    insight.sentiment === "Bullish"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : insight.sentiment === "Bearish"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {insight.sentiment === "Bullish" ? (
                    <TrendingUp size={12} />
                  ) : insight.sentiment === "Bearish" ? (
                    <TrendingDown size={12} />
                  ) : (
                    <Layers size={12} />
                  )}
                  {insight.sentiment} Sentiment
                </span>
              )}
            </div>

            <h2 id="modal-title" className="text-lg font-bold text-slate-900 leading-snug">
              {article.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Building2 size={13} className="text-teal-600" />
                {article.source}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock size={13} />
                {formatRelativeTime(article.published_at || "")}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {isLoading ? (
            /* SKELETON LOADER */
            <div className="space-y-6 animate-pulse">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                <div className="h-4 w-1/4 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-5/6 bg-slate-200 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-28 bg-slate-100 rounded-xl" />
                <div className="h-28 bg-slate-100 rounded-xl" />
                <div className="h-28 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ) : isError ? (
            /* ERROR STATE */
            <div className="my-8 flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/60 p-8 text-center">
              <div className="mb-3 rounded-full bg-rose-100 p-3 text-rose-600">
                <TriangleAlert size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">AI analysis is temporarily unavailable.</h3>
              <p className="text-xs text-slate-600 mb-5 max-w-sm">
                We encountered an issue connecting to the AI analysis engine. Please try again.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchInsightData(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
                >
                  <RotateCw size={14} />
                  <span>Retry Analysis</span>
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : insight ? (
            <>
              {/* SECTION 1: EXECUTIVE SUMMARY */}
              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4.5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-teal-700" />
                  <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">Executive Summary</h3>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  {insight.executive_summary || "Article analysis summary generated."}
                </p>
              </div>

              {/* SECTION 2: WHY THIS MATTERS */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Why This Matters</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {insight.why_this_matters}
                </p>
              </div>

              {/* SECTION 3: POTENTIAL MARKET IMPACT */}
              {insight.market_impact && insight.market_impact.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-slate-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Potential Market Impact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insight.market_impact.map((imp, idx) => (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{imp.category}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            imp.impact?.toLowerCase() === "positive"
                              ? "bg-emerald-100 text-emerald-800"
                              : imp.impact?.toLowerCase() === "negative"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-200 text-slate-700"
                          }`}>
                            {imp.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal">{imp.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: WHAT SHOULD AN INVESTOR DO? */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-teal-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">What Should an Investor Do?</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Conservative */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Conservative Profile</span>
                      <div className="mb-2">
                        <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${getRecommendationBadgeClass(insight.investor_guidance?.conservative?.recommendation)}`}>
                          {insight.investor_guidance?.conservative?.recommendation || "Hold"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {insight.investor_guidance?.conservative?.reason || "Maintaining existing allocations in secure instruments is recommended."}
                      </p>
                    </div>
                  </div>

                  {/* Moderate */}
                  <div className="flex flex-col justify-between rounded-xl border border-teal-200 bg-teal-50/30 p-4 shadow-sm">
                    <div>
                      <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block mb-1">Moderate Profile</span>
                      <div className="mb-2">
                        <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${getRecommendationBadgeClass(insight.investor_guidance?.moderate?.recommendation)}`}>
                          {insight.investor_guidance?.moderate?.recommendation || "Watch"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {insight.investor_guidance?.moderate?.reason || "Monitoring developments before rebalancing asset weights is recommended."}
                      </p>
                    </div>
                  </div>

                  {/* Aggressive */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Aggressive Profile</span>
                      <div className="mb-2">
                        <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${getRecommendationBadgeClass(insight.investor_guidance?.aggressive?.recommendation)}`}>
                          {insight.investor_guidance?.aggressive?.recommendation || "Hold"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {insight.investor_guidance?.aggressive?.reason || "Evaluating sector opportunities while maintaining strategic exposure is suitable."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: RISKS TO MONITOR */}
              {insight.risks_to_monitor && insight.risks_to_monitor.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <TriangleAlert size={16} className="text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Risks to Monitor</h3>
                  </div>
                  <ul className="space-y-1.5 rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 text-xs text-slate-700 font-medium">
                    {insight.risks_to_monitor.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold shrink-0">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SECTION 6: KEY NUMBERS (Extract if present, hide if empty) */}
              {insight.key_numbers && insight.key_numbers.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-teal-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Financial Metrics</h3>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2.5">Metric / Data Point</th>
                          <th className="px-4 py-2.5 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {insight.key_numbers.map((kn, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2 font-medium">{kn.metric}</td>
                            <td className="px-4 py-2 text-right font-bold text-slate-900">{kn.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 7: AI CONFIDENCE & SECTION 8: DISCLAIMER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">AI Confidence Rating:</span>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold ${getConfidenceBadgeClass(insight.ai_confidence)}`}>
                    <ShieldCheck size={13} />
                    {insight.ai_confidence || "Medium"} Confidence
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 italic max-w-md">
                  This AI-generated analysis is for educational purposes only and should not be considered financial advice.
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm"
          >
            Close
          </button>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-teal-700 active:scale-95 transition-all"
          >
            <span>Read Original Article</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
