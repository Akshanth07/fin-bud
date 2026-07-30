import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardCard({
  className, children,
}: { className?: string; children: React.ReactNode }) {
  return <Card className={cn("p-6", className)}>{children}</Card>;
}
