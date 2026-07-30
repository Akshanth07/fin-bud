"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { EmptyState } from "@/components/cards/EmptyState";
import { Modal } from "@/components/ui/modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useGoalPlanner, useGoalPrediction } from "@/hooks/useGoalPlanner";
import { useDashboard } from "@/hooks/useDashboard";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { GoalData, GoalCreatePayload } from "@/lib/api/goals";
import {
  Target,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  Zap,
  Home,
  Car,
  GraduationCap,
  Palmtree,
  PiggyBank,
  HeartHandshake,
  Award,
  HelpCircle,
  ArrowUpRight,
  Shield,
  Activity,
  PlusCircle,
  Loader2,
} from "lucide-react";

const GOAL_TYPES = [
  { id: "house", label: "House", icon: Home, color: "text-emerald-500 bg-emerald-500/10" },
  { id: "car", label: "Car", icon: Car, color: "text-blue-500 bg-blue-500/10" },
  { id: "education", label: "Education", icon: GraduationCap, color: "text-purple-500 bg-purple-500/10" },
  { id: "retirement", label: "Retirement", icon: Award, color: "text-amber-500 bg-amber-500/10" },
  { id: "vacation", label: "Vacation", icon: Palmtree, color: "text-cyan-500 bg-cyan-500/10" },
  { id: "emergency_fund", label: "Emergency Fund", icon: PiggyBank, color: "text-rose-500 bg-rose-500/10" },
  { id: "wedding", label: "Wedding", icon: HeartHandshake, color: "text-pink-500 bg-pink-500/10" },
  { id: "custom", label: "Custom", icon: HelpCircle, color: "text-slate-500 bg-slate-500/10" },
];

function getGoalIcon(type: string) {
  const match = GOAL_TYPES.find((gt) => gt.id === type);
  return match ? match.icon : Target;
}

function getGoalTypeColor(type: string) {
  const match = GOAL_TYPES.find((gt) => gt.id === type);
  return match ? match.color : "text-primary bg-primary/10";
}

