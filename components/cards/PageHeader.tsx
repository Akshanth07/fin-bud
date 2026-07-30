import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  title, subtitle, breadcrumb,
}: { title: string; subtitle?: string; breadcrumb: { label: string; href?: string }[] }) {
  return (
    <div className="mb-6">
      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-1.5">
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-[#14181C] font-semibold">{crumb.label}</Link>
            ) : (
              <span className="text-gray-800 font-semibold">{crumb.label}</span>
            )}
            {i < breadcrumb.length - 1 && <ChevronRight size={12} className="text-gray-400" />}
          </span>
        ))}
      </div>
      <h1 className="text-2xl font-bold text-[#14181C] tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs font-semibold text-gray-700 mt-1">{subtitle}</p>}
    </div>
  );
}
