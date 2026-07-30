import { Card } from "@/components/ui/card";
import type { Bill } from "@/types";

export function UpcomingBillCard({ bills }: { bills: Bill[] }) {
  return (
    <Card className="p-6">
      <span className="text-sm text-muted">Upcoming Bill</span>
      <div className="mt-4 space-y-4">
        {bills.map((bill) => (
          <div key={bill.id} className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-surface text-[10px] leading-tight text-muted">
              <span>{bill.month}</span>
              <span className="text-sm font-semibold text-[#14181C]">{bill.day}</span>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: bill.logoColor }}
            >
              {bill.name[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-[#14181C]">{bill.name}</div>
              <div className="text-xs text-muted">{bill.vendor}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
