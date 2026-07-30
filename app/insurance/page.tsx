"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { EmptyState } from "@/components/cards/EmptyState";
import { Modal } from "@/components/ui/modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useInsurancePolicies } from "@/hooks/useInsurancePolicies";
import { useDashboard } from "@/hooks/useDashboard";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { InsurancePolicyData, OCRUploadResponseData } from "@/lib/api/insurance";
import {
  Shield,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Edit3,
  Trash2,
  ChevronRight,
  Zap,
  Activity,
  Plus,
  Loader2,
  Calendar,
  Building2,
  DollarSign,
  HeartPulse,
  Car,
  Plane,
  UserCheck,
  Phone,
  HelpCircle,
  Eye,
} from "lucide-react";

const POLICY_TYPES = [
  "Health Insurance",
  "Term Life Insurance",
  "Vehicle Insurance",
  "Personal Accident Insurance",
  "Travel Insurance",
];

const FREQUENCIES = ["Annual", "Monthly", "Quarterly", "Semi-Annual"];

function formatAmount(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function InsurancePage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { summary, isLoading: isDashboardLoading } = useDashboard();
  const { profile, isLoading: isProfileLoading } = useFinancialProfile();
  const {
    policies,
    portfolioAnalysis,
    isLoading: isPoliciesLoading,
    uploadDocument,
    createPolicy,
    updatePolicy,
    deletePolicy,
    isUploading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useInsurancePolicies();

  // OCR Upload / Edit Form State
  const [ocrResult, setOcrResult] = useState<OCRUploadResponseData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<InsurancePolicyData> | null>(null);
  const [deletingPolicyId, setDeletingPolicyId] = useState<string | null>(null);

  // Drag & drop highlight state
  const [isDragging, setIsDragging] = useState(false);

  // Form input fields
  const [formCompany, setFormCompany] = useState("");
  const [formPolicyNumber, setFormPolicyNumber] = useState("");
  const [formPolicyHolder, setFormPolicyHolder] = useState("");
  const [formPolicyType, setFormPolicyType] = useState("Health Insurance");
  const [formPlanName, setFormPlanName] = useState("");
  const [formCoverageAmount, setFormCoverageAmount] = useState("");
  const [formPremiumAmount, setFormPremiumAmount] = useState("");
  const [formPremiumFrequency, setFormPremiumFrequency] = useState("Annual");
  const [formNominee, setFormNominee] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formMaturityDate, setFormMaturityDate] = useState("");
  const [formClaimContact, setFormClaimContact] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [formConfidence, setFormConfidence] = useState(100);

  const monthlyIncome = summary?.monthly_income || profile?.monthly_income || 0;
  const annualIncome = monthlyIncome * 12;

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    try {
      toast.info(`Parsing policy document "${file.name}" via PyMuPDF/OCR...`, "Processing Document");
      const res = await uploadDocument(file);
      setOcrResult(res);

      // Pre-fill edit modal with extracted values
      const ext = res.extracted_data;
      setEditingPolicy(ext);
      setFormCompany(ext.company || "Insurance Provider");
      setFormPolicyNumber(ext.policy_number || "");
      setFormPolicyHolder(ext.policy_holder || "Policy Holder");
      setFormPolicyType(ext.policy_type || "Health Insurance");
      setFormPlanName(ext.plan_name || "");
      setFormCoverageAmount(ext.coverage_amount !== undefined && ext.coverage_amount !== null ? ext.coverage_amount.toString() : "");
      setFormPremiumAmount(ext.premium_amount !== undefined && ext.premium_amount !== null ? ext.premium_amount.toString() : "");
      setFormPremiumFrequency(ext.premium_frequency || "Annual");
      setFormNominee(ext.nominee || "");
      setFormStartDate(ext.start_date ? ext.start_date.split("T")[0] : "");
      setFormEndDate(ext.end_date ? ext.end_date.split("T")[0] : "");
      setFormMaturityDate(ext.maturity_date ? ext.maturity_date.split("T")[0] : "");
      setFormClaimContact(ext.claim_contact || "");
      setFormStatus(ext.status || "Active");
      setFormConfidence(ext.ocr_confidence || 85);

      setIsEditModalOpen(true);
      toast.success("Policy extracted! Please review and verify extracted details.", "OCR Complete");
    } catch (err: any) {
      toast.error(err.message || "Failed to process document.", "OCR Error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleOpenManualCreate = () => {
    setOcrResult(null);
    setEditingPolicy(null);
    setFormCompany("");
    setFormPolicyNumber("");
    setFormPolicyHolder("");
    setFormPolicyType("Health Insurance");
    setFormPlanName("");
    setFormCoverageAmount("");
    setFormPremiumAmount("");
    setFormPremiumFrequency("Annual");
    setFormNominee("");
    setFormStartDate("");
    setFormEndDate("");
    setFormMaturityDate("");
    setFormClaimContact("");
    setFormStatus("Active");
    setFormConfidence(100);
    setIsEditModalOpen(true);
  };

  const handleOpenEditExisting = (policy: InsurancePolicyData) => {
    setOcrResult(null);
    setEditingPolicy(policy);
    setFormCompany(policy.company || policy.provider || "");
    setFormPolicyNumber(policy.policy_number || "");
    setFormPolicyHolder(policy.policy_holder || "");
    setFormPolicyType(policy.policy_type || "Health Insurance");
    setFormPlanName(policy.plan_name || policy.policy_name || "");
    setFormCoverageAmount(policy.coverage_amount.toString());
    setFormPremiumAmount((policy.premium_amount || policy.premium || 0).toString());
    setFormPremiumFrequency(policy.premium_frequency || "Annual");
    setFormNominee(policy.nominee || "");
    setFormStartDate(policy.start_date ? policy.start_date.split("T")[0] : "");
    setFormEndDate((policy.end_date || policy.renewal_date) ? (policy.end_date || policy.renewal_date)!.split("T")[0] : "");
    setFormMaturityDate(policy.maturity_date ? policy.maturity_date.split("T")[0] : "");
    setFormClaimContact(policy.claim_contact || "");
    setFormStatus(policy.status || "Active");
    setFormConfidence(policy.ocr_confidence || 100);
    setIsEditModalOpen(true);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim()) {
      toast.error("Please enter the Insurance Company name.", "Validation Error");
      return;
    }

    const payload: Partial<InsurancePolicyData> = {
      company: formCompany.trim(),
      provider: formCompany.trim(),
      policy_number: formPolicyNumber.trim() || undefined,
      policy_holder: formPolicyHolder.trim() || undefined,
      policy_type: formPolicyType,
      plan_name: formPlanName.trim() || `${formCompany} ${formPolicyType}`,
      policy_name: formPlanName.trim() || `${formCompany} ${formPolicyType}`,
      coverage_amount: Number(formCoverageAmount) || 0,
      premium_amount: Number(formPremiumAmount) || 0,
      premium: Number(formPremiumAmount) || 0,
      premium_frequency: formPremiumFrequency,
      nominee: formNominee.trim() || undefined,
      start_date: formStartDate || null,
      end_date: formEndDate || null,
      renewal_date: formEndDate || null,
      maturity_date: formMaturityDate || null,
      claim_contact: formClaimContact.trim() || undefined,
      status: formStatus,
      ocr_confidence: formConfidence,
    };

    try {
      if (editingPolicy && editingPolicy.id) {
        await updatePolicy({ id: editingPolicy.id, payload });
        toast.success(`Policy "${formCompany}" updated successfully!`, "Policy Saved");
      } else {
        await createPolicy(payload);
        toast.success(`Policy "${formCompany}" added successfully!`, "Policy Created");
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save policy.", "Error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPolicyId) return;
    try {
      await deletePolicy(deletingPolicyId);
      toast.info("Insurance policy removed.", "Policy Deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete policy.", "Error");
    } finally {
      setDeletingPolicyId(null);
    }
  };

  const isLoadingAll = isPoliciesLoading || isDashboardLoading || isProfileLoading;

  return (
    <DashboardShell>
      <PageHeader
        title="Insurance OCR & Policy Analyzer"
        subtitle="Upload policy PDFs or Images to extract coverage details, evaluate portfolio insurance health, and view AI recommendations."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Insurance Analyzer" }]}
      />

      {/* AUTO-SYNCED READ-ONLY PROFILE BANNER */}
      <div className="mb-6 rounded-card border border-border bg-gradient-to-r from-[#191E1C] via-[#1E2723] to-[#191E1C] p-5 text-white shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-light">
                  PyMuPDF + Groq AI Analysis
                </span>
                <Badge tone="primary" className="bg-primary/20 text-primary-light border border-primary/30 text-[10px]">
                  PDF / Image OCR
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-white mt-0.5">
                Automated Insurance Intelligence
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Upload your insurance policy document to parse sum insured, premiums, and detect portfolio coverage gaps.
              </p>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenManualCreate} className="gap-2 shrink-0">
            <Plus size={16} /> Add Policy Manually
          </Button>
        </div>

        {/* Profile Metrics Row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-3 text-xs">
          <div>
            <span className="text-gray-400 block text-[11px]">Monthly Income</span>
            <p className="text-emerald-400 font-semibold mt-0.5">{formatAmount(monthlyIncome)}</p>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Active Policies</span>
            <p className="text-white font-semibold mt-0.5">{policies.length} Policies</p>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Total Annual Premium</span>
            <p className="text-primary-light font-semibold mt-0.5">
              {formatAmount(portfolioAnalysis?.total_annual_premiums || 0)}
            </p>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Health Insurance Cover</span>
            <p className="text-cyan-300 font-semibold mt-0.5">
              {formatAmount(portfolioAnalysis?.total_health_coverage || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* DRAG & DROP UPLOAD BOX (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-card border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border bg-white hover:border-primary/50 hover:bg-surface"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary-dark group-hover:scale-110 transition-transform mb-3">
              {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
            </div>

            <h3 className="font-semibold text-[#14181C] text-sm">
              {isUploading ? "Extracting Policy Data with PyMuPDF/OCR..." : "Click or Drag & Drop Insurance Document"}
            </h3>
            <p className="text-xs text-muted max-w-sm mt-1">
              Supports <strong>PDF, PNG, JPG, JPEG</strong> policy schedules. PyMuPDF automatically extracts policy number, provider, sum insured & premium.
            </p>

            {isUploading && (
              <div className="mt-4 w-full max-w-xs space-y-1">
                <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-3/4 rounded-full" />
                </div>
                <span className="text-[11px] text-muted">Running regex & field extraction parser...</span>
              </div>
            )}
          </div>

          {/* GROQ AI EXPLANATION CARD */}
          {ocrResult?.ai_explanation && (
            <div className="relative overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-[#191E1C] via-[#1c2623] to-[#121614] p-6 text-white shadow-card">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Groq AI Plain-English Analysis</h3>
                  <p className="text-[11px] text-gray-400">Structured interpretation of policy coverage & risks</p>
                </div>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 mb-4">
                {ocrResult.ai_explanation.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {ocrResult.ai_explanation.strengths.length > 0 && (
                  <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20">
                    <span className="font-semibold text-emerald-400 block mb-1">Strengths</span>
                    <ul className="space-y-1 text-gray-300">
                      {ocrResult.ai_explanation.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ocrResult.ai_explanation.risks.length > 0 && (
                  <div className="rounded-xl bg-rose-500/10 p-3 border border-rose-500/20">
                    <span className="font-semibold text-rose-400 block mb-1">Risks & Gaps</span>
                    <ul className="space-y-1 text-gray-300">
                      {ocrResult.ai_explanation.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <AlertTriangle size={12} className="text-rose-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {ocrResult.ai_explanation.recommendations.length > 0 && (
                  <div className="rounded-xl bg-cyan-500/10 p-3 border border-cyan-500/20">
                    <span className="font-semibold text-cyan-400 block mb-1">Next Steps</span>
                    <ul className="space-y-1 text-gray-300">
                      {ocrResult.ai_explanation.recommendations.map((rec, i) => (
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

        {/* INSURANCE HEALTH SCORE CARD (MODULE EXCLUSIVE) */}
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-semibold text-[#14181C] text-sm flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                Insurance Health Score
              </h3>
              <Badge tone="primary" className="text-[10px]">Module Exclusive</Badge>
            </div>

            {/* Health Score Gauge */}
            <div className="text-center py-3 bg-surface rounded-xl p-4 border border-border/60">
              <span className="text-xs text-muted uppercase tracking-wider font-medium block">
                Portfolio Coverage Score
              </span>
              <div className="text-3xl font-bold text-primary-dark mt-1">
                {portfolioAnalysis?.insurance_health_score || 0}
                <span className="text-xs text-muted font-normal"> / 100</span>
              </div>

              <div className="mt-2 h-2.5 w-full rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    (portfolioAnalysis?.insurance_health_score || 0) >= 90
                      ? "bg-emerald-500"
                      : (portfolioAnalysis?.insurance_health_score || 0) >= 70
                      ? "bg-primary"
                      : (portfolioAnalysis?.insurance_health_score || 0) >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${portfolioAnalysis?.insurance_health_score || 0}%` }}
                />
              </div>

              <span className="text-xs font-semibold text-[#14181C] mt-2 block">
                {portfolioAnalysis?.score_status || "Evaluating Coverage..."}
              </span>
            </div>

            {/* Coverage Gap Alert Cards */}
            {portfolioAnalysis?.coverage_gap_warnings && portfolioAnalysis.coverage_gap_warnings.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-rose-700 block">Coverage Gap Warnings:</span>
                {portfolioAnalysis.coverage_gap_warnings.map((warn, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-800 border border-rose-200/60">
                    <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SAVED POLICIES TABLE */}
      <div className="rounded-card border border-border bg-white p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#14181C]">Saved Insurance Policies</h2>
            <p className="text-xs text-muted">Your active and historical policy portfolio</p>
          </div>
          <span className="text-xs text-muted font-medium">{policies.length} policies recorded</span>
        </div>

        {isLoadingAll ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <EmptyState
            title="No insurance policies saved yet"
            description="Upload your insurance policy document (PDF/Image) using the box above to extract details and analyze your portfolio."
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Company & Plan</th>
                  <th className="py-3 px-4">Policy No.</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Coverage</th>
                  <th className="py-3 px-4">Premium</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#14181C]">
                      <div>{p.company || p.provider}</div>
                      <span className="text-[11px] text-muted font-normal">{p.plan_name || p.policy_name}</span>
                    </td>
                    <td className="py-3 px-4 text-muted">{p.policy_number || "N/A"}</td>
                    <td className="py-3 px-4">
                      <Badge tone="primary" className="text-[10px]">{p.policy_type}</Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{formatAmount(p.coverage_amount)}</td>
                    <td className="py-3 px-4 text-[#14181C]">
                      {formatAmount(p.premium_amount || p.premium || 0)} <span className="text-[10px] text-muted">/{p.premium_frequency || "Yr"}</span>
                    </td>
                    <td className="py-3 px-4">
                      {p.status === "Active" ? (
                        <Badge tone="success" className="gap-1">
                          <CheckCircle2 size={10} /> Active
                        </Badge>
                      ) : (
                        <Badge tone="neutral" className="gap-1">
                          <AlertTriangle size={10} /> Expired
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <Link href={`/insurance/${p.id}`}>
                        <button className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-[#14181C] transition-colors" title="View Details">
                          <Eye size={15} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleOpenEditExisting(p)}
                        className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-[#14181C] transition-colors"
                        title="Edit Policy"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingPolicyId(p.id)}
                        className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete Policy"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDITABLE OCR RESULT / MANUAL EDIT MODAL */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingPolicy?.id ? "Edit Insurance Policy Details" : "Verify Extracted Policy Information"}
      >
        <form onSubmit={handleSavePolicy} className="space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin pr-1">
          {/* Validation Warnings Alert inside Modal */}
          {ocrResult?.validation_warnings && ocrResult.validation_warnings.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/80 space-y-1 text-xs text-amber-800">
              <span className="font-semibold block flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-600" /> Validation Warnings:
              </span>
              {ocrResult.validation_warnings.map((w, idx) => (
                <p key={idx}>• {w}</p>
              ))}
            </div>
          )}

          {/* OCR Confidence Badge */}
          <div className="flex items-center justify-between bg-surface p-2.5 rounded-xl border border-border/60 text-xs">
            <span className="text-muted">OCR Processing Quality</span>
            <Badge tone={formConfidence >= 80 ? "success" : "warning"} className="font-semibold">
              {formConfidence}% OCR Confidence
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Insurance Company
              </label>
              <Input
                placeholder="e.g. Star Health, HDFC ERGO"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Policy Number
              </label>
              <Input
                placeholder="e.g. P/111222/01/2026"
                value={formPolicyNumber}
                onChange={(e) => setFormPolicyNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Policy Holder Name
              </label>
              <Input
                placeholder="e.g. Rajesh Kumar"
                value={formPolicyHolder}
                onChange={(e) => setFormPolicyHolder(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Policy Type
              </label>
              <select
                value={formPolicyType}
                onChange={(e) => setFormPolicyType(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-[#14181C] focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {POLICY_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
              Plan / Scheme Name
            </label>
            <Input
              placeholder="e.g. Star Health Family Optima Floater"
              value={formPlanName}
              onChange={(e) => setFormPlanName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Coverage (Sum Insured ₹)
              </label>
              <Input
                type="number"
                placeholder="500000"
                value={formCoverageAmount}
                onChange={(e) => setFormCoverageAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Premium Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="12000"
                value={formPremiumAmount}
                onChange={(e) => setFormPremiumAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Frequency
              </label>
              <select
                value={formPremiumFrequency}
                onChange={(e) => setFormPremiumFrequency(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-[#14181C] focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Nominee
              </label>
              <Input
                placeholder="e.g. Spouse / Dependent"
                value={formNominee}
                onChange={(e) => setFormNominee(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Claim Contact Phone/Email
              </label>
              <Input
                placeholder="e.g. 1800-425-2255"
                value={formClaimContact}
                onChange={(e) => setFormClaimContact(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Policy Start Date
              </label>
              <Input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Policy Expiry / Renewal Date
              </label>
              <Input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isCreating || isUpdating} className="gap-2">
              {isCreating || isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {editingPolicy?.id ? "Update Policy" : "Save Policy to Portfolio"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION DIALOG FOR DELETE */}
      <ConfirmationDialog
        open={Boolean(deletingPolicyId)}
        onClose={() => setDeletingPolicyId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Insurance Policy"
        description="Are you sure you want to delete this insurance policy from your account? This action cannot be undone."
      />
    </DashboardShell>
  );
}
