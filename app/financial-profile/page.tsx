"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { useInvestments } from "@/hooks/useInvestments";
import { useLoans } from "@/hooks/useLoans";
import { useInsurancePolicies } from "@/hooks/useInsurancePolicies";
import {
  User,
  DollarSign,
  Receipt,
  Landmark,
  TrendingUp,
  CreditCard,
  Shield,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle
} from "lucide-react";

export default function FinancialProfilePage() {
  const [activeTab, setActiveTab] = useState<
    "personal" | "income" | "expenses" | "assets" | "investments" | "liabilities" | "insurance" | "preferences"
  >("personal");

  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { profile, updateProfile, isUpdating } = useFinancialProfile();
  const { incomeSources, createIncome, updateIncome, deleteIncome, isCreating: isCreatingIncome } = useIncome();
  const { expenses, createExpense, updateExpense, deleteExpense, isCreating: isCreatingExpense } = useExpenses();
  const { assets, createAsset, updateAsset, deleteAsset } = useAssets();
  const { investments, createInvestment, updateInvestment, deleteInvestment } = useInvestments();
  const { loans, createLoan, updateLoan, deleteLoan } = useLoans();
  const { policies, createPolicy, updatePolicy, deletePolicy } = useInsurancePolicies();

  // Local state for personal profile form
  const [personalForm, setPersonalForm] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    occupation: "",
    marital_status: "",
    state: "",
    city: "",
    avatar_url: "",
  });

  // Local state for preferences form
  const [prefForm, setPrefForm] = useState({
    risk_profile: "moderate",
    currency: "INR",
    investment_goal: "Wealth Growth",
    emergency_fund: 0,
    emergency_fund_goal: 0,
  });

  // Populate local forms when profile loads
  React.useEffect(() => {
    if (profile) {
      setPersonalForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        occupation: profile.occupation || "",
        marital_status: profile.marital_status || "",
        state: profile.state || "",
        city: profile.city || "",
        avatar_url: profile.avatar_url || "",
      });
      setPrefForm({
        risk_profile: profile.risk_profile || "moderate",
        currency: profile.currency || "INR",
        investment_goal: profile.investment_goal || "Wealth Growth",
        emergency_fund: profile.emergency_fund ?? profile.emergency_fund_goal ?? 0,
        emergency_fund_goal: profile.emergency_fund_goal ?? profile.emergency_fund ?? 0,
      });
    }
  }, [profile]);


  // Modal / Form state for CRUD
  const [incomeModal, setIncomeModal] = useState(false);
  const [incomeInput, setIncomeInput] = useState({ source_name: "Salary", monthly_amount: "", frequency: "monthly", notes: "" });
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  const [expenseModal, setExpenseModal] = useState(false);
  const [expenseInput, setExpenseInput] = useState({ category: "Rent", amount: "", frequency: "monthly", notes: "" });
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [assetModal, setAssetModal] = useState(false);
  const [assetInput, setAssetInput] = useState({ asset_name: "", asset_type: "Cash", valuation: "", institution: "", notes: "" });
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  const [investmentModal, setInvestmentModal] = useState(false);
  const [investmentInput, setInvestmentInput] = useState({ asset_name: "", asset_type: "Stocks", quantity: "1", current_price: "", purchase_price: "", platform: "" });
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(null);

  const [loanModal, setLoanModal] = useState(false);
  const [loanInput, setLoanInput] = useState({ loan_type: "Home Loan", lender: "", principal_amount: "", outstanding_amount: "", interest_rate: "", emi: "", tenure: "" });
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);

  const [policyModal, setPolicyModal] = useState(false);
  const [policyInput, setPolicyInput] = useState({ provider: "", policy_name: "", policy_type: "Health", coverage_amount: "", premium: "", renewal_date: "" });
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  // Delete Confirmation Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: "income" | "expense" | "asset" | "investment" | "loan" | "policy"; name: string } | null>(null);

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === "income") await deleteIncome(deleteConfirm.id);
      else if (deleteConfirm.type === "expense") await deleteExpense(deleteConfirm.id);
      else if (deleteConfirm.type === "asset") await deleteAsset(deleteConfirm.id);
      else if (deleteConfirm.type === "investment") await deleteInvestment(deleteConfirm.id);
      else if (deleteConfirm.type === "loan") await deleteLoan(deleteConfirm.id);
      else if (deleteConfirm.type === "policy") await deletePolicy(deleteConfirm.id);
      showToast(`${deleteConfirm.name} deleted successfully!`);
    } catch (err: any) {
      showToast(err.message || "Failed to delete item", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Profile Save Handlers
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(personalForm);
      showToast("Personal profile updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile", "error");
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(prefForm);
      showToast("Preferences updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update preferences", "error");
    }
  };

  // Income Handlers
  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        source_name: incomeInput.source_name,
        monthly_amount: parseFloat(incomeInput.monthly_amount) || 0,
        frequency: incomeInput.frequency,
        notes: incomeInput.notes,
      };
      if (editingIncomeId) {
        await updateIncome({ id: editingIncomeId, data: payload });
        showToast("Income source updated");
      } else {
        await createIncome(payload);
        showToast("Income source added");
      }
      setIncomeModal(false);
      setEditingIncomeId(null);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Expense Handlers
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        category: expenseInput.category,
        amount: parseFloat(expenseInput.amount) || 0,
        frequency: expenseInput.frequency,
        notes: expenseInput.notes,
      };
      if (editingExpenseId) {
        await updateExpense({ id: editingExpenseId, data: payload });
        showToast("Expense updated");
      } else {
        await createExpense(payload);
        showToast("Expense added");
      }
      setExpenseModal(false);
      setEditingExpenseId(null);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Asset Handlers (Cash, Savings, Gold, Real Estate, Vehicles)
  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        asset_name: assetInput.asset_name,
        asset_type: assetInput.asset_type,
        valuation: parseFloat(assetInput.valuation) || 0,
        institution: assetInput.institution,
        notes: assetInput.notes,
      };
      if (editingAssetId) {
        await updateAsset({ id: editingAssetId, data: payload });
        showToast("Asset updated");
      } else {
        await createAsset(payload);
        showToast("Asset added");
      }
      setAssetModal(false);
      setEditingAssetId(null);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Investment Handlers (Stocks, Mutual Funds, ETFs, Bonds)
  const handleSaveInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        asset_name: investmentInput.asset_name,
        asset_type: investmentInput.asset_type,
        quantity: parseFloat(investmentInput.quantity) || 1,
        purchase_price: parseFloat(investmentInput.purchase_price || investmentInput.current_price) || 0,
        current_price: parseFloat(investmentInput.current_price) || 0,
        platform: investmentInput.platform,
      };
      if (editingInvestmentId) {
        await updateInvestment({ id: editingInvestmentId, data: payload });
        showToast("Investment updated");
      } else {
        await createInvestment(payload);
        showToast("Investment added");
      }
      setInvestmentModal(false);
      setEditingInvestmentId(null);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Loan Handlers
  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        loan_type: loanInput.loan_type,
        lender: loanInput.lender,
        principal_amount: parseFloat(loanInput.principal_amount) || 0,
        outstanding_amount: parseFloat(loanInput.outstanding_amount) || 0,
        interest_rate: parseFloat(loanInput.interest_rate) || 0,
        emi: parseFloat(loanInput.emi) || 0,
        tenure: parseInt(loanInput.tenure) || 0,
      };
      if (editingLoanId) {
        await updateLoan({ id: editingLoanId, data: payload });
        showToast("Liability updated");
      } else {
        await createLoan(payload);
        showToast("Liability added");
      }
      setLoanModal(false);
      setEditingLoanId(null);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  // Policy Handlers
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        provider: policyInput.provider,
        policy_name: policyInput.policy_name,
        policy_type: policyInput.policy_type,
        coverage_amount: parseFloat(policyInput.coverage_amount) || 0,
        premium: parseFloat(policyInput.premium) || 0,
        renewal_date: policyInput.renewal_date || undefined,
      };
      if (editingPolicyId) {
        await updatePolicy({ id: editingPolicyId, payload });
        showToast("Insurance policy updated");
      } else {
        await createPolicy(payload);
        showToast("Insurance policy added");
      }
      setPolicyModal(false);
      setEditingPolicyId(null);
    } catch (err: any) {
      showToast(err.message || "Operation failed", "error");
    }
  };

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "income", label: "Income", icon: DollarSign },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "assets", label: "Assets", icon: Landmark },
    { id: "investments", label: "Investments", icon: TrendingUp },
    { id: "liabilities", label: "Liabilities", icon: CreditCard },
    { id: "insurance", label: "Insurance", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Sliders },
  ] as const;

  return (
    <DashboardShell>
      <PageHeader
        title="Financial Profile"
        subtitle="Manage your personal profile, income, expenses, tangible assets, investments, loans, and preferences."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border text-sm transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/40 text-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-3 mb-6 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary text-white shadow-sm border border-primary"
                  : "bg-white text-gray-700 hover:text-[#14181C] hover:bg-surface border border-border shadow-sm"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Personal */}
      {activeTab === "personal" && (
        <div className="bg-white border border-border rounded-card p-6 shadow-card">
          <h2 className="text-base font-bold text-[#14181C] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Profile Details
          </h2>
          <form onSubmit={handleSavePersonal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Full Name</label>
              <input
                type="text"
                value={personalForm.full_name}
                onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Akshanth N"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={personalForm.phone}
                onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={personalForm.date_of_birth}
                onChange={(e) => setPersonalForm({ ...personalForm, date_of_birth: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Gender</label>
              <select
                value={personalForm.gender}
                onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Occupation</label>
              <input
                type="text"
                value={personalForm.occupation}
                onChange={(e) => setPersonalForm({ ...personalForm, occupation: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Marital Status</label>
              <select
                value={personalForm.marital_status}
                onChange={(e) => setPersonalForm({ ...personalForm, marital_status: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">State / Region</label>
              <input
                type="text"
                value={personalForm.state}
                onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Tamil Nadu"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">City</label>
              <input
                type="text"
                value={personalForm.city}
                onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Chennai"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Avatar Image URL</label>
              <input
                type="url"
                value={personalForm.avatar_url}
                onChange={(e) => setPersonalForm({ ...personalForm, avatar_url: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Personal Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: Income */}
      {activeTab === "income" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Income Sources
            </h2>
            <button
              onClick={() => {
                setEditingIncomeId(null);
                setIncomeInput({ source_name: "Salary", monthly_amount: "", frequency: "monthly", notes: "" });
                setIncomeModal(true);
              }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Income Source</span>
            </button>
          </div>

          <div className="bg-white border border-border rounded-card overflow-hidden shadow-card">
            {incomeSources.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No income sources added yet. Click &quot;Add Income Source&quot; to begin.</div>
            ) : (
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-surface/80 text-gray-800 font-bold uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Source Name</th>
                    <th className="px-4 py-3">Monthly Amount</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {incomeSources.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#14181C]">{item.source_name}</td>
                      <td className="px-4 py-3.5 text-emerald-700 font-bold">₹{Number(item.monthly_amount).toLocaleString()}</td>
                      <td className="px-4 py-3.5 capitalize font-medium text-gray-700">{item.frequency}</td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">{item.notes || "-"}</td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingIncomeId(item.id);
                            setIncomeInput({ source_name: item.source_name, monthly_amount: String(item.monthly_amount), frequency: item.frequency, notes: item.notes || "" });
                            setIncomeModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: item.id, type: "income", name: item.source_name })}
                          className="p-1.5 text-gray-600 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Expenses */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              Monthly Expenses
            </h2>
            <button
              onClick={() => {
                setEditingExpenseId(null);
                setExpenseInput({ category: "Rent", amount: "", frequency: "monthly", notes: "" });
                setExpenseModal(true);
              }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="bg-white border border-border rounded-card overflow-hidden shadow-card">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No expenses recorded yet. Click &quot;Add Expense&quot; to manage monthly spending.</div>
            ) : (
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-surface/80 text-gray-800 font-bold uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Monthly Amount</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {expenses.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#14181C]">{item.category}</td>
                      <td className="px-4 py-3.5 text-rose-600 font-bold">₹{Number(item.amount).toLocaleString()}</td>
                      <td className="px-4 py-3.5 capitalize font-medium text-gray-700">{item.frequency}</td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">{item.notes || "-"}</td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingExpenseId(item.id);
                            setExpenseInput({ category: item.category, amount: String(item.amount), frequency: item.frequency, notes: item.notes || "" });
                            setExpenseModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: item.id, type: "expense", name: item.category })}
                          className="p-1.5 text-gray-600 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Assets (Cash, Savings, Gold, Real Estate, Vehicles) */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              Tangible Assets (Cash, Savings, Real Estate, Gold, Vehicles)
            </h2>
            <button
              onClick={() => {
                setEditingAssetId(null);
                setAssetInput({ asset_name: "", asset_type: "Cash", valuation: "", institution: "", notes: "" });
                setAssetModal(true);
              }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
            </button>
          </div>

          <div className="bg-white border border-border rounded-card overflow-hidden shadow-card">
            {assets.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No assets added yet. Click &quot;Add Asset&quot; to record cash, gold, real estate, or savings.</div>
            ) : (
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-surface/80 text-gray-800 font-bold uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Asset Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Institution / Location</th>
                    <th className="px-4 py-3">Current Valuation</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {assets.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#14181C]">{item.asset_name}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-semibold text-primary-dark bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full inline-block">
                          {item.asset_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">{item.institution || "-"}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700">₹{Number(item.valuation).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingAssetId(item.id);
                            setAssetInput({
                              asset_name: item.asset_name,
                              asset_type: item.asset_type,
                              valuation: String(item.valuation),
                              institution: item.institution || "",
                              notes: item.notes || "",
                            });
                            setAssetModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: item.id, type: "asset", name: item.asset_name })}
                          className="p-1.5 text-gray-600 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Investments (Stocks, Mutual Funds, ETFs, Bonds) */}
      {activeTab === "investments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Financial Investments (Stocks, Mutual Funds, ETFs, Bonds)
            </h2>
            <button
              onClick={() => {
                setEditingInvestmentId(null);
                setInvestmentInput({ asset_name: "", asset_type: "Stocks", quantity: "1", current_price: "", purchase_price: "", platform: "" });
                setInvestmentModal(true);
              }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Investment</span>
            </button>
          </div>

          <div className="bg-white border border-border rounded-card overflow-hidden shadow-card">
            {investments.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No investments added yet. Click &quot;Add Investment&quot; to manage your portfolio.</div>
            ) : (
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-surface/80 text-gray-800 font-bold uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Investment Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Current Price</th>
                    <th className="px-4 py-3">Portfolio Value</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {investments.map((item) => {
                    const totalVal = Number(item.current_value) || (Number(item.quantity) * Number(item.current_price));
                    return (
                      <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#14181C]">{item.asset_name}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full inline-block">
                            {item.asset_type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 font-medium">{item.platform || "-"}</td>
                        <td className="px-4 py-3.5 font-medium text-gray-800">₹{Number(item.current_price).toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-bold text-[#14181C]">₹{totalVal.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingInvestmentId(item.id);
                              setInvestmentInput({
                                asset_name: item.asset_name,
                                asset_type: item.asset_type,
                                quantity: String(item.quantity),
                                current_price: String(item.current_price),
                                purchase_price: String(item.purchase_price),
                                platform: item.platform || "",
                              });
                              setInvestmentModal(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-primary transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: item.id, type: "investment", name: item.asset_name })}
                            className="p-1.5 text-gray-600 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Liabilities */}
      {activeTab === "liabilities" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-600" />
              Loans & Liabilities
            </h2>
            <button
              onClick={() => {
                setEditingLoanId(null);
                setLoanInput({ loan_type: "Home Loan", lender: "", principal_amount: "", outstanding_amount: "", interest_rate: "", emi: "", tenure: "" });
                setLoanModal(true);
              }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Liability</span>
            </button>
          </div>

          <div className="bg-white border border-border rounded-card overflow-hidden shadow-card">
            {loans.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No active loans or liabilities recorded.</div>
            ) : (
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-surface/80 text-gray-800 font-bold uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Loan Type</th>
                    <th className="px-4 py-3">Lender</th>
                    <th className="px-4 py-3">Outstanding Amount</th>
                    <th className="px-4 py-3">Monthly EMI</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loans.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#14181C]">{item.loan_type}</td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">{item.lender}</td>
                      <td className="px-4 py-3.5 font-bold text-rose-600">₹{Number(item.outstanding_amount).toLocaleString()}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">₹{Number(item.emi).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingLoanId(item.id);
                            setLoanInput({
                              loan_type: item.loan_type,
                              lender: item.lender,
                              principal_amount: String(item.principal_amount),
                              outstanding_amount: String(item.outstanding_amount),
                              interest_rate: String(item.interest_rate),
                              emi: String(item.emi),
                              tenure: String(item.tenure),
                            });
                            setLoanModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: item.id, type: "loan", name: `${item.loan_type} (${item.lender})` })}
                          className="p-1.5 text-gray-600 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Insurance */}
      {activeTab === "insurance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Insurance Policies
            </h2>
            <button
              onClick={() => {
                setEditingPolicyId(null);
                setPolicyInput({ provider: "", policy_name: "", policy_type: "Health", coverage_amount: "", premium: "", renewal_date: "" });
                setPolicyModal(true);
              }}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Policy</span>
            </button>
          </div>

          <div className="bg-white border border-border rounded-card overflow-hidden shadow-card">
            {policies.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs">No active insurance policies registered.</div>
            ) : (
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-surface/80 text-gray-800 font-bold uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Policy Name</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Coverage</th>
                    <th className="px-4 py-3">Annual Premium</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {policies.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#14181C]">{item.policy_name}</td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">{item.provider}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700">₹{Number(item.coverage_amount).toLocaleString()}</td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">₹{Number(item.premium).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingPolicyId(item.id);
                            setPolicyInput({
                              provider: item.provider || item.company || "",
                              policy_name: item.policy_name || item.plan_name || "",
                              policy_type: item.policy_type || "Health Insurance",
                              coverage_amount: String(item.coverage_amount || 0),
                              premium: String(item.premium || item.premium_amount || 0),
                              renewal_date: (item.renewal_date || item.end_date) ? (item.renewal_date || item.end_date)!.toString() : "",
                            });
                            setPolicyModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: item.id, type: "policy", name: item.policy_name || item.plan_name || "Policy" })}
                          className="p-1.5 text-gray-600 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Preferences */}
      {activeTab === "preferences" && (
        <div className="bg-white border border-border rounded-card p-6 shadow-card">
          <h2 className="text-base font-bold text-[#14181C] mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Financial Preferences
          </h2>
          <form onSubmit={handleSavePreferences} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Risk Profile</label>
              <select
                value={prefForm.risk_profile}
                onChange={(e) => setPrefForm({ ...prefForm, risk_profile: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              >
                <option value="conservative">Conservative (Low Risk)</option>
                <option value="moderate">Moderate (Balanced)</option>
                <option value="aggressive">Aggressive (High Risk)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Preferred Currency</label>
              <select
                value={prefForm.currency}
                onChange={(e) => setPrefForm({ ...prefForm, currency: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1.5">Primary Investment Goal</label>
              <input
                type="text"
                value={prefForm.investment_goal}
                onChange={(e) => setPrefForm({ ...prefForm, investment_goal: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="Retirement / Wealth Growth"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-800">Emergency Fund Goal (₹)</label>
                <span className="text-xs font-bold text-primary-dark">₹{(prefForm.emergency_fund_goal ?? prefForm.emergency_fund ?? 0).toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                step="5000"
                value={prefForm.emergency_fund_goal ?? prefForm.emergency_fund ?? 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPrefForm({ ...prefForm, emergency_fund_goal: val, emergency_fund: val });
                }}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary mb-2"
              />
              <input
                type="number"
                min="0"
                value={prefForm.emergency_fund_goal ?? prefForm.emergency_fund ?? 0}
                onChange={(e) => {
                  const v = e.target.value === "" ? 0 : parseFloat(e.target.value);
                  const val = isNaN(v) ? 0 : Math.max(0, v);
                  setPrefForm({ ...prefForm, emergency_fund_goal: val, emergency_fund: val });
                }}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-card p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              <h3 className="text-base font-bold text-[#14181C]">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed mb-5">
              Are you sure you want to delete <strong className="text-[#14181C]">&quot;{deleteConfirm.name}&quot;</strong>? This operation cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-surface border border-border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INCOME MODAL */}
      {incomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#14181C] mb-4">{editingIncomeId ? "Edit Income Source" : "Add Income Source"}</h3>
            <form onSubmit={handleSaveIncome} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Source Type</label>
                <select
                  value={incomeInput.source_name}
                  onChange={(e) => setIncomeInput({ ...incomeInput, source_name: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                >
                  <option value="Salary">Salary</option>
                  <option value="Business">Business</option>
                  <option value="Rental">Rental</option>
                  <option value="Freelancing">Freelancing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Monthly Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={incomeInput.monthly_amount}
                  onChange={(e) => setIncomeInput({ ...incomeInput, monthly_amount: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="50000"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIncomeModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-700 border border-border rounded-xl hover:bg-surface">Cancel</button>
                <button type="submit" disabled={isCreatingIncome} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {expenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#14181C] mb-4">{editingExpenseId ? "Edit Expense" : "Add Expense"}</h3>
            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Category</label>
                <select
                  value={expenseInput.category}
                  onChange={(e) => setExpenseInput({ ...expenseInput, category: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                >
                  <option value="Rent">Rent</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Subscriptions">Subscriptions</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Monthly Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={expenseInput.amount}
                  onChange={(e) => setExpenseInput({ ...expenseInput, amount: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="15000"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setExpenseModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-700 border border-border rounded-xl hover:bg-surface">Cancel</button>
                <button type="submit" disabled={isCreatingExpense} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSET MODAL (Cash, Savings, Gold, Real Estate, Vehicles) */}
      {assetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#14181C] mb-4">{editingAssetId ? "Edit Asset" : "Add Tangible Asset"}</h3>
            <form onSubmit={handleSaveAsset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetInput.asset_name}
                  onChange={(e) => setAssetInput({ ...assetInput, asset_name: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="Primary Residence / Gold Sovereign / Savings Cash"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Asset Category</label>
                <select
                  value={assetInput.asset_type}
                  onChange={(e) => setAssetInput({ ...assetInput, asset_type: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Gold">Gold / Bullion</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Crypto">Crypto Asset</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Total Valuation (₹)</label>
                <input
                  type="number"
                  required
                  value={assetInput.valuation}
                  onChange={(e) => setAssetInput({ ...assetInput, valuation: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="250000"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Institution / Location</label>
                <input
                  type="text"
                  value={assetInput.institution}
                  onChange={(e) => setAssetInput({ ...assetInput, institution: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="HDFC Bank / Mumbai"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setAssetModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-700 border border-border rounded-xl hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-md">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVESTMENT MODAL (Stocks, Mutual Funds, ETFs, Bonds) */}
      {investmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#14181C] mb-4">{editingInvestmentId ? "Edit Investment" : "Add Investment Instrument"}</h3>
            <form onSubmit={handleSaveInvestment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Investment Name</label>
                <input
                  type="text"
                  required
                  value={investmentInput.asset_name}
                  onChange={(e) => setInvestmentInput({ ...investmentInput, asset_name: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="Reliance Industries / HDFC Index Fund"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Instrument Type</label>
                <select
                  value={investmentInput.asset_type}
                  onChange={(e) => setInvestmentInput({ ...investmentInput, asset_type: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                >
                  <option value="Stocks">Stocks</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="ETFs">ETFs</option>
                  <option value="Bonds">Bonds</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    value={investmentInput.quantity}
                    onChange={(e) => setInvestmentInput({ ...investmentInput, quantity: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Current Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={investmentInput.current_price}
                    onChange={(e) => setInvestmentInput({ ...investmentInput, current_price: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    placeholder="180"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Platform / Broker</label>
                <input
                  type="text"
                  value={investmentInput.platform}
                  onChange={(e) => setInvestmentInput({ ...investmentInput, platform: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="Zerodha / Groww"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setInvestmentModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-700 border border-border rounded-xl hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-md">Save Investment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOAN MODAL */}
      {loanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#14181C] mb-4">{editingLoanId ? "Edit Liability" : "Add Liability / Loan"}</h3>
            <form onSubmit={handleSaveLoan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Loan Type</label>
                <select
                  value={loanInput.loan_type}
                  onChange={(e) => setLoanInput({ ...loanInput, loan_type: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                >
                  <option value="Home Loan">Home Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Vehicle Loan">Vehicle Loan</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Lender / Institution</label>
                <input
                  type="text"
                  required
                  value={loanInput.lender}
                  onChange={(e) => setLoanInput({ ...loanInput, lender: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="SBI / HDFC Bank"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Outstanding (₹)</label>
                  <input
                    type="number"
                    required
                    value={loanInput.outstanding_amount}
                    onChange={(e) => setLoanInput({ ...loanInput, outstanding_amount: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    required
                    value={loanInput.emi}
                    onChange={(e) => setLoanInput({ ...loanInput, emi: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    placeholder="450"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setLoanModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-700 border border-border rounded-xl hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-md">Save Liability</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POLICY MODAL */}
      {policyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-border rounded-card p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#14181C] mb-4">{editingPolicyId ? "Edit Policy" : "Add Insurance Policy"}</h3>
            <form onSubmit={handleSavePolicy} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Policy Name</label>
                <input
                  type="text"
                  required
                  value={policyInput.policy_name}
                  onChange={(e) => setPolicyInput({ ...policyInput, policy_name: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="Family Health Optima"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Provider</label>
                <input
                  type="text"
                  required
                  value={policyInput.provider}
                  onChange={(e) => setPolicyInput({ ...policyInput, provider: e.target.value })}
                  className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                  placeholder="Star Health"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Coverage (₹)</label>
                  <input
                    type="number"
                    required
                    value={policyInput.coverage_amount}
                    onChange={(e) => setPolicyInput({ ...policyInput, coverage_amount: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1.5">Annual Premium (₹)</label>
                  <input
                    type="number"
                    required
                    value={policyInput.premium}
                    onChange={(e) => setPolicyInput({ ...policyInput, premium: e.target.value })}
                    className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    placeholder="12000"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setPolicyModal(false)} className="px-4 py-2 text-xs font-semibold text-gray-700 border border-border rounded-xl hover:bg-surface">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs rounded-xl shadow-md">Save Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
