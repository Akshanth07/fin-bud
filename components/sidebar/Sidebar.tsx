"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Wallet } from "lucide-react";
import { navItems } from "./navItems";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const toast = useToast();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User Account";
  const userEmail = user?.email || "user@example.com";

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      toast.info("You have signed out successfully.", "Logged Out");
      router.push("/login");
    } else {
      toast.error(error.message, "Logout Error");
    }
  };

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-30 flex h-screen w-64 flex-col bg-sidebar border-r border-white/5">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-6 py-6 shrink-0 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Wallet size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">FinancialOS</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors font-medium",
                active
                  ? "bg-primary font-bold text-white shadow-sm"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout Section at Bottom */}
      <div className="shrink-0 border-t border-white/10 px-3 py-4 space-y-3 bg-sidebar">
        <div className="flex items-center gap-3 px-2 py-1">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary-light border border-primary/30">
              {getInitials(displayName)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[11px] text-gray-300 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-red-500/20 hover:text-rose-300 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
