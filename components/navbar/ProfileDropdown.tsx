"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast";

export function ProfileDropdown({ name }: { name?: string }) {
  const [open, setOpen] = useState(false);
  const { profile, user, signOut } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const displayName = name || profile?.full_name || user?.email?.split("@")[0] || "User";
  
  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    setOpen(false);
    const { error } = await signOut();
    if (!error) {
      toast.info("You have logged out successfully.", "Signed Out");
      router.push("/login");
    } else {
      toast.error(error.message, "Logout Failed");
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary-dark">
            {getInitials(displayName)}
          </div>
        )}
        <span className="hidden text-sm font-medium text-[#14181C] md:inline">{displayName}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-card border border-border bg-white p-1.5 shadow-card-hover">
          <div className="px-3 py-2 border-b border-border/60 mb-1">
            <p className="text-xs font-semibold text-[#14181C] truncate">{displayName}</p>
            <p className="text-[11px] text-muted truncate">{user?.email}</p>
          </div>

          <Link
            href="/financial-profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#14181C] hover:bg-surface transition-colors"
          >
            <User size={15} /> Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#14181C] hover:bg-surface transition-colors"
          >
            <Settings size={15} /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
