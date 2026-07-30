"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { EmptyState } from "@/components/cards/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInsurancePolicyDetail } from "@/hooks/useInsurancePolicies";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  Activity,
  Calendar,
  Building2,
  User,
  Phone,
  Clock,
  Zap,
  FileText,
  DollarSign,
} from "lucide-react";

function formatAmount(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = params?.id as string;

  const { data: policy, isLoading, isError } = useInsurancePolicyDetail(policyId);

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

  if (isError || !policy) {
    return (
      <DashboardShell>
        <div className="py-12">
          <EmptyState
            title="Insurance policy not found"
            description="The requested policy could not be found or has been deleted."
          />
          <div className="mt-4 flex justify-center">
            <Link href="/insurance">
              <Button variant="secondary" className="gap-2">
                <ChevronLeft size={16} /> Return to Insurance Analyzer
              </Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const analysis = policy.analysis;
  const aiExplanation = policy.ai_explanation;

  return (
    <DashboardShell>
      <PageHeader
        title={policy.plan_name || policy.policy_name || `${policy.company} Policy`}
        subtitle={`${policy.company || policy.provider} • Policy No: ${policy.policy_number || "N/A"}`}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Insurance Analyzer", href: "/insurance" },
          { label: policy.company || "Policy Details" },
        ]}
      />

      <div className="space-y-6">
        {/* HERO BANNER */}
        <div className="rounded-card border border-border bg-gradient-to-r from-[#191E1C] via-[#1F2724] to-[#191E1C] p-6 text-white shadow-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary" className="bg-primary/20 text-primary-light border border-primary/30">
                  {policy.policy_type}
                </Badge>
                <span className="text-xs text-gray-300 font-medium bg-white/10 px-2.5 py-0.5 rounded-full">
                  {policy.ocr_confidence}% OCR Confidence
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {policy.company || policy.provider}
              </h1>
              <p className="text-xs text-gray-300">
                Holder: <strong>{policy.policy_holder || "Policy Holder"}</strong> • Plan: <strong>{policy.plan_name || policy.policy_name}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/insurance">
                <Button variant="secondary" size="md" className="gap-2 text-xs">
                  <ChevronLeft size={16} /> Back to Policies
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Sum Insured (Coverage)</span>
              <p className="text-emerald-400 font-semibold mt-0.5">{formatAmount(policy.coverage_amount)}</p>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Premium Amount</span>
              <p className="text-primary-light font-semibold mt-0.5">
                {formatAmount(policy.premium_amount || policy.premium || 0)} /{policy.premium_frequency || "Yr"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Policy Status</span>
              <p className="text-white font-semibold mt-0.5 capitalize flex items-center gap-1">
                {policy.status === "Active" ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle size={12} /> Expired
                  </span>
                )}
              </p>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Nominee</span>
              <p className="text-cyan-300 font-semibold mt-0.5">{policy.nominee || "Family Member"}</p>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN CONTENT (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* POLICY DETAILS CARD */}
            <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
              <h2 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Policy Information & Terms
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-border/60 pt-3">
                <div>
                  <span className="text-muted block">Insurance Company</span>
                  <strong className="text-[#14181C] text-sm">{policy.company || policy.provider}</strong>
                </div>
                <div>
                  <span className="text-muted block">Policy Number</span>
                  <strong className="text-[#14181C] text-sm">{policy.policy_number || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-muted block">Insured Person / Holder</span>
                  <strong className="text-[#14181C] text-sm">{policy.policy_holder || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-muted block">Policy Category</span>
                  <strong className="text-[#14181C] text-sm">{policy.policy_type}</strong>
                </div>
                <div>
                  <span className="text-muted block">Claim Contact Helpline</span>
                  <strong className="text-primary-dark font-semibold text-sm">{policy.claim_contact || "1800-102-4488"}</strong>
                </div>
                <div>
                  <span className="text-muted block">Nominee Beneficiary</span>
                  <strong className="text-[#14181C] text-sm">{policy.nominee || "N/A"}</strong>
                </div>
              </div>
            </div>

            {/* TIMELINE & DATES CARD */}
            <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
              <h2 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
                <Calendar size={18} className="text-primary" /> Policy Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-surface p-4 rounded-xl border border-border/60">
                <div>
                  <span className="text-muted block">Inception / Start Date</span>
                  <strong className="text-[#14181C] text-sm">
                    {policy.start_date ? new Date(policy.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-muted block">Expiry / Renewal Date</span>
                  <strong className="text-emerald-700 text-sm">
                    {(policy.end_date || policy.renewal_date) ? new Date(policy.end_date || policy.renewal_date!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-muted block">Maturity Date</span>
                  <strong className="text-[#14181C] text-sm">
                    {policy.maturity_date ? new Date(policy.maturity_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                  </strong>
                </div>
              </div>
            </div>

            {/* GROQ AI EXPLANATION CARD */}
            {aiExplanation && (
              <div className="relative overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-[#191E1C] via-[#1c2623] to-[#121614] p-6 text-white shadow-card">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Groq AI Plain-English Explanation</h3>
                    <p className="text-[11px] text-gray-400">Policy explanation generated from backend structured JSON</p>
                  </div>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 mb-4">
                  {aiExplanation.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {aiExplanation.strengths && aiExplanation.strengths.length > 0 && (
                    <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20">
                      <span className="font-semibold text-emerald-400 block mb-1">Policy Strengths</span>
                      <ul className="space-y-1 text-gray-300">
                        {aiExplanation.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiExplanation.risks && aiExplanation.risks.length > 0 && (
                    <div className="rounded-xl bg-rose-500/10 p-3 border border-rose-500/20">
                      <span className="font-semibold text-rose-400 block mb-1">Identified Risks</span>
                      <ul className="space-y-1 text-gray-300">
                        {aiExplanation.risks.map((r, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <AlertTriangle size={12} className="text-rose-400 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiExplanation.recommendations && aiExplanation.recommendations.length > 0 && (
                    <div className="rounded-xl bg-cyan-500/10 p-3 border border-cyan-500/20">
                      <span className="font-semibold text-cyan-400 block mb-1">Recommendations</span>
                      <ul className="space-y-1 text-gray-300">
                        {aiExplanation.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <Zap size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR (Right col) */}
          <div className="space-y-6">
            {/* INSURANCE HEALTH SCORE CARD (MODULE EXCLUSIVE) */}
            <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-semibold text-[#14181C] text-sm flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Insurance Health Score
                </h3>
                <Badge tone="primary" className="text-[10px]">Module Exclusive</Badge>
              </div>

              <div className="text-center py-3 bg-surface rounded-xl p-4 border border-border/60">
                <span className="text-xs text-muted uppercase tracking-wider font-medium block">
                  Portfolio Health
                </span>
                <div className="text-3xl font-bold text-primary-dark mt-1">
                  {analysis?.insurance_health_score || 0}
                  <span className="text-xs text-muted font-normal"> / 100</span>
                </div>

                <div className="mt-2 h-2.5 w-full rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      (analysis?.insurance_health_score || 0) >= 90
                        ? "bg-emerald-500"
                        : (analysis?.insurance_health_score || 0) >= 70
                        ? "bg-primary"
                        : (analysis?.insurance_health_score || 0) >= 40
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${analysis?.insurance_health_score || 0}%` }}
                  />
                </div>

                <span className="text-xs font-semibold text-[#14181C] mt-2 block">
                  {analysis?.score_status || "Evaluating Coverage..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
