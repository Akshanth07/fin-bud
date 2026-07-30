import { ArrowDownRight, ArrowUpRight, Home, UtensilsCrossed, Clapperboard, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { ExpenseCategory } from "@/types";

const iconMap: Record<string, typeof Home> = {
  Housing: Home, Food: UtensilsCrossed, Entertainment: Clapperboard, Shopping: ShoppingBag,
};

export function ExpensesBreakdownCard({ categories }: { categories: ExpenseCategory[] }) {
  return (
    <Card className="p-6">
      <span className="text-sm font-semibold text-[#14181C]">Expenses Breakdown</span>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c) => {
          const Icon = iconMap[c.name] ?? Home;
          return (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                <Icon size={16} className="text-[#14181C]" />
              </div>
              <div>
                <div className="text-xs text-muted">{c.name}</div>
                <div className="text-sm font-semibold text-[#14181C]">{formatCurrency(c.amount)}</div>
                <div className={cn("flex items-center gap-0.5 text-[11px] font-medium", c.trend === "up" ? "text-red-500" : "text-primary-dark")}>
                  {c.trend === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {c.changePercent}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
