"use client";

import React, { useState, useMemo } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { EmptyState } from "@/components/cards/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useDashboard } from "@/hooks/useDashboard";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { useLoans } from "@/hooks/useLoans";
import { useInvestments } from "@/hooks/useInvestments";
import { useLifeEvents } from "@/hooks/useLifeEvents";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Home,
  Car,
  Heart,
  Baby,
  Briefcase,
  AlertTriangle,
  Sparkles,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  PieChart as PieIcon,
  Calculator,
  ArrowRight,
  Info,
  Building2,
  PiggyBank,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

interface PredefinedEvent {
  id: string;
  title: string;
  category: "income" | "expense" | "asset" | "liability" | "shock";
  icon: any;
  description: string;
  defaultInputs: {
    incomeDeltaMonthly?: number;
    expenseDeltaMonthly?: number;
    lumpSumExpense?: number;
    assetValueAdd?: number;
    newLoanPrincipal?: number;
    newLoanInterestRate?: number;
    newLoanTenureYears?: number;
    incomePauseMonths?: number;
  };
}

const PREDEFINED_EVENTS: PredefinedEvent[] = [
  {
    id: "salary_raise",
    title: "Salary Raise / Bonus",
    category: "income",
    icon: TrendingUp,
    description: "Promoted or received a salary hike / new income source.",
    defaultInputs: { incomeDeltaMonthly: 25000 },
  },
  {
    id: "buy_house",
    title: "Buying a House",
    category: "liability",
    icon: Home,
    description: "Purchase property with a down payment and home loan.",
    defaultInputs: {
      lumpSumExpense: 1000000, // ₹10L down payment
      assetValueAdd: 5000000, // ₹50L property value
      newLoanPrincipal: 4000000, // ₹40L home loan
      newLoanInterestRate: 8.5,
      newLoanTenureYears: 20,
    },
  },
  {
    id: "buy_car",
    title: "Buying a Vehicle",
    category: "liability",
    icon: Car,
    description: "Purchase a car or vehicle with down payment and auto loan.",
    defaultInputs: {
      lumpSumExpense: 200000, // ₹2L down payment
      assetValueAdd: 1000000, // ₹10L car value
      newLoanPrincipal: 800000, // ₹8L loan
      newLoanInterestRate: 9.5,
      newLoanTenureYears: 5,
    },
  },
  {
    id: "marriage",
    title: "Wedding / Marriage",
    category: "expense",
    icon: Heart,
    description: "Lump sum wedding expenses & lifestyle adjustments.",
    defaultInputs: {
      lumpSumExpense: 800000,
      expenseDeltaMonthly: 5000,
    },
  },
  {
    id: "having_child",
    title: "Having a Child",
    category: "expense",
    icon: Baby,
    description: "Medical costs, infant care, and recurring childcare expenses.",
    defaultInputs: {
      lumpSumExpense: 150000,
      expenseDeltaMonthly: 15000,
    },
  },
  {
    id: "job_loss",
    title: "Job Loss / Sabbatical",
    category: "shock",
    icon: AlertTriangle,
    description: "Temporary income interruption for 3–12 months.",
    defaultInputs: {
      incomePauseMonths: 6,
    },
  },
  {
    id: "start_business",
    title: "Starting a Business",
    category: "asset",
    icon: Briefcase,
    description: "Invest seed capital to launch a business venture.",
    defaultInputs: {
      lumpSumExpense: 500000,
      incomeDeltaMonthly: 15000,
    },
  },
];

function formatINR(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
}

function calculateEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (!principal || principal <= 0 || !tenureYears || tenureYears <= 0) return 0;
  const monthlyRate = (annualRate || 8.5) / 12 / 100;
  const months = tenureYears * 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return isNaN(emi) ? 0 : Math.round(emi);
}

