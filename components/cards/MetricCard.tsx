import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label, value, changePercent, icon: Icon,
}: { label: string; value: string; changePercent?: number; icon?: LucideIcon }) {
  const positive = (changePercent ?? 0) >= 0;
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Icon size={16} className="text-primary-dark" />
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-semibold text-[#14181C]">{value}</div>
      {changePercent !== undefined && (
        <div className={cn("mt-2 flex items-center gap-1 text-xs font-medium", positive ? "text-primary-dark" : "text-red-500")}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(changePercent)}% this month
        </div>
      )}
    </Card>
  );
}
