"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardSummary, CreditCardInfo } from "@/types";

export function TotalBalanceCard({
  summary, card,
}: { summary: DashboardSummary; card: CreditCardInfo }) {
  const [slide, setSlide] = useState(0);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Total Balance</span>
        <span className="text-xs font-medium text-muted">All Accounts</span>
      </div>
      <div className="mt-2 text-3xl font-bold text-[#14181C]">
        {formatCurrency(summary.totalBalance)}
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary-dark to-[#101615] p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/70">Account Type</div>
            <div className="text-base font-semibold">{card.type}</div>
          </div>
          <div className="flex -space-x-2.5">
            <span className="h-6 w-6 rounded-full bg-red-500/90" />
            <span className="h-6 w-6 rounded-full bg-amber-400/90" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm tracking-wider text-white/80">**** **** **** {card.last4}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{formatCurrency(card.balance)}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
              <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <button
          onClick={() => setSlide((s) => Math.max(0, s - 1))}
          className="flex items-center gap-1 text-muted hover:text-[#14181C]"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === slide ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>
        <button
          onClick={() => setSlide((s) => Math.min(2, s + 1))}
          className="flex items-center gap-1 font-medium text-[#14181C] hover:text-primary-dark"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </Card>
  );
}
