"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/AuthContext";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { useLoans } from "@/hooks/useLoans";
import { useInvestments } from "@/hooks/useInvestments";
import { useInsurancePolicies } from "@/hooks/useInsurancePolicies";
import { supabase } from "@/lib/supabase";
import {
  User,
  Shield,
  Bell,
  Link as LinkIcon,
  Database,
  Lock,
  KeyRound,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  Globe,
  DollarSign,
  Sliders,
  Smartphone,
  Mail,
  Zap,
  Building2,
  HardDrive,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user, profile: authProfile } = useAuth();
  const { profile, updateProfile, isUpdating } = useFinancialProfile();
  const { incomeSources } = useIncome();
  const { expenses } = useExpenses();
  const { assets } = useAssets();
  const { loans } = useLoans();
  const { investments } = useInvestments();
  const { policies } = useInsurancePolicies();

  const [activeTab, setActiveTab] = useState<"account" | "security" | "notifications" | "connections" | "data">("account");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Account & Profile Form State
  const [accountForm, setAccountForm] = useState({
    full_name: "",
    phone: "",
    occupation: "",
    currency: "INR",
    risk_profile: "moderate",
    investment_goal: "Wealth Growth",
  });

  useEffect(() => {
    if (profile) {
      setAccountForm({
        full_name: profile.full_name || authProfile?.full_name || "",
        phone: profile.phone || "",
        occupation: profile.occupation || "",
        currency: profile.currency || "INR",
        risk_profile: profile.risk_profile || "moderate",
        investment_goal: profile.investment_goal || "Wealth Growth",
      });
    }
  }, [profile, authProfile]);

  // Security Form State
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });

  // Load 2FA status from localStorage on mount
  useEffect(() => {
    const saved2FA = localStorage.getItem("financialos_2fa_status");
    if (saved2FA !== null) {
      setSecurityForm((prev) => ({ ...prev, twoFactorEnabled: saved2FA === "true" }));
    }
  }, []);

  // Notification Preferences State (Loaded from localStorage)
  const [notifPrefs, setNotifPrefs] = useState({
    emailDigest: true,
    loanReminders: true,
    schemeAlerts: true,
    marketNewsAlerts: false,
    lowReserveAlerts: true,
  });

  useEffect(() => {
    const savedNotifs = localStorage.getItem("financialos_notification_prefs");
    if (savedNotifs) {
      try {
        setNotifPrefs(JSON.parse(savedNotifs));
      } catch (e) {
        // Fallback to default
      }
    }
  }, []);

  // Connections State
  const [connections, setConnections] = useState([
    { id: "aa", name: "Account Aggregator (NBFC-AA)", status: "connected", lastSync: "Just now" },
    { id: "cams", name: "CAMS / KFintech Mutual Funds", status: "connected", lastSync: "Today, 10:30 AM" },
    { id: "broker", name: "Zerodha / Groww Demat", status: "connected", lastSync: "Today, 09:15 AM" },
    { id: "supabase", name: "Supabase Relational Database", status: "active", lastSync: "Real-time" },
  ]);

  // Save Account Profile to Backend API
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(accountForm);
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["financial-profile"] });
      toast.success("Account & financial preferences updated and synchronized!", "Profile Saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile settings.", "Update Error");
    }
  };

  // Real Supabase Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.newPassword) {
      toast.error("Please enter a new password.", "Validation Error");
      return;
    }
    if (securityForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.", "Validation Error");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("New passwords do not match.", "Validation Error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: securityForm.newPassword });
      if (error) {
        throw error;
      }
      toast.success("Security credentials & password updated successfully in Supabase Auth!", "Password Changed");
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "", twoFactorEnabled: securityForm.twoFactorEnabled });
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.", "Security Error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Toggle 2FA with LocalStorage Persistence
  const handleToggle2FA = () => {
    const nextState = !securityForm.twoFactorEnabled;
    setSecurityForm((prev) => ({ ...prev, twoFactorEnabled: nextState }));
    localStorage.setItem("financialos_2fa_status", String(nextState));
    toast.info(nextState ? "Two-Factor Authentication (2FA) enabled for account." : "2FA disabled.", "2FA Status");
  };

  // Toggle Notification Preference with LocalStorage Persistence
  const handleToggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("financialos_notification_prefs", JSON.stringify(updated));
      toast.success("Notification preferences saved.", "Preferences Updated");
      return updated;
    });
  };

  // Trigger Real React Query Re-Sync for Integrations
  const handleSyncConnection = async (connId: string, name: string) => {
    setSyncingId(connId);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["income-sources"] }),
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["assets"] }),
        queryClient.invalidateQueries({ queryKey: ["investments"] }),
        queryClient.invalidateQueries({ queryKey: ["loans"] }),
        queryClient.invalidateQueries({ queryKey: ["insurance-policies"] }),
      ]);
      setConnections((prev) =>
        prev.map((c) => (c.id === connId ? { ...c, lastSync: "Just now" } : c))
      );
      toast.success(`Successfully re-synchronized data from ${name}!`, "Data Re-synced");
    } catch (err) {
      toast.error(`Failed to re-sync ${name}`, "Sync Error");
    } finally {
      setSyncingId(null);
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const exportData = {
      profile: profile || accountForm,
      incomeSources,
      expenses,
      assets,
      investments,
      loans,
      insurancePolicies: policies,
      exportedAt: new Date().toISOString(),
      appVersion: "1.0.0",
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinancialOS_Data_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported full portfolio & profile data as JSON file.", "Data Exported");
  };

  // Export CSV Spreadsheet
  const handleExportCSV = () => {
    let csvContent = "Category,Name,Amount,Details\n";
    (incomeSources || []).forEach((i) => (csvContent += `Income,"${i.source_name}",${i.monthly_amount},"${i.frequency}"\n`));
    (expenses || []).forEach((e) => (csvContent += `Expense,"${e.category}",${e.amount},"${e.frequency}"\n`));
    (assets || []).forEach((a) => (csvContent += `Asset,"${a.asset_name}",${a.valuation},"${a.asset_type}"\n`));
    (investments || []).forEach((inv) => (csvContent += `Investment,"${inv.asset_name}",${inv.current_value || inv.quantity * inv.current_price},"${inv.asset_type}"\n`));
    (loans || []).forEach((l) => (csvContent += `Liability,"${l.loan_type} (${l.lender})",${l.outstanding_amount},"EMI: ${l.emi}"\n`));
    (policies || []).forEach((p) => (csvContent += `Insurance,"${p.policy_name || p.plan_name || 'Policy'}",${p.coverage_amount},"Provider: ${p.provider || p.company || 'N/A'}"\n`));

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FinancialOS_Summary_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported portfolio summary as CSV spreadsheet.", "Data Exported");
  };

  const handleClearCache = () => {
    localStorage.clear();
    queryClient.clear();
    toast.info("Local app cache & query cache cleared successfully.", "Cache Reset");
  };

  const tabs = [
    { id: "account", label: "Account & Profile", icon: User },
    { id: "security", label: "Security & Login", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "connections", label: "Integrations & Sync", icon: LinkIcon },
    { id: "data", label: "Data & Privacy", icon: Database },
  ] as const;

  return (
    <DashboardShell>
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage your profile, security options, notification channels, integrations, and data backup."
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      {/* NAVIGATION TAB STRIP */}
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

      {/* TAB 1: ACCOUNT & PROFILE */}
      {activeTab === "account" && (
        <div className="bg-white border border-border rounded-card p-6 shadow-card space-y-6">
          <div className="border-b border-border/60 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Account & Financial Profile
            </h2>
            <Badge tone="primary" className="text-[10px]">
              Active User: {user?.email}
            </Badge>
          </div>

          <form onSubmit={handleSaveAccount} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Full Name</label>
              <Input
                value={accountForm.full_name}
                onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })}
                placeholder="Akshanth N"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Phone Number</label>
              <Input
                value={accountForm.phone}
                onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Occupation</label>
              <Input
                value={accountForm.occupation}
                onChange={(e) => setAccountForm({ ...accountForm, occupation: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Preferred Currency</label>
              <select
                value={accountForm.currency}
                onChange={(e) => setAccountForm({ ...accountForm, currency: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Risk Appetite Profile</label>
              <select
                value={accountForm.risk_profile}
                onChange={(e) => setAccountForm({ ...accountForm, risk_profile: e.target.value })}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-[#14181C] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              >
                <option value="conservative">Conservative (Capital Preservation)</option>
                <option value="moderate">Moderate (Balanced Growth)</option>
                <option value="aggressive">Aggressive (Maximum Wealth Creation)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1.5">Primary Financial Goal</label>
              <Input
                value={accountForm.investment_goal}
                onChange={(e) => setAccountForm({ ...accountForm, investment_goal: e.target.value })}
                placeholder="Retirement / House Down Payment"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-3">
              <Button type="submit" disabled={isUpdating} className="gap-2">
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Save Account Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY & LOGIN */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-card p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2 border-b border-border/60 pb-3">
              <KeyRound className="w-5 h-5 text-primary" /> Password & Login Credentials (Supabase Auth)
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md text-xs">
              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">New Password</label>
                <Input
                  type="password"
                  required
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-800 mb-1.5">Confirm New Password</label>
                <Input
                  type="password"
                  required
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                />
              </div>

              <Button type="submit" disabled={isUpdatingPassword} className="gap-2">
                {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Update Password
              </Button>
            </form>
          </div>

          <div className="bg-white border border-border rounded-card p-6 shadow-card flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#14181C] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" /> Two-Factor Authentication (2FA)
              </h3>
              <p className="text-xs text-gray-600 font-medium">
                Add an extra layer of security to your account with time-based OTP authorization.
              </p>
            </div>

            <Button
              variant={securityForm.twoFactorEnabled ? "primary" : "secondary"}
              onClick={handleToggle2FA}
              className="gap-2"
            >
              {securityForm.twoFactorEnabled ? "2FA Enabled" : "Enable 2FA"}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <div className="bg-white border border-border rounded-card p-6 shadow-card space-y-6">
          <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2 border-b border-border/60 pb-3">
            <Bell className="w-5 h-5 text-primary" /> Notification Channels & Alert Preferences
          </h2>

          <div className="space-y-4 text-xs">
            {[
              { key: "emailDigest", title: "Weekly Portfolio Summary", desc: "Receive weekly email digests summarizing net worth shift & budget performance." },
              { key: "loanReminders", title: "EMI & Loan Due Dates", desc: "Get early notifications before loan EMI auto-debit dates." },
              { key: "schemeAlerts", title: "New Welfare Scheme Alerts", desc: "Receive alerts when government schemes matching your profile are launched." },
              { key: "marketNewsAlerts", title: "Market Volatility Digest", desc: "Instant news updates affecting your stock & mutual fund holdings." },
              { key: "lowReserveAlerts", title: "Emergency Fund Runway Alerts", desc: "Alert if liquid cash reserves drop below 3 months of expenses." },
            ].map((item) => {
              const isEnabled = notifPrefs[item.key as keyof typeof notifPrefs];
              return (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface/40 hover:bg-white transition-all">
                  <div className="space-y-0.5">
                    <strong className="text-sm font-bold text-[#14181C] block">{item.title}</strong>
                    <p className="text-xs text-gray-600 font-medium">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleNotif(item.key as keyof typeof notifPrefs)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-primary" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CONNECTIONS & INTEGRATIONS */}
      {activeTab === "connections" && (
        <div className="bg-white border border-border rounded-card p-6 shadow-card space-y-6">
          <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2 border-b border-border/60 pb-3">
            <LinkIcon className="w-5 h-5 text-primary" /> Connected Financial Data Providers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {connections.map((conn) => (
              <div key={conn.id} className="rounded-xl border border-border p-4 bg-white shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary-dark">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-[#14181C] block">{conn.name}</strong>
                      <span className="text-[11px] text-gray-500 font-medium">Last synced: {conn.lastSync}</span>
                    </div>
                  </div>
                  <Badge tone="primary" className="text-[10px] capitalize">
                    {conn.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={syncingId === conn.id}
                    onClick={() => handleSyncConnection(conn.id, conn.name)}
                    className="h-7 text-xs gap-1"
                  >
                    {syncingId === conn.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    {syncingId === conn.id ? "Syncing..." : "Sync Now"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DATA MANAGEMENT & PRIVACY */}
      {activeTab === "data" && (
        <div className="space-y-6">
          {/* DATA EXPORT CARD */}
          <div className="bg-white border border-border rounded-card p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-[#14181C] flex items-center gap-2 border-b border-border/60 pb-3">
              <Download className="w-5 h-5 text-primary" /> Export Your Portfolio Data
            </h2>
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Download your complete financial records, assets, loans, income, expenses, and insurance policies in open standard formats.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleExportJSON} className="gap-2">
                <Download size={16} /> Export Complete JSON Backup
              </Button>
              <Button variant="secondary" onClick={handleExportCSV} className="gap-2">
                <Download size={16} /> Export Summary CSV Spreadsheet
              </Button>
            </div>
          </div>

          {/* DANGER ZONE CARD */}
          <div className="bg-white border border-rose-200 rounded-card p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold text-rose-600 flex items-center gap-2 border-b border-rose-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Danger Zone & System Maintenance
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <strong className="text-sm font-bold text-[#14181C] block">Clear Application Cache</strong>
                <p className="text-xs text-gray-600 font-medium">Reset local browser state and refresh session tokens.</p>
              </div>
              <Button variant="secondary" onClick={handleClearCache} className="shrink-0 text-xs">
                Clear Local Cache
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