function formatAmount(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function GoalPlannerPage() {
  const toast = useToast();
  const { summary, isLoading: isDashboardLoading } = useDashboard();
  const { profile, isLoading: isProfileLoading } = useFinancialProfile();
  const {
    goals,
    isLoading: isGoalsLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    isCreating,
    isUpdating,
    isDeleting,
    isContributing,
  } = useGoalPlanner();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalData | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Custom contribution input state
  const [customContrib, setCustomContrib] = useState<string>("");

  // Goal Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("house");
  const [formTarget, setFormTarget] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formPriority, setFormPriority] = useState("medium");

  // Determine active goal (or default to first goal if none selected)
  const activeGoal = goals.find((g) => g.id === selectedGoalId) || goals[0] || null;

  // AI Prediction for active goal
  const { data: prediction, isLoading: isPredictionLoading } = useGoalPrediction(activeGoal?.id);

  // Financial Profile values (auto-fetched)
  const monthlyIncome = summary?.monthly_income || profile?.monthly_income || 0;
  const monthlyExpenses = summary?.monthly_expenses || profile?.monthly_expenses || 0;
  const monthlySurplus = Math.max(monthlyIncome - monthlyExpenses, 0);
  const currentInvestments = summary?.total_investments || profile?.total_assets || 0;
  const emergencyFund = profile?.emergency_fund || summary?.total_assets || 0;
  const riskProfile = profile?.risk_profile || "Moderate";

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setFormName("");
    setFormType("house");
    setFormTarget("");
    setFormTargetDate("");
    setFormPriority("medium");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: GoalData) => {
    setEditingGoal(goal);
    setFormName(goal.goal_name);
    setFormType(goal.goal_type || "custom");
    setFormTarget(goal.target_amount.toString());
    setFormTargetDate(goal.target_date ? goal.target_date.split("T")[0] : "");
    setFormPriority(goal.priority || "medium");
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTarget || Number(formTarget) <= 0) {
      toast.error("Please enter a valid goal name and target amount.", "Validation Error");
      return;
    }

    const payload: GoalCreatePayload = {
      goal_name: formName.trim(),
      goal_type: formType,
      target_amount: Number(formTarget),
      target_date: formTargetDate || null,
      priority: formPriority,
    };

    try {
      if (editingGoal) {
        await updateGoal({ id: editingGoal.id, payload });
        toast.success(`Goal "${formName}" updated successfully!`, "Goal Updated");
      } else {
        const newGoal = await createGoal(payload);
        setSelectedGoalId(newGoal.id);
        toast.success(`Goal "${formName}" created successfully!`, "Goal Created");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save goal.", "Error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGoalId) return;
    try {
      await deleteGoal(deletingGoalId);
      if (selectedGoalId === deletingGoalId) {
        setSelectedGoalId(null);
      }
      toast.info("Goal removed successfully.", "Goal Deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete goal.", "Error");
    } finally {
      setDeletingGoalId(null);
    }
  };

  const handleAddContribution = async (amount: number) => {
    if (!activeGoal || amount <= 0) return;
    try {
      await addContribution({ id: activeGoal.id, amount });
      setCustomContrib("");
      toast.success(`Added ${formatAmount(amount)} to ${activeGoal.goal_name}!`, "Contribution Added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add contribution.", "Error");
    }
  };

  const isLoadingAll = isGoalsLoading || isDashboardLoading || isProfileLoading;

  return (
    <DashboardShell>
      <PageHeader
        title="Goal Planner"
        subtitle="Set wealth goals, track real-time savings contributions, and leverage AI financial recommendations."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Goal Planner" }]}
      />

      {/* READ-ONLY FINANCIAL PROFILE BANNER */}
      <div className="mb-6 rounded-card border border-border bg-gradient-to-r from-[#191E1C] via-[#1F2724] to-[#191E1C] p-5 text-white shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-light animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-light">
                Auto-Synced Financial Profile
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mt-1">
              Real-time Profile Intelligence
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Income, expenses, and investment totals are pulled automatically from your Financial Profile.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="gap-2 shrink-0">
            <Plus size={16} />
            Create Goal
          </Button>
        </div>

        {/* Read-Only Profile Metrics Row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-t border-white/10 pt-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-gray-400">Monthly Income</span>
            <p className="text-sm font-semibold text-emerald-400 mt-0.5">{formatAmount(monthlyIncome)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-gray-400">Monthly Expenses</span>
            <p className="text-sm font-semibold text-rose-400 mt-0.5">{formatAmount(monthlyExpenses)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-gray-400">Monthly Surplus</span>
            <p className="text-sm font-semibold text-primary-light mt-0.5">{formatAmount(monthlySurplus)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-gray-400">Current Investments</span>
            <p className="text-sm font-semibold text-cyan-400 mt-0.5">{formatAmount(currentInvestments)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-gray-400">Risk Profile</span>
            <p className="text-sm font-semibold text-amber-400 capitalize mt-0.5">{riskProfile}</p>
          </div>
        </div>
      </div>

      {isLoadingAll ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-card bg-card animate-pulse border border-border" />
            ))}
          </div>
          <div className="h-64 rounded-card bg-card animate-pulse border border-border" />
        </div>
      ) : goals.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="No financial goals created yet"
            description="Create your first goal (House, Car, Education, Retirement) to unlock AI-driven completion predictions and contribution tracking."
          />
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={handleOpenCreateModal} className="gap-2">
              <Plus size={16} />
              Create Your First Goal
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1 — GOALS GRID & SELECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#14181C]">Your Financial Goals</h2>
              <span className="text-xs text-muted">{goals.length} active {goals.length === 1 ? "goal" : "goals"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((g) => {
                const isSelected = activeGoal?.id === g.id;
                const IconComponent = getGoalIcon(g.goal_type);
                const typeColor = getGoalTypeColor(g.goal_type);
                const remaining = Math.max(g.target_amount - g.current_amount, 0);
                const progressPct = g.target_amount > 0 ? Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100) : 0;
                const isAchieved = g.current_amount >= g.target_amount && g.target_amount > 0;

                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className={`group relative rounded-card border p-5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-white shadow-card-hover ring-2 ring-primary/20"
                        : "border-border bg-white hover:border-primary/40 hover:shadow-card"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${typeColor}`}>
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#14181C] text-sm group-hover:text-primary transition-colors">
                            {g.goal_name}
                          </h3>
                          <span className="text-[11px] text-muted capitalize">
                            {g.goal_type?.replace("_", " ") || "Custom"} • {g.priority || "Medium"} Priority
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(g);
                          }}
                          className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-[#14181C] transition-colors"
                          title="Edit Goal"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingGoalId(g.id);
                          }}
                          className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted">Target: <strong className="text-[#14181C]">{formatAmount(g.target_amount)}</strong></span>
                        <span className="font-semibold text-primary-dark">{progressPct}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isAchieved
                              ? "bg-emerald-500"
                              : progressPct >= 70
                              ? "bg-primary"
                              : progressPct >= 40
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                        <span>Savings: <strong className="text-emerald-700">{formatAmount(g.current_amount)}</strong></span>
                        <span>Remaining: <strong className="text-rose-600">{formatAmount(remaining)}</strong></span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                      <span className="text-[11px] text-muted">
                        Target: {g.target_date ? new Date(g.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Flexible"}
                      </span>

                      {isAchieved ? (
                        <Badge tone="success" className="gap-1">
                          <CheckCircle2 size={12} /> Achieved
                        </Badge>
                      ) : progressPct >= 60 ? (
                        <Badge tone="success" className="gap-1">
                          <TrendingUp size={12} /> On Track
                        </Badge>
                      ) : progressPct >= 30 ? (
                        <Badge tone="warning" className="gap-1">
                          <Clock size={12} /> In Progress
                        </Badge>
                      ) : (
                        <Badge tone="neutral" className="gap-1">
                          <AlertTriangle size={12} /> Needs Attention
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE GOAL DETAILED METRICS & AI RECOMMENDATION */}
          {activeGoal && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SECTION 3 — AI GOAL RECOMMENDATION CARD */}
              <div className="lg:col-span-2 space-y-6">
                <div className="relative overflow-hidden rounded-card border border-primary/20 bg-gradient-to-br from-[#191E1C] via-[#1c2623] to-[#121614] p-6 text-white shadow-card-hover">
                  <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-base">AI Goal Intelligence</h3>
                          <Badge tone="primary" className="bg-primary/20 text-primary-light border border-primary/30">
                            {prediction?.ai_confidence ? `${prediction.ai_confidence}% Confidence` : "Active AI"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          Automated analysis based on your Financial Profile & surplus cash flow.
                        </p>
                      </div>
                    </div>
                  </div>

                  {isPredictionLoading ? (
                    <div className="space-y-3 py-4">
                      <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
                    </div>
                  ) : prediction ? (
                    <div className="space-y-4">
                      {/* Formatted Recommendation Text */}
                      <div className="rounded-xl bg-white/5 p-4 border border-white/10 text-xs text-gray-200 leading-relaxed whitespace-pre-line">
                        {prediction.recommendation}
                      </div>

                      {/* AI Key Insights Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                          <span className="text-[11px] text-gray-400">Required Savings</span>
                          <p className="text-sm font-semibold text-primary-light mt-0.5">
                            {formatAmount(prediction.required_monthly_savings)}/mo
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                          <span className="text-[11px] text-gray-400">Success Probability</span>
                          <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                            {prediction.success_probability}%
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                          <span className="text-[11px] text-gray-400">Est. Completion</span>
                          <p className="text-sm font-semibold text-cyan-400 mt-0.5">
                            {prediction.predicted_completion_date
                              ? new Date(prediction.predicted_completion_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                              : "N/A"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                          <span className="text-[11px] text-gray-400">Suggested Increase</span>
                          <p className="text-sm font-semibold text-amber-400 mt-0.5">
                            {prediction.suggested_savings_increase > 0
                              ? `+${formatAmount(prediction.suggested_savings_increase)}/mo`
                              : "Optimal"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-4">Generating AI financial recommendation...</p>
                  )}
                </div>

                {/* SECTION 4 — MONTHLY CONTRIBUTION & QUICK ADD */}
                <div className="rounded-card border border-border bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Zap size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#14181C] text-sm">Add Savings Contribution</h3>
                        <p className="text-xs text-muted">Contribute to &quot;{activeGoal.goal_name}&quot; to update progress in real time.</p>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Surplus: {formatAmount(monthlySurplus)}/mo
                    </span>
                  </div>

                  {/* Contribution Quick Buttons */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted font-medium mb-1.5 block">Quick Add Preset Contribution:</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[1000, 5000, 10000].map((amt) => (
                          <button
                            key={amt}
                            disabled={isContributing}
                            onClick={() => handleAddContribution(amt)}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-[#14181C] hover:border-primary hover:bg-primary/10 hover:text-primary-dark transition-all disabled:opacity-50"
                          >
                            <PlusCircle size={14} className="text-primary" />
                            +{formatAmount(amt)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Contribution Input */}
                    <div className="pt-2">
                      <label className="text-xs text-muted font-medium mb-1.5 block">Or Custom Contribution Amount:</label>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top.1/2 top-2.5 text-xs text-muted">₹</span>
                          <Input
                            type="number"
                            placeholder="Enter custom amount"
                            value={customContrib}
                            onChange={(e) => setCustomContrib(e.target.value)}
                            className="pl-7"
                          />
                        </div>
                        <Button
                          variant="primary"
                          disabled={isContributing || !customContrib || Number(customContrib) <= 0}
                          onClick={() => handleAddContribution(Number(customContrib))}
                          className="gap-2"
                        >
                          {isContributing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                          Add Contribution
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5 — GOAL HEALTH & PREDICTION SIDEBAR */}
              <div className="space-y-6">
                <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <h3 className="font-semibold text-[#14181C] text-sm flex items-center gap-2">
                      <Activity size={16} className="text-primary" />
                      Goal Health & Metrics
                    </h3>

                    {prediction?.risk_level === "low" ? (
                      <Badge tone="success" className="gap-1">🟢 On Track</Badge>
                    ) : prediction?.risk_level === "medium" ? (
                      <Badge tone="warning" className="gap-1">🟡 Needs Attention</Badge>
                    ) : (
                      <Badge tone="danger" className="gap-1">🔴 High Risk</Badge>
                    )}
                  </div>

                  {/* Health Score Metric */}
                  <div className="text-center py-2 bg-surface rounded-xl p-4 border border-border/60">
                    <span className="text-xs text-muted uppercase tracking-wider font-medium block">Goal Health Score</span>
                    <div className="text-3xl font-bold text-primary-dark mt-1">
                      {prediction?.health_score || 0}
                      <span className="text-sm text-muted font-normal"> / 100</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          (prediction?.health_score || 0) >= 70
                            ? "bg-emerald-500"
                            : (prediction?.health_score || 0) >= 40
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${prediction?.health_score || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted">Target Amount</span>
                      <strong className="text-[#14181C]">{formatAmount(activeGoal.target_amount)}</strong>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted">Current Savings</span>
                      <strong className="text-emerald-700">{formatAmount(activeGoal.current_amount)}</strong>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted">Remaining Balance</span>
                      <strong className="text-rose-600">{formatAmount(Math.max(activeGoal.target_amount - activeGoal.current_amount, 0))}</strong>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted">Required Monthly</span>
                      <strong className="text-primary-dark">{formatAmount(prediction?.required_monthly_savings || 0)}</strong>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted">Predicted Date</span>
                      <strong className="text-[#14181C]">
                        {prediction?.predicted_completion_date
                          ? new Date(prediction.predicted_completion_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : "Flexible"}
                      </strong>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-muted">AI Success Probability</span>
                      <strong className="text-emerald-600">{prediction?.success_probability || 0}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2 — CREATE / EDIT GOAL MODAL */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? "Edit Goal Details" : "Create New Financial Goal"}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
              Goal Name
            </label>
            <Input
              placeholder="e.g. House Down Payment, New SUV, Retirement Corpus"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1.5 block">
              Goal Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOAL_TYPES.map((gt) => {
                const Icon = gt.icon;
                const isSelected = formType === gt.id;
                return (
                  <button
                    key={gt.id}
                    type="button"
                    onClick={() => setFormType(gt.id)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary-dark ring-1 ring-primary"
                        : "border-border bg-white text-[#14181C] hover:bg-surface"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{gt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Target Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="e.g. 5000000"
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
                Target Date
              </label>
              <Input
                type="date"
                value={formTargetDate}
                onChange={(e) => setFormTargetDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#14181C] uppercase tracking-wider mb-1 block">
              Priority
            </label>
            <select
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm text-[#14181C] focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isCreating || isUpdating} className="gap-2">
              {isCreating || isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Target size={16} />}
              {editingGoal ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRMATION DIALOG FOR DELETE */}
      <ConfirmationDialog
        open={Boolean(deletingGoalId)}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Financial Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
      />
    </DashboardShell>
  );
}
