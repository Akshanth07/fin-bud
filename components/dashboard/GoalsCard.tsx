import { Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GaugeArc } from "@/components/charts/GaugeArc";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/types";

export function GoalsCard({ goal }: { goal: Goal }) {
  const percent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Goals</span>
        <span className="text-xs font-medium text-muted">{goal.monthLabel}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-3xl font-bold text-[#14181C]">{formatCurrency(goal.targetAmount)}</span>
        <button className="flex h-6 w-6 items-center justify-center rounded-md bg-surface text-muted">
          <Pencil size={12} />
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted">Target Achieved</div>
          <div className="mt-1 text-sm font-semibold text-[#14181C]">{formatCurrency(goal.currentAmount)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted">This month Target</div>
          <div className="mt-1 text-sm font-semibold text-[#14181C]">{formatCurrency(goal.targetAmount)}</div>
        </div>
      </div>

      <div className="mt-5">
        <GaugeArc
          percent={percent}
          centerLabel={`${(goal.currentAmount / 1000).toFixed(0)}K`}
          maxLabel={`$${(goal.targetAmount / 1000).toFixed(0)}k`}
        />
        <div className="mt-1 text-center text-xs text-muted">Target vs Achievement</div>
      </div>
    </Card>
  );
}
