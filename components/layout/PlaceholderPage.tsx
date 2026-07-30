import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/cards/PageHeader";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/cards/EmptyState";

export function PlaceholderPage({
  title, sections,
}: { title: string; sections: { name: string; description: string }[] }) {
  return (
    <DashboardShell>
      <PageHeader title={title} breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: title }]} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.name} className="p-6">
            <h2 className="mb-4 text-sm font-semibold text-[#14181C]">{section.name}</h2>
            <EmptyState description={section.description} />
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
