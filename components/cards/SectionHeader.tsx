import Link from "next/link";

export function SectionHeader({
  title, actionLabel, actionHref,
}: { title: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold text-[#14181C]">{title}</h2>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-sm font-medium text-primary hover:text-primary-dark">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
