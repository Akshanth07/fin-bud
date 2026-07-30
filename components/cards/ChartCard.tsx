import { Card } from "@/components/ui/card";

export function ChartCard({
  title, action, children,
}: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#14181C]">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
}
