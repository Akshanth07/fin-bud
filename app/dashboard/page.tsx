"use client";

import React from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { GaugeArc } from "@/components/charts/GaugeArc";
import { useDashboard, useDashboardChart } from "@/hooks/useDashboard";
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Receipt,
  PiggyBank,
  Shield,
  Activity,
  Landmark,
  ArrowUpRight,
  Sparkles,
  PieChart as PieChartIcon,
} from "lucide-react";

import { StockTickerBar } from "@/components/dashboard/StockTickerBar";

export default function DashboardPage() {
  const { summary, isLoading } = useDashboard();
  const { data: assetAllocationChart } = useDashboardChart("asset-allocation");

  if (isLoading) {
    return (
      <DashboardShell>
        <PageHeader title="Overview" breadcrumb={[{ label: "Dashboard" }]} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-border rounded-card animate-pulse p-4 shadow-card">
              <div className="h-4 w-24 bg-surface rounded mb-3"></div>
              <div className="h-8 w-32 bg-surface rounded"></div>
            </div>
          ))}
        </div>
      </DashboardShell>
    );
  }

  const s = summary || {
    financial_health_score: 0,
    net_worth: 0,
    monthly_income: 0,
    monthly_expenses: 0,
    monthly_savings: 0,
    savings_rate: 0,
    debt_to_income_ratio: 0,
    emergency_fund_coverage: 0,
    total_assets: 0,
    total_investments: 0,
    total_liabilities: 0,
    summaries: {
      assets_count: 0,
      assets_total_valuation: 0,
      investments_count: 0,
      investments_total_value: 0,
      loans_count: 0,
      loans_total_outstanding: 0,
      insurance_count: 0,
      insurance_total_coverage: 0,
      goals_count: 0,
      income_sources_count: 0,
      expenses_count: 0,
    },
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Overview"
        subtitle="Real-time calculated wealth metrics, financial health score, assets, investments, and liabilities."
        breadcrumb={[{ label: "Dashboard" }]}
      />

      {/* LIVE MARKET STOCK TICKER BAR */}
      <StockTickerBar />

      {/* TOP SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Financial Health Score Gauge */}
        <div className="bg-white border border-border rounded-card p-5 shadow-card flex flex-col items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-gray-800">Health Score</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark border border-primary/20">
              {s.financial_health_score >= 75 ? "Excellent" : s.financial_health_score >= 50 ? "Moderate" : "Action Needed"}
            </span>
          </div>
          <div className="my-1">
            <GaugeArc
              percent={s.financial_health_score}
              centerLabel={`${s.financial_health_score}`}
              minLabel="0"
              maxLabel="100"
            />
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-white border border-border rounded-card p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-800">Net Worth</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-[#14181C] mt-2">
              ₹{s.net_worth.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2 space-y-1 border-t border-border/60 pt-2 font-medium">
            <div className="flex justify-between">
              <span>Tangible Assets:</span>
              <strong className="text-gray-900">₹{s.total_assets.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Investments:</span>
              <strong className="text-gray-900">₹{s.total_investments.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>Liabilities:</span>
              <strong className="text-rose-600">-₹{s.total_liabilities.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Monthly Income & Expenses */}
        <div className="bg-white border border-border rounded-card p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-800">Monthly Cash Flow</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">Income</p>
                <p className="text-lg font-bold text-emerald-700">+₹{s.monthly_income.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-500">Expenses</p>
                <p className="text-lg font-bold text-rose-600">-₹{s.monthly_expenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-700 flex items-center justify-between border-t border-border/60 pt-2 font-medium">
            <span>Net Monthly Savings</span>
            <strong className="font-bold text-[#14181C] text-sm">₹{s.monthly_savings.toLocaleString()}</strong>
          </div>
        </div>

        {/* Savings Rate & Debt Ratio */}
        <div className="bg-white border border-border rounded-card p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-800">Savings & Debt Ratios</span>
              <PiggyBank className="w-4 h-4 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">Savings Rate</p>
                <p className="text-xl font-bold text-emerald-700">{s.savings_rate}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">Debt Ratio</p>
                <p className="text-xl font-bold text-amber-700">{s.debt_to_income_ratio}%</p>
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-700 border-t border-border/60 pt-2 font-medium flex justify-between">
            <span>Emergency Coverage:</span>
            <strong className="text-[#14181C]">{s.emergency_fund_coverage} Months</strong>
          </div>
        </div>
      </div>

      {/* PORTFOLIO BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-border rounded-card p-4 shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary-dark rounded-xl">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Tangible Assets</p>
            <p className="text-lg font-bold text-[#14181C]">₹{s.total_assets.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-gray-500">{s.summaries.assets_count} Property & Cash Records</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-card p-4 shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Financial Investments</p>
            <p className="text-lg font-bold text-[#14181C]">₹{s.total_investments.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-gray-500">{s.summaries.investments_count} Stocks & Mutual Funds</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-card p-4 shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Total Liabilities</p>
            <p className="text-lg font-bold text-rose-600">₹{s.total_liabilities.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-gray-500">{s.summaries.loans_count} Active Loans</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-card p-4 shadow-card flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Insurance Protection</p>
            <p className="text-lg font-bold text-[#14181C]">₹{s.summaries.insurance_total_coverage.toLocaleString()}</p>
            <p className="text-[11px] font-medium text-gray-500">{s.summaries.insurance_count} Active Policies</p>
          </div>
        </div>
      </div>

      {/* CHARTS & VISUALIZATIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Income vs Expenses Visualizer */}
        <div className="xl:col-span-2 bg-white border border-border rounded-card p-6 shadow-card">
          <h3 className="text-base font-bold text-[#14181C] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Income vs Expenses Visualizer
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1.5">
                <span>Monthly Income (₹{s.monthly_income.toLocaleString()})</span>
                <span>100%</span>
              </div>
              <div className="h-4 bg-surface border border-border/60 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1.5">
                <span>Monthly Expenses (₹{s.monthly_expenses.toLocaleString()})</span>
                <span>{s.monthly_income > 0 ? Math.round((s.monthly_expenses / s.monthly_income) * 100) : 0}%</span>
              </div>
              <div className="h-4 bg-surface border border-border/60 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${s.monthly_income > 0 ? Math.min((s.monthly_expenses / s.monthly_income) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-800 mb-1.5">
                <span>Net Savings (₹{s.monthly_savings.toLocaleString()})</span>
                <span>{s.savings_rate}%</span>
              </div>
              <div className="h-4 bg-surface border border-border/60 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(s.savings_rate, 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Asset & Investment Distribution */}
        <div className="bg-white border border-border rounded-card p-6 shadow-card">
          <h3 className="text-base font-bold text-[#14181C] mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Asset & Portfolio Allocation
          </h3>
          {assetAllocationChart?.labels?.length > 0 ? (
            <div className="space-y-3">
              {assetAllocationChart.labels.map((label: string, idx: number) => {
                const val = assetAllocationChart.values[idx] || 0;
                const grandTotal = s.total_assets + s.total_investments || 1;
                const pct = Math.round((val / grandTotal) * 100);
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-800">
                      <span>{label}</span>
                      <strong className="text-emerald-700">₹{val.toLocaleString()} ({pct}%)</strong>
                    </div>
                    <div className="h-2.5 bg-surface border border-border/60 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-500 font-medium text-center py-8">
              No asset or investment allocation data available.
            </div>
          )}
        </div>
      </div>

      {/* PREVIEWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-border rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              Government Scheme Finder
            </h3>
            <span className="text-[10px] font-bold text-primary-dark bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Active Module
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-4 font-medium">
            Discover central and state government financial assistance, pension, and welfare schemes tailored to your income profile.
          </p>
          <a
            href="/government-schemes"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <span>Explore Welfare Schemes</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-white border border-border rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Insurance Policy Analyzer
            </h3>
            <span className="text-[10px] font-bold text-primary-dark bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Active Module
            </span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-4 font-medium">
            Upload PDF or image policy documents, extract coverage data automatically, and evaluate your insurance health score.
          </p>
          <a
            href="/insurance"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <span>Analyze Policies</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </DashboardShell>
  );
}
