"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { EmptyState } from "@/components/cards/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useGovernmentSchemes } from "@/hooks/useGovernmentSchemes";
import { useDashboard } from "@/hooks/useDashboard";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { RecommendedSchemeData, SavedSchemeData } from "@/lib/api/government";
import {
  Landmark,
  Search,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  Info,
  DollarSign,
  Sparkles,
  ArrowRight,
  Clock,
  Building2,
  MapPin,
  Check,
  Zap,
  Filter,
  UserCheck,
  Award,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Agriculture",
  "Housing",
  "Pension",
  "Health Insurance",
  "Education & Scholarship",
  "Insurance",
  "Investment & Pension",
  "Social Security",
  "Social Welfare",
];

const STATES = [
  "All",
  "Tamil Nadu",
  "Maharashtra",
  "Karnataka",
  "Delhi",
  "Gujarat",
  "Uttar Pradesh",
  "Kerala",
];

const APPLICATION_STATUSES = ["Interested", "Applied", "Approved", "Rejected", "Completed"];

function formatAmount(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function GovernmentSchemesPage() {
  const toast = useToast();
  const { summary, isLoading: isDashboardLoading } = useDashboard();
  const { profile, isLoading: isProfileLoading } = useFinancialProfile();

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "eligibility" | "benefit">("priority");

  // Tab State: "recommendations" vs "tracker"
  const [activeTab, setActiveTab] = useState<"recommendations" | "tracker">("recommendations");
  const [trackerStatusFilter, setTrackerStatusFilter] = useState<string>("All");

  const {
    recommended,
    saved,
    isLoadingRecommended,
    isLoadingSaved,
    saveScheme,
    unsaveScheme,
    updateStatus,
    isSaving,
    isUnsaving,
    isUpdatingStatus,
  } = useGovernmentSchemes({
    category: selectedCategory,
    state: selectedState,
    eligible_only: eligibleOnly,
    search: searchTerm,
  });

  // Profile attributes
  const userIncome = summary?.monthly_income || profile?.monthly_income || 0;
  const userState = profile?.state || "All";
  const userOccupation = profile?.occupation || "Self-Employed / Professional";
  const userSavings = profile?.savings || summary?.monthly_savings || 0;
  const riskProfile = profile?.risk_profile || "Moderate";

  // Sort recommendations dynamically
  const sortedRecommendations = [...recommended].sort((a, b) => {
    if (sortBy === "priority") return b.priority_score - a.priority_score;
    if (sortBy === "eligibility") return b.eligibility_percentage - a.eligibility_percentage;
    if (sortBy === "benefit") return b.estimated_financial_benefit - a.estimated_financial_benefit;
    return 0;
  });

  // Calculate Hero Statistics
  const eligibleCount = recommended.filter((s) => s.eligible).length;
  const savedCount = saved.length;
  const totalPotentialBenefit = recommended
    .filter((s) => s.eligible)
    .reduce((acc, s) => acc + (s.estimated_financial_benefit || 0), 0);
  const applicationsInProgress = saved.filter((s) =>
    ["Applied", "Approved", "Interested"].includes(s.application_status)
  ).length;

  // Filter saved tracker schemes
  const filteredSaved = saved.filter((item) =>
    trackerStatusFilter === "All" ? true : item.application_status === trackerStatusFilter
  );

  const handleToggleSave = async (scheme: RecommendedSchemeData) => {
    try {
      if (scheme.is_saved) {
        await unsaveScheme(scheme.id);
        toast.info(`Removed "${scheme.name}" from saved list.`, "Unsaved");
      } else {
        await saveScheme({ schemeId: scheme.id, status: "Interested" });
        toast.success(`Saved "${scheme.name}" to your Scheme Tracker!`, "Scheme Bookmarked");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update bookmark.", "Error");
    }
  };

  const handleStatusChange = async (schemeId: string, status: string) => {
    try {
      await updateStatus({ schemeId, status });
      toast.success(`Application status updated to "${status}"`, "Status Updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.", "Error");
    }
  };

  const isLoadingAll = isLoadingRecommended || isLoadingSaved || isDashboardLoading || isProfileLoading;

  return (
    <DashboardShell>
      <PageHeader
        title="Government Scheme Finder"
        subtitle="Discover Central & State Government benefits personalized using your Financial Profile."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Government Schemes" }]}
      />

      {/* READ-ONLY FINANCIAL PROFILE AUTO-SYNC BANNER */}
      <div className="mb-6 rounded-card border border-border bg-gradient-to-r from-[#191E1C] via-[#1E2723] to-[#191E1C] p-5 text-white shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
              <Landmark size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-light">
                  Rule-Based Engine (No LLM)
                </span>
                <Badge tone="primary" className="bg-primary/20 text-primary-light border border-primary/30 text-[10px]">
                  Deterministic Match
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-white mt-0.5">
                Auto-Matched to Your Financial Profile
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Evaluated against your verified income, residency, age, occupation, and active wealth goals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "recommendations"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Recommended Schemes ({recommended.length})
            </button>
            <button
              onClick={() => setActiveTab("tracker")}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "tracker"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              Application Tracker ({saved.length})
            </button>
          </div>
        </div>

        {/* Profile Attributes Row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-3 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={14} className="text-primary-light shrink-0" />
            <span>State: <strong className="text-white font-medium">{userState}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Building2 size={14} className="text-primary-light shrink-0" />
            <span>Occupation: <strong className="text-white font-medium">{userOccupation}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <TrendingUp size={14} className="text-emerald-400 shrink-0" />
            <span>Monthly Income: <strong className="text-emerald-400 font-medium">{formatAmount(userIncome)}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <UserCheck size={14} className="text-cyan-400 shrink-0" />
            <span>Risk Profile: <strong className="text-cyan-400 font-medium capitalize">{riskProfile}</strong></span>
          </div>
        </div>
      </div>

      {/* HERO STATISTICS CARDS */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Eligible Schemes</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14181C]">{eligibleCount}</div>
          <p className="text-[11px] text-muted mt-1">Matched 100% to qualification criteria</p>
        </div>

        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Saved Schemes</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
              <Bookmark size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14181C]">{savedCount}</div>
          <p className="text-[11px] text-muted mt-1">Bookmarked in your application portal</p>
        </div>

        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Est. Annual Benefits</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{formatAmount(totalPotentialBenefit)}</div>
          <p className="text-[11px] text-muted mt-1">Direct subsidies, pensions & coverages</p>
        </div>

        <div className="rounded-card border border-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Applications in Progress</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-[#14181C]">{applicationsInProgress}</div>
          <p className="text-[11px] text-muted mt-1">Active status tracked in system</p>
        </div>
      </div>

      {activeTab === "recommendations" ? (
        <div className="space-y-6">
          {/* SEARCH & FILTERS BAR */}
          <div className="rounded-card border border-border bg-white p-4 shadow-card space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-muted" />
                <Input
                  placeholder="Search scheme name, category, or ministry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* State Filter */}
              <div className="w-full md:w-44">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs text-[#14181C] focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="All">All States (India)</option>
                  {STATES.filter((s) => s !== "All").map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="w-full md:w-44">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs text-[#14181C] focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="priority">Sort: Priority Score</option>
                  <option value="eligibility">Sort: Eligibility %</option>
                  <option value="benefit">Sort: Highest Benefit</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills & Eligible Only Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-thin py-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-muted hover:bg-white hover:text-[#14181C]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Eligible Only Toggle */}
              <label className="flex items-center gap-2 text-xs font-medium text-[#14181C] cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={eligibleOnly}
                  onChange={(e) => setEligibleOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>Eligible Only</span>
              </label>
            </div>
          </div>

          {/* RECOMMENDED SCHEMES LIST */}
          {isLoadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-card bg-card animate-pulse border border-border" />
              ))}
            </div>
          ) : sortedRecommendations.length === 0 ? (
            <EmptyState
              title="No matching government schemes found"
              description="Try broadening your category or state filters to discover available national and state programs."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {sortedRecommendations.map((scheme) => (
                <div
                  key={scheme.id}
                  className="group rounded-card border border-border bg-white p-6 shadow-card hover:border-primary/40 hover:shadow-card-hover transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row: Category, Source & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge tone="primary" className="text-[11px]">
                          {scheme.category || "General"}
                        </Badge>
                        <span className="text-[11px] text-muted font-medium bg-surface px-2 py-0.5 rounded-full">
                          {scheme.source || "myScheme"}
                        </span>
                        {scheme.state && scheme.state !== "All" && (
                          <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <MapPin size={10} /> {scheme.state}
                          </span>
                        )}
                      </div>

                      {/* Priority Score & Eligibility % */}
                      <div className="flex items-center gap-2">
                        <Badge tone={scheme.priority_score >= 75 ? "success" : "warning"} className="gap-1 font-semibold">
                          <Award size={12} /> {scheme.priority_score} Score
                        </Badge>
                        <Badge tone={scheme.eligible ? "success" : "neutral"} className="gap-1 font-semibold">
                          {scheme.eligibility_percentage}% Match
                        </Badge>
                      </div>
                    </div>

                    {/* Scheme Name & Ministry */}
                    <h3 className="text-base font-semibold text-[#14181C] group-hover:text-primary transition-colors">
                      {scheme.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{scheme.ministry || "Government of India"}</p>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {scheme.description}
                    </p>

                    {/* Goal Match Highlight */}
                    {scheme.goal_matched && (
                      <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200/60 p-2.5 text-xs text-amber-800 flex items-center gap-2 font-medium">
                        <Sparkles size={14} className="text-amber-600 shrink-0" />
                        <span>Directly matches your active Financial Goals</span>
                      </div>
                    )}

                    {/* Deterministic "Reasons You Qualify" Checklist */}
                    <div className="mt-3.5 space-y-1 rounded-xl bg-surface/80 p-3 border border-border/40">
                      <span className="text-[11px] font-semibold text-[#14181C] uppercase tracking-wider block mb-1.5">
                        Deterministic Qualification Reasons:
                      </span>
                      {scheme.reasons.slice(0, 3).map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span className="truncate">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Action Buttons */}
                  <div className="mt-5 border-t border-border/60 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-muted block">Estimated Financial Benefit</span>
                      <strong className="text-sm font-semibold text-emerald-700">
                        {scheme.estimated_financial_benefit > 0
                          ? formatAmount(scheme.estimated_financial_benefit)
                          : "Subsidized Support"}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSave(scheme)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                          scheme.is_saved
                            ? "bg-primary/10 border-primary text-primary-dark"
                            : "bg-white border-border text-muted hover:text-[#14181C] hover:bg-surface"
                        }`}
                        title={scheme.is_saved ? "Bookmarked" : "Bookmark Scheme"}
                      >
                        {scheme.is_saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>

                      <Link href={`/government-schemes/${scheme.id}`}>
                        <Button variant="secondary" size="sm" className="gap-1 text-xs">
                          Details <ChevronRight size={14} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* APPLICATION TRACKER TAB */
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-white p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#14181C]">Filter Status:</span>
              <div className="flex flex-wrap gap-1">
                {["All", ...APPLICATION_STATUSES].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTrackerStatusFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                      trackerStatusFilter === st
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-muted hover:bg-white hover:text-[#14181C]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-muted">{filteredSaved.length} saved applications</span>
          </div>

          {filteredSaved.length === 0 ? (
            <EmptyState
              title="No saved schemes in this status"
              description="Bookmark recommended schemes from the list above to track your application status (Interested, Applied, Approved, Completed)."
            />
          ) : (
            <div className="space-y-4">
              {filteredSaved.map((item) => {
                const scheme = item.scheme;
                if (!scheme) return null;

                return (
                  <div
                    key={item.id}
                    className="rounded-card border border-border bg-white p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge tone="primary" className="text-[11px]">{scheme.category || "General"}</Badge>
                        <span className="text-xs text-muted">{scheme.ministry}</span>
                      </div>

                      <h3 className="text-base font-semibold text-[#14181C]">{scheme.name}</h3>
                      <p className="text-xs text-muted line-clamp-1">{scheme.eligibility_summary || scheme.description}</p>
                    </div>

                    {/* Status Dropdown & Actions */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div>
                        <label className="text-[10px] text-muted block mb-0.5">Application Status</label>
                        <select
                          value={item.application_status}
                          onChange={(e) => handleStatusChange(scheme.id, e.target.value)}
                          className="h-9 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-[#14181C] focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {APPLICATION_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      {scheme.official_url && (
                        <a
                          href={scheme.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                            Apply Link <ExternalLink size={14} />
                          </Button>
                        </a>
                      )}

                      <Link href={`/government-schemes/${scheme.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
