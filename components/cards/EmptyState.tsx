import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet", description = "This section will populate once connected to live data.",
}: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-white py-16 text-center shadow-card">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
        <Inbox size={22} />
      </div>
      <div className="text-sm font-bold text-[#14181C]">{title}</div>
      <div className="mt-1 max-w-xs text-xs text-gray-700 font-medium leading-relaxed">{description}</div>
    </div>
  );
}
