import { Card } from "@/components/ui/card";

export function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-2 text-xl font-semibold text-[#14181C]">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </Card>
  );
}