export default function LifeEventsPage() {
  const toast = useToast();
  const { summary } = useDashboard();
  const { profile } = useFinancialProfile();
  const { incomeSources } = useIncome();
  const { expenses } = useExpenses();
  const { assets } = useAssets();
  const { loans } = useLoans();
  const { investments } = useInvestments();
  const { simulations, createSimulation, deleteSimulation, isCreating } = useLifeEvents();

  // Selected Event & Parameters State
  const [selectedEventId, setSelectedEventId] = useState<string>("salary_raise");
  const [inputs, setInputs] = useState<Record<string, any>>(PREDEFINED_EVENTS[0].defaultInputs);
  const [customTitle, setCustomTitle] = useState("");

  const activePredefinedEvent = useMemo(() => {
    return PREDEFINED_EVENTS.find((e) => e.id === selectedEventId);
  }, [selectedEventId]);

  const handleSelectEvent = (event: PredefinedEvent) => {
    setSelectedEventId(event.id);
    setInputs(event.defaultInputs);
  };

  // Base Portfolio Aggregations directly from User Profile & Financial Entries
  const baseMonthlyIncome = useMemo(() => {
    if (incomeSources && incomeSources.length > 0) {
      return incomeSources.reduce((acc, item) => acc + (item.monthly_amount || 0), 0);
    }
    return profile?.monthly_income || summary?.monthly_income || 100000;
  }, [incomeSources, profile, summary]);

  const baseMonthlyExpenses = useMemo(() => {
    if (expenses && expenses.length > 0) {
      return expenses.reduce((acc, item) => {
        const amt = item.amount || 0;
        if (item.frequency === "annual") return acc + amt / 12;
        if (item.frequency === "weekly") return acc + amt * 4.33;
        return acc + amt;
      }, 0);
    }
    return profile?.monthly_expenses || summary?.monthly_expenses || 45000;
  }, [expenses, profile, summary]);

  const baseExistingEMIs = useMemo(() => {
    if (loans && loans.length > 0) {
      return loans.reduce((acc, l) => acc + (l.emi || 0), 0);
    }
    return 0;
  }, [loans]);

  const baseTotalAssets = useMemo(() => {
    const assetSum = (assets || []).reduce((acc, a) => acc + (a.valuation || 0), 0);
    const invSum = (investments || []).reduce((acc, i) => {
      const val = i.current_value || (i.quantity || 1) * (i.current_price || i.purchase_price || 0);
      return acc + val;
    }, 0);
    return Math.max(assetSum + invSum, profile?.total_assets || summary?.total_assets || 1500000);
  }, [assets, investments, profile, summary]);

  const baseTotalLiabilities = useMemo(() => {
    if (loans && loans.length > 0) {
      return loans.reduce((acc, l) => acc + (l.outstanding_amount || l.principal_amount || 0), 0);
    }
    return profile?.total_liabilities || summary?.total_liabilities || 0;
  }, [loans, profile, summary]);

  const baseLiquidCash = useMemo(() => {
    const cashAssets = (assets || [])
      .filter((a) => ["cash", "savings", "emergency cash", "bank"].some((t) => (a.asset_type || "").toLowerCase().includes(t)))
      .reduce((acc, a) => acc + (a.valuation || 0), 0);
    return Math.max(cashAssets, profile?.emergency_fund || profile?.savings || 250000);
  }, [assets, profile]);

  // Simulation Calculations
  const simulationResult = useMemo(() => {
    const incDelta = parseFloat(inputs.incomeDeltaMonthly || 0);
    const expDelta = parseFloat(inputs.expenseDeltaMonthly || 0);
    const lumpSum = parseFloat(inputs.lumpSumExpense || 0);
    const assetAdd = parseFloat(inputs.assetValueAdd || 0);
    const newLoanP = parseFloat(inputs.newLoanPrincipal || 0);
    const newLoanRate = parseFloat(inputs.newLoanInterestRate || 8.5);
    const newLoanTenure = parseFloat(inputs.newLoanTenureYears || 15);
    const pauseMonths = parseFloat(inputs.incomePauseMonths || 0);

    const newLoanEMI = calculateEMI(newLoanP, newLoanRate, newLoanTenure);

    // Simulated Monthly Figures
    let simIncome = baseMonthlyIncome;
    if (pauseMonths > 0) {
      simIncome = 0; // Income paused
    } else {
      simIncome = Math.max(0, baseMonthlyIncome + incDelta);
    }

    const simExpenses = Math.max(0, baseMonthlyExpenses + expDelta);
    const simTotalEMIs = baseExistingEMIs + newLoanEMI;
    const simTotalOutflow = simExpenses + simTotalEMIs;

    // Monthly Surplus / Cashflow
    const baseSurplus = baseMonthlyIncome - baseMonthlyExpenses - baseExistingEMIs;
    const simSurplus = simIncome - simTotalOutflow;
    const cashflowDelta = simSurplus - baseSurplus;

    // Assets & Liabilities Impact
    const simTotalAssets = Math.max(0, baseTotalAssets - lumpSum + assetAdd);
    const simTotalLiabilities = baseTotalLiabilities + newLoanP;
    const baseNetWorth = baseTotalAssets - baseTotalLiabilities;
    const simNetWorth = simTotalAssets - simTotalLiabilities;
    const netWorthDelta = simNetWorth - baseNetWorth;

    // Liquid Cash & Emergency Fund Runway
    const simLiquidCash = Math.max(0, baseLiquidCash - lumpSum);
    const monthlyBurn = simTotalOutflow > 0 ? simTotalOutflow : 1;
    const baseRunwayMonths = Math.round((baseLiquidCash / (baseMonthlyExpenses + baseExistingEMIs || 1)) * 10) / 10;
    const simRunwayMonths = Math.round((simLiquidCash / monthlyBurn) * 10) / 10;

    // Debt-To-Income (DTI)
    const baseDTI = baseMonthlyIncome > 0 ? Math.round((baseExistingEMIs / baseMonthlyIncome) * 100) : 0;
    const simDTI = simIncome > 0 ? Math.round((simTotalEMIs / simIncome) * 100) : 100;

    // Health Score Shift
    let scoreShift = 0;
    if (simSurplus > baseSurplus) scoreShift += 8;
    if (simSurplus < 0) scoreShift -= 18;
    if (simDTI > 50) scoreShift -= 15;
    if (simRunwayMonths < 3) scoreShift -= 12;
    if (simRunwayMonths >= 6) scoreShift += 6;
    if (netWorthDelta > 0) scoreShift += 10;

    const baseHealthScore = summary?.financial_health_score || 75;
    const simHealthScore = Math.max(10, Math.min(100, baseHealthScore + scoreShift));

    // Recommendations Engine
    const recommendations: string[] = [];
    if (simSurplus < 0) {
      recommendations.push(
        `🚨 Projected monthly deficit of ${formatINR(Math.abs(simSurplus))}. Trim non-essential expenses immediately or extend savings runway.`
      );
    }
    if (simDTI > 45) {
      recommendations.push(
        `⚠️ Debt-To-Income ratio exceeds 45% (${simDTI}%). Consider making a higher down payment to reduce loan EMI.`
      );
    }
    if (simRunwayMonths < 4) {
      recommendations.push(
        `🛡️ Emergency fund runway drops to ${simRunwayMonths} months. Save an extra ${formatINR(monthlyBurn * 4 - simLiquidCash)} before initiating event.`
      );
    }
    if (newLoanP > 0) {
      recommendations.push(
        `📄 Enhance Term Life Insurance coverage by at least ${formatINR(newLoanP)} to insulate dependents from loan liability.`
      );
    }
    if (simSurplus > 20000) {
      recommendations.push(
        `📈 Monthly surplus increases by ${formatINR(simSurplus - baseSurplus)}. Channel ${formatINR(simSurplus * 0.6)} into equity index funds/SIPs.`
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        `✅ Your financial profile remains robust post-event. Maintain active investments and quarterly rebalancing.`
      );
    }

    return {
      baseMonthlyIncome,
      baseMonthlyExpenses,
      baseExistingEMIs,
      baseSurplus,
      baseNetWorth,
      baseRunwayMonths,
      baseDTI,
      baseHealthScore,
      simIncome,
      simExpenses,
      simTotalEMIs,
      newLoanEMI,
      simSurplus,
      cashflowDelta,
      simTotalAssets,
      simTotalLiabilities,
      simNetWorth,
      netWorthDelta,
      simLiquidCash,
      simRunwayMonths,
      simDTI,
      simHealthScore,
      scoreShift,
      recommendations,
    };
  }, [inputs, baseMonthlyIncome, baseMonthlyExpenses, baseExistingEMIs, baseTotalAssets, baseTotalLiabilities, baseLiquidCash, summary]);

  const handleSaveSimulation = async () => {
    try {
      const eventName = activePredefinedEvent ? activePredefinedEvent.title : customTitle || "Custom Life Event";
      await createSimulation({
        event_type: eventName,
        input_data: inputs,
        ai_result: simulationResult,
      });
      toast.success(`Simulation for "${eventName}" saved to history!`, "Simulation Saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save simulation.", "Error");
    }
  };

  const handleDeleteSimulation = async (id: string, name: string) => {
    try {
      await deleteSimulation(id);
      toast.info(`Deleted "${name}" simulation from history.`, "Deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete simulation.", "Error");
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Life Event Simulator"
        subtitle="Simulate major life milestones and stress-test their impact against your live financial portfolio."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Life Event Simulator" }]}
      />

      {/* READ-ONLY LIVE PORTFOLIO AUTO-SYNC BANNER */}
      <div className="mb-6 rounded-card border border-border bg-gradient-to-r from-[#191E1C] via-[#1E2723] to-[#191E1C] p-5 text-white shadow-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary-light">
              <Calculator size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-light">
                  Portfolio Engine Active
                </span>
                <Badge tone="primary" className="bg-primary/20 text-primary-light border border-primary/30 text-[10px]">
                  Live Portfolio Sync
                </Badge>
              </div>
              <h2 className="text-base font-semibold text-white mt-0.5">
                Stress-Test Life Decisions Against Your Net Worth
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Auto-calculated using your verified income ({formatINR(baseMonthlyIncome)}/mo), expenses, loans & assets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">CURRENT NET WORTH</span>
              <strong className="text-emerald-400 font-semibold text-sm">{formatINR(simulationResult.baseNetWorth)}</strong>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-gray-400 block text-[10px]">SAVINGS RUNWAY</span>
              <strong className="text-cyan-400 font-semibold text-sm">{simulationResult.baseRunwayMonths} Mo</strong>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT LIFE EVENT */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> Select a Life Event Scenario
          </h3>
          <span className="text-xs text-muted">Choose a event to configure inputs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {PREDEFINED_EVENTS.map((event) => {
            const Icon = event.icon;
            const isSelected = selectedEventId === event.id;
            return (
              <button
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className={`flex flex-col items-center text-center p-3.5 rounded-card border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary-dark shadow-md ring-2 ring-primary/20"
                    : "border-border bg-white text-gray-700 hover:border-gray-300 hover:bg-surface"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl mb-2 transition-colors ${
                    isSelected ? "bg-primary text-white" : "bg-surface text-muted"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold line-clamp-1">{event.title}</span>
                <span className="text-[10px] text-muted mt-0.5 line-clamp-1">{event.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: CONFIGURE EVENT PARAMETERS & SIMULATION PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* LEFT COLUMN: PARAMETER INPUT FORM */}
        <div className="lg:col-span-5 rounded-card border border-border bg-white p-5 shadow-card space-y-5">
          <div className="border-b border-border/60 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#14181C] flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" /> Configure Event Parameters
            </h4>
            <Badge tone="primary" className="text-[10px] capitalize">
              {activePredefinedEvent?.category || "custom"}
            </Badge>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            {activePredefinedEvent?.description} Adjust numbers below to see instant impact.
          </p>

          <div className="space-y-4 text-xs">
            {/* Income Delta */}
            {selectedEventId !== "job_loss" && (
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Monthly Income Change (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 25000 for increase, -5000 for reduction"
                  value={inputs.incomeDeltaMonthly ?? ""}
                  onChange={(e) => setInputs({ ...inputs, incomeDeltaMonthly: parseFloat(e.target.value) || 0 })}
                />
                <span className="text-[10px] text-muted mt-1 block">Positive for salary raise/side income, negative for pay cuts</span>
              </div>
            )}

            {/* Income Pause Months (Job Loss) */}
            {selectedEventId === "job_loss" && (
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Income Interruption Duration (Months)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={inputs.incomePauseMonths ?? 6}
                  onChange={(e) => setInputs({ ...inputs, incomePauseMonths: parseInt(e.target.value) || 1 })}
                />
                <span className="text-[10px] text-muted mt-1 block">Number of months your salary will stop</span>
              </div>
            )}

            {/* Recurring Expense Delta */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Additional Monthly Expense (₹)
              </label>
              <Input
                type="number"
                placeholder="e.g. 15000 for new child care, rent boost"
                value={inputs.expenseDeltaMonthly ?? ""}
                onChange={(e) => setInputs({ ...inputs, expenseDeltaMonthly: parseFloat(e.target.value) || 0 })}
              />
              <span className="text-[10px] text-muted mt-1 block">New ongoing lifestyle expenses per month</span>
            </div>

            {/* Lump Sum Expense / Down Payment */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                One-Time Lump Sum Outflow / Down Payment (₹)
              </label>
              <Input
                type="number"
                placeholder="e.g. 1000000 for house down payment"
                value={inputs.lumpSumExpense ?? ""}
                onChange={(e) => setInputs({ ...inputs, lumpSumExpense: parseFloat(e.target.value) || 0 })}
              />
              <span className="text-[10px] text-muted mt-1 block">Initial cash payment from bank balance</span>
            </div>

            {/* Asset Value Add */}
            {(selectedEventId === "buy_house" || selectedEventId === "buy_car" || selectedEventId === "start_business") && (
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  New Acquired Asset Valuation (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 5000000 property value"
                  value={inputs.assetValueAdd ?? ""}
                  onChange={(e) => setInputs({ ...inputs, assetValueAdd: parseFloat(e.target.value) || 0 })}
                />
                <span className="text-[10px] text-muted mt-1 block">Value of property/vehicle added to net worth</span>
              </div>
            )}

            {/* New Loan Details */}
            {(selectedEventId === "buy_house" || selectedEventId === "buy_car") && (
              <div className="rounded-xl bg-surface p-3.5 border border-border/60 space-y-3">
                <span className="font-semibold text-xs text-[#14181C] block">New Loan Configuration</span>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Loan Principal (₹)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 4000000"
                    value={inputs.newLoanPrincipal ?? ""}
                    onChange={(e) => setInputs({ ...inputs, newLoanPrincipal: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={inputs.newLoanInterestRate ?? 8.5}
                      onChange={(e) => setInputs({ ...inputs, newLoanInterestRate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Tenure (Years)</label>
                    <Input
                      type="number"
                      value={inputs.newLoanTenureYears ?? 20}
                      onChange={(e) => setInputs({ ...inputs, newLoanTenureYears: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                {inputs.newLoanPrincipal > 0 && (
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 font-medium">
                    <span className="text-muted">Calculated EMI:</span>
                    <strong className="text-primary-dark">{formatINR(simulationResult.newLoanEMI)}/mo</strong>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleSaveSimulation}
              disabled={isCreating}
              className="w-full gap-2 mt-2"
            >
              <Play size={16} /> Save Simulation to History
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME FINANCIAL IMPACT DASHBOARD */}
        <div className="lg:col-span-7 space-y-5">
          {/* IMPACT HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly Surplus Impact */}
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <span className="text-xs text-muted font-medium block mb-1">Monthly Cashflow Surplus</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${simulationResult.simSurplus >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                  {formatINR(simulationResult.simSurplus)}
                </span>
                <span className={`text-xs font-semibold flex items-center ${simulationResult.cashflowDelta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {simulationResult.cashflowDelta >= 0 ? "+" : ""}{formatINR(simulationResult.cashflowDelta)}
                </span>
              </div>
              <span className="text-[11px] text-muted mt-1 block">
                Original: {formatINR(simulationResult.baseSurplus)}/mo
              </span>
            </div>

            {/* Net Worth Impact */}
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <span className="text-xs text-muted font-medium block mb-1">Projected Net Worth</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-[#14181C]">
                  {formatINR(simulationResult.simNetWorth)}
                </span>
                <span className={`text-xs font-semibold ${simulationResult.netWorthDelta >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {simulationResult.netWorthDelta >= 0 ? "+" : ""}{formatINR(simulationResult.netWorthDelta)}
                </span>
              </div>
              <span className="text-[11px] text-muted mt-1 block">
                Assets - Liabilities post-event
              </span>
            </div>

            {/* Savings Runway */}
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <span className="text-xs text-muted font-medium block mb-1">Emergency Cash Runway</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${simulationResult.simRunwayMonths >= 6 ? "text-emerald-700" : simulationResult.simRunwayMonths >= 3 ? "text-amber-600" : "text-rose-600"}`}>
                  {simulationResult.simRunwayMonths} Months
                </span>
              </div>
              <span className="text-[11px] text-muted mt-1 block">
                Liquid Cash: {formatINR(simulationResult.simLiquidCash)}
              </span>
            </div>
          </div>

          {/* BEFORE VS AFTER DETAILED BREAKDOWN TABLE */}
          <div className="rounded-card border border-border bg-white p-5 shadow-card space-y-4">
            <h4 className="text-sm font-semibold text-[#14181C] flex items-center gap-2 border-b border-border/60 pb-3">
              <PieIcon size={16} className="text-primary" /> Portfolio Comparison Matrix (Before vs After)
            </h4>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface/60 text-muted font-semibold">
                    <th className="py-2.5 px-3">Financial Metric</th>
                    <th className="py-2.5 px-3">Current Baseline</th>
                    <th className="py-2.5 px-3">Simulated Post-Event</th>
                    <th className="py-2.5 px-3 text-right">Net Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-gray-800">Monthly Income</td>
                    <td className="py-2.5 px-3 text-gray-600">{formatINR(simulationResult.baseMonthlyIncome)}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#14181C]">{formatINR(simulationResult.simIncome)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                      {simulationResult.simIncome - simulationResult.baseMonthlyIncome >= 0 ? "+" : ""}
                      {formatINR(simulationResult.simIncome - simulationResult.baseMonthlyIncome)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium text-gray-800">Living Expenses + EMIs</td>
                    <td className="py-2.5 px-3 text-gray-600">{formatINR(simulationResult.baseMonthlyExpenses + simulationResult.baseExistingEMIs)}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#14181C]">{formatINR(simulationResult.simExpenses + simulationResult.simTotalEMIs)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-rose-600">
                      +{formatINR(simulationResult.simExpenses + simulationResult.simTotalEMIs - (simulationResult.baseMonthlyExpenses + simulationResult.baseExistingEMIs))}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium text-gray-800">Debt-To-Income (DTI) Ratio</td>
                    <td className="py-2.5 px-3 text-gray-600">{simulationResult.baseDTI}%</td>
                    <td className="py-2.5 px-3 font-semibold text-[#14181C]">{simulationResult.simDTI}%</td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${simulationResult.simDTI <= 40 ? "text-emerald-600" : "text-rose-600"}`}>
                      {simulationResult.simDTI - simulationResult.baseDTI >= 0 ? "+" : ""}
                      {simulationResult.simDTI - simulationResult.baseDTI}%
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium text-gray-800">Financial Health Score</td>
                    <td className="py-2.5 px-3 text-gray-600">{simulationResult.baseHealthScore}/100</td>
                    <td className="py-2.5 px-3 font-semibold text-primary-dark">{simulationResult.simHealthScore}/100</td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${simulationResult.scoreShift >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {simulationResult.scoreShift >= 0 ? "+" : ""}{simulationResult.scoreShift} pts
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* DETERMINISTIC AI-POWERED ACTION PLAN */}
          <div className="rounded-card border border-border bg-white p-5 shadow-card space-y-3">
            <h4 className="text-sm font-semibold text-[#14181C] flex items-center gap-2 border-b border-border/60 pb-3">
              <Zap size={16} className="text-amber-500" /> Recommended Action Plan & Next Steps
            </h4>

            <div className="space-y-2 text-xs">
              {simulationResult.recommendations.map((rec, idx) => (
                <div key={idx} className="rounded-xl bg-surface p-3 border border-border/50 flex items-start gap-2.5">
                  <span className="text-base">{rec.slice(0, 2)}</span>
                  <span className="text-gray-800 leading-relaxed font-medium">{rec.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 3: SIMULATION HISTORY LOGS */}
      <div className="rounded-card border border-border bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-base font-semibold text-[#14181C] flex items-center gap-2">
            <Clock size={18} className="text-primary" /> Saved Event Simulations ({simulations.length})
          </h3>
          <span className="text-xs text-muted">Past simulated milestones saved to your account</span>
        </div>

        {simulations.length === 0 ? (
          <EmptyState
            title="No saved simulations yet"
            description="Configure a scenario above and click 'Save Simulation to History' to track your stress-tested events."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {simulations.map((sim) => (
              <div
                key={sim.id}
                className="rounded-xl border border-border bg-surface/50 p-4 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone="primary" className="text-[10px]">
                      {sim.event_type}
                    </Badge>
                    <span className="text-[10px] text-muted">
                      {new Date(sim.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {sim.ai_result && (
                    <div className="space-y-1.5 my-3 bg-white p-3 rounded-lg border border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Simulated Cashflow:</span>
                        <strong className={sim.ai_result.simSurplus >= 0 ? "text-emerald-700" : "text-rose-600"}>
                          {formatINR(sim.ai_result.simSurplus)}/mo
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Runway:</span>
                        <strong className="text-cyan-700">{sim.ai_result.simRunwayMonths} Months</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted">Health Score:</span>
                        <strong className="text-primary-dark">{sim.ai_result.simHealthScore}/100</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[10px] text-muted">ID: {sim.id.slice(0, 8)}...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSimulation(sim.id, sim.event_type)}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
