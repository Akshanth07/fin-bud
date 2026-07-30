"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { EmptyState } from "@/components/cards/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useGovernmentSchemeDetail, useGovernmentSchemes } from "@/hooks/useGovernmentSchemes";
import {
  Landmark,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  ListOrdered,
  Sparkles,
  Award,
} from "lucide-react";

function formatAmount(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function SchemeDetailPage() {
  const params = useParams();
  const schemeId = params?.id as string;
  const toast = useToast();

  const { data: scheme, isLoading, isError } = useGovernmentSchemeDetail(schemeId);
  const { recommended, saveScheme, unsaveScheme, saved } = useGovernmentSchemes();

  const isSaved = saved.some((s) => s.scheme_id === schemeId);

  const handleToggleSave = async () => {
    if (!scheme) return;
    try {
      if (isSaved) {
        await unsaveScheme(scheme.id);
        toast.info("Scheme removed from bookmarks.", "Unsaved");
      } else {
        await saveScheme({ schemeId: scheme.id, status: "Interested" });
        toast.success("Scheme bookmarked in application tracker!", "Saved");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update bookmark.", "Error");
    }
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="h-44 rounded-card bg-card animate-pulse border border-border" />
          <div className="h-64 rounded-card bg-card animate-pulse border border-border" />
        </div>
      </DashboardShell>
    );
  }

  if (isError || !scheme) {
    return (
      <DashboardShell>
        <div className="py-12">
          <EmptyState
            title="Government scheme not found"
            description="The requested scheme could not be found or has been archived."
          />
          <div className="mt-4 flex justify-center">
            <Link href="/government-schemes">
              <Button variant="secondary" className="gap-2">
                <ChevronLeft size={16} /> Return to Schemes
              </Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const benefits = scheme.benefits || {};
  const rules = scheme.eligibility_rules || {};
  const docs = scheme.documents_required || [];
  const steps = scheme.application_process || [];

  return (
    <DashboardShell>
      <PageHeader
        title={scheme.name}
        subtitle={`${scheme.ministry || "Government of India"} • Version ${scheme.version || 1}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Government Schemes", href: "/government-schemes" },
          { label: scheme.name },
        ]}
      />

      <div className="space-y-6">
        {/* HERO BANNER CARD */}
        <div className="rounded-card border border-border bg-gradient-to-r from-[#191E1C] via-[#1F2724] to-[#191E1C] p-6 text-white shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="bg-primary/20 text-primary-light border border-primary/30">
                  {scheme.category || "General"}
                </Badge>
                <span className="text-xs text-gray-300 font-medium bg-white/10 px-2.5 py-0.5 rounded-full">
                  {scheme.source || "myScheme"}
                </span>
                {scheme.state && scheme.state !== "All" && (
                  <span className="text-xs text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                    <MapPin size={12} /> {scheme.state}
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {scheme.name}
              </h1>
              <p className="text-xs text-gray-300 flex items-center gap-2">
                <Building2 size={14} className="text-primary-light shrink-0" />
                {scheme.ministry || "Ministry of Social Justice and Empowerment"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleToggleSave}
                className={`flex h-10 px-4 items-center gap-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSaved
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? "Saved in Tracker" : "Save Scheme"}
              </button>

              {scheme.official_url && (
                <a
                  href={scheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="md" className="gap-2">
                    Official Website <ExternalLink size={16} />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Application Deadline</span>
              <p className="text-white font-semibold mt-0.5 flex items-center gap-1">
                <Clock size={13} className="text-amber-400" /> {scheme.deadline || "Ongoing"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Target Jurisdiction</span>
              <p className="text-white font-semibold mt-0.5">{scheme.state || "All India"}</p>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Status</span>
              <p className="text-emerald-400 font-semibold mt-0.5 capitalize">{scheme.status}</p>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Data Version</span>
              <p className="text-cyan-300 font-semibold mt-0.5">v{scheme.version || 1}.0</p>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN CONTENT (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* OVERVIEW & DESCRIPTION */}
            <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
              <h2 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Scheme Overview
              </h2>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                {scheme.description}
              </p>
            </div>

            {/* BENEFITS STRUCTURE */}
            <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
              <h2 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
                <Zap size={18} className="text-emerald-600" /> Key Benefits & Financial Subsidy
              </h2>

              <div className="rounded-xl bg-emerald-50/80 p-4 border border-emerald-200/60 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block">
                  Benefit Summary:
                </span>
                <p className="text-sm font-semibold text-emerald-900">
                  {benefits.summary || benefits.subsidy_rate || "Direct financial assistance and subsidy under government norms."}
                </p>

                {benefits.benefit_type && (
                  <p className="text-xs text-emerald-700">
                    Benefit Type: <strong>{benefits.benefit_type}</strong>
                  </p>
                )}
                {benefits.amount && (
                  <p className="text-xs text-emerald-700">
                    Amount: <strong>{formatAmount(benefits.amount)} {benefits.frequency || ""}</strong>
                  </p>
                )}
                {benefits.tax_benefit && (
                  <p className="text-xs text-emerald-700">
                    Tax Exemption: <strong>{benefits.tax_benefit}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* STEP-BY-STEP APPLICATION PROCESS */}
            {steps.length > 0 && (
              <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
                <h2 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
                  <ListOrdered size={18} className="text-primary" /> Step-by-Step Application Guide
                </h2>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                  {steps.map((st: any, idx: number) => (
                    <div key={idx} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-sm">
                        {st.step || idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-[#14181C]">{st.title}</h3>
                        <p className="text-xs text-muted leading-relaxed">{st.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR (Right col) */}
          <div className="space-y-6">
            {/* ELIGIBILITY CRITERIA BREAKDOWN */}
            <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
              <h2 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" /> Eligibility Criteria
              </h2>

              {scheme.eligibility_summary && (
                <p className="text-xs font-medium text-primary-dark bg-primary/10 p-3 rounded-xl border border-primary/20">
                  {scheme.eligibility_summary}
                </p>
              )}

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted">Max Income Limit</span>
                  <strong className="text-[#14181C]">
                    {rules.income_max ? formatAmount(rules.income_max) : "No Max Limit"}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted">Age Bracket</span>
                  <strong className="text-[#14181C]">
                    {rules.age_min ?? 0} – {rules.age_max ?? "100"} years
                  </strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted">Target Occupation</span>
                  <strong className="text-[#14181C]">
                    {Array.isArray(rules.occupation) ? rules.occupation.join(", ") : rules.occupation || "Any"}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-muted">Gender Eligibility</span>
                  <strong className="text-[#14181C]">
                    {Array.isArray(rules.gender) ? rules.gender.join(", ") : rules.gender || "Any"}
                  </strong>
                </div>
              </div>
            </div>

            {/* DOCUMENTS REQUIRED CHECKLIST */}
            {docs.length > 0 && (
              <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
                <h2 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" /> Documents Required
                </h2>

                <div className="space-y-2">
                  {docs.map((doc: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-gray-700 bg-surface p-2.5 rounded-xl border border-border/40">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
