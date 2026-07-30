"use client";

import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "./SearchBar";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";

export function Navbar({ greetingName }: { greetingName?: string }) {
  const { profile, user } = useAuth();
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  
  const activeName = greetingName || profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  return (
    <div className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-white/90 px-8 backdrop-blur shadow-sm">
      <div>
        <div className="flex items-center gap-2 text-lg font-extrabold text-[#14181C] tracking-tight">
          Hello {activeName}
          <span className="text-xs font-semibold text-gray-600">» {today}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <SearchBar />
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </div>
  );
}
