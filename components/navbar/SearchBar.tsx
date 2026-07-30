"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, LayoutDashboard, User, Zap, Landmark, Target, Shield, Newspaper, Settings, ArrowRight, DollarSign, Receipt, CreditCard, TrendingUp, Sparkles } from "lucide-react";
import { useIncome } from "@/hooks/useIncome";
import { useExpenses } from "@/hooks/useExpenses";
import { useAssets } from "@/hooks/useAssets";
import { useInvestments } from "@/hooks/useInvestments";
import { useLoans } from "@/hooks/useLoans";
import { useInsurancePolicies } from "@/hooks/useInsurancePolicies";
import { useGoalPlanner } from "@/hooks/useGoalPlanner";

interface SearchResultItem {
  id: string;
  title: string;
  category: "Navigation" | "Income" | "Expenses" | "Assets" | "Investments" | "Loans" | "Insurance" | "Goals";
  subtitle?: string;
  href: string;
  icon: any;
}

const PAGES_NAVIGATION: SearchResultItem[] = [
  { id: "nav-dashboard", title: "Dashboard Overview", category: "Navigation", subtitle: "Real-time net worth & health score", href: "/dashboard", icon: LayoutDashboard },
  { id: "nav-profile", title: "Financial Profile", category: "Navigation", subtitle: "Personal details, income, expenses & assets", href: "/financial-profile", icon: User },
  { id: "nav-simulator", title: "Life Event Simulator", category: "Navigation", subtitle: "Stress-test milestones & portfolio impacts", href: "/life-events", icon: Zap },
  { id: "nav-schemes", title: "Government Welfare Schemes", category: "Navigation", subtitle: "Personalized subsidies & eligibility finder", href: "/government-schemes", icon: Landmark },
  { id: "nav-goals", title: "Goal Planner", category: "Navigation", subtitle: "Target savings, contributions & AI predictions", href: "/goal-planner", icon: Target },
  { id: "nav-insurance", title: "Insurance Analyzer & OCR", category: "Navigation", subtitle: "Policy documents, coverage & health score", href: "/insurance", icon: Shield },
  { id: "nav-news", title: "Financial Market News", category: "Navigation", subtitle: "Latest economic updates & portfolio impact", href: "/market-news", icon: Newspaper },
  { id: "nav-settings", title: "Settings & Preferences", category: "Navigation", subtitle: "Security, currency & profile preferences", href: "/settings", icon: Settings },
];

