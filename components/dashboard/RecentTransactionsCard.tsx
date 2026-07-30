"use client";
import { useState } from "react";
import Link from "next/link";
import { Gamepad2, Shirt, UtensilsCrossed, Car, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { Transaction } from "@/types";

const iconMap: Record<string, typeof Gamepad2> = {
  gamepad: Gamepad2, shirt: Shirt, utensils: UtensilsCrossed, car: Car, wallet: Wallet,
};

const tabs = [
  { key: "all", label: "All" },
  { key: "revenue", label: "Revenue" },
  { key: "expense", label: "Expenses" },
] as const;

export function RecentTransactionsCard({ transactions }: { transactions: Transaction[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const filtered = transactions.filter((t) => tab === "all" || t.type === tab);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#14181C]">Recent Transaction</span>
        <Link href="/financial-profile" className="text-xs font-medium text-primary hover:text-primary-dark">
          View All →
        </Link>
      </div>

      <div className="mt-4 flex gap-5 border-b border-border text-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 font-medium transition-colors",
              tab === t.key ? "border-primary text-primary-dark" : "border-transparent text-muted hover:text-[#14181C]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3 divide-y divide-border">
        {filtered.map((t) => {
          const Icon = iconMap[t.icon] ?? Wallet;
          return (
            <div key={t.id} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface">
                  <Icon size={16} className="text-[#14181C]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-[#14181C]">{t.name}</div>
                  <div className="text-xs text-muted">{t.category}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-sm font-semibold", t.type === "revenue" ? "text-primary-dark" : "text-[#14181C]")}>
                  {t.type === "revenue" ? "+" : "-"}{formatCurrency(t.amount)}
                </div>
                <div className="text-xs text-muted">{t.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