function formatINR(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export function SearchBar({ placeholder = "Search pages, assets, loans, goals..." }: { placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // User Portfolio Data Hooks
  const { incomeSources } = useIncome();
  const { expenses } = useExpenses();
  const { assets } = useAssets();
  const { investments } = useInvestments();
  const { loans } = useLoans();
  const { policies } = useInsurancePolicies();
  const { goals } = useGoalPlanner();

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filtered Results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const items: SearchResultItem[] = [];

    // 1. Pages Navigation
    PAGES_NAVIGATION.forEach((nav) => {
      if (nav.title.toLowerCase().includes(q) || nav.subtitle?.toLowerCase().includes(q)) {
        items.push(nav);
      }
    });

    // 2. Income Sources
    (incomeSources || []).forEach((inc) => {
      if (inc.source_name.toLowerCase().includes(q) || inc.notes?.toLowerCase().includes(q)) {
        items.push({
          id: `inc-${inc.id}`,
          title: inc.source_name,
          category: "Income",
          subtitle: `${formatINR(inc.monthly_amount)} / month`,
          href: "/financial-profile",
          icon: DollarSign,
        });
      }
    });

    // 3. Expenses
    (expenses || []).forEach((exp) => {
      if (exp.category.toLowerCase().includes(q) || exp.notes?.toLowerCase().includes(q)) {
        items.push({
          id: `exp-${exp.id}`,
          title: exp.category,
          category: "Expenses",
          subtitle: `${formatINR(exp.amount)} / month`,
          href: "/financial-profile",
          icon: Receipt,
        });
      }
    });

    // 4. Assets
    (assets || []).forEach((ast) => {
      if (ast.asset_name.toLowerCase().includes(q) || ast.asset_type.toLowerCase().includes(q)) {
        items.push({
          id: `ast-${ast.id}`,
          title: ast.asset_name,
          category: "Assets",
          subtitle: `${ast.asset_type} • ${formatINR(ast.valuation)}`,
          href: "/financial-profile",
          icon: Landmark,
        });
      }
    });

    // 5. Investments
    (investments || []).forEach((inv) => {
      if (inv.asset_name.toLowerCase().includes(q) || inv.asset_type.toLowerCase().includes(q)) {
        const val = inv.current_value || inv.quantity * inv.current_price;
        items.push({
          id: `inv-${inv.id}`,
          title: inv.asset_name,
          category: "Investments",
          subtitle: `${inv.asset_type} • ${formatINR(val)}`,
          href: "/financial-profile",
          icon: TrendingUp,
        });
      }
    });

    // 6. Loans
    (loans || []).forEach((ln) => {
      if (ln.loan_type.toLowerCase().includes(q) || ln.lender.toLowerCase().includes(q)) {
        items.push({
          id: `ln-${ln.id}`,
          title: `${ln.loan_type} (${ln.lender})`,
          category: "Loans",
          subtitle: `Outstanding: ${formatINR(ln.outstanding_amount)} • EMI: ${formatINR(ln.emi)}`,
          href: "/financial-profile",
          icon: CreditCard,
        });
      }
    });

    // 7. Insurance Policies
    (policies || []).forEach((pol) => {
      const name = pol.policy_name || pol.plan_name || "Policy";
      const providerName = pol.provider || pol.company || "";
      if (name.toLowerCase().includes(q) || providerName.toLowerCase().includes(q)) {
        items.push({
          id: `pol-${pol.id}`,
          title: providerName ? `${name} (${providerName})` : name,
          category: "Insurance",
          subtitle: `Coverage: ${formatINR(pol.coverage_amount)}`,
          href: "/insurance",
          icon: Shield,
        });
      }
    });

    // 8. Goals
    (goals || []).forEach((gl) => {
      if (gl.goal_name.toLowerCase().includes(q) || gl.goal_type.toLowerCase().includes(q)) {
        items.push({
          id: `gl-${gl.id}`,
          title: gl.goal_name,
          category: "Goals",
          subtitle: `Target: ${formatINR(gl.target_amount)} (${gl.priority} priority)`,
          href: "/goal-planner",
          icon: Target,
        });
      }
    });

    return items;
  }, [query, incomeSources, expenses, assets, investments, loans, policies, goals]);

  const handleSelectResult = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-md">
      {/* SEARCH INPUT FIELD */}
      <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <Search size={16} className="text-gray-500 shrink-0" />
        <input
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-semibold text-[#14181C] placeholder:text-gray-400 placeholder:font-normal focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* DROPDOWN RESULTS PANEL */}
      {isOpen && (
        <div className="absolute top-12 left-0 right-0 z-50 rounded-card border border-border bg-white p-2 shadow-2xl max-h-[400px] overflow-y-auto space-y-1">
          {query.trim() === "" ? (
            <div className="p-3 text-xs text-gray-500">
              <span className="font-semibold text-gray-800 block mb-2">Popular Features & Quick Navigation</span>
              <div className="grid grid-cols-2 gap-1.5">
                {PAGES_NAVIGATION.slice(0, 6).map((nav) => {
                  const Icon = nav.icon;
                  return (
                    <button
                      key={nav.id}
                      onClick={() => handleSelectResult(nav.href)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface text-left text-xs font-semibold text-gray-800 transition-colors"
                    >
                      <Icon size={14} className="text-primary shrink-0" />
                      <span className="truncate">{nav.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 font-medium">
              No matching pages, assets, loans, or goals found for &quot;<strong className="text-gray-800">{query}</strong>&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-border/60">
                Found {results.length} Matching Results
              </div>

              {results.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item.href)}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-surface text-left transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#14181C] group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold text-primary-dark bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                            {item.category}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="text-[11px] font-medium text-gray-500 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <ArrowRight size={14} className="text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
