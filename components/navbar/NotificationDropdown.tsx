"use client";
import { useState } from "react";
import { Bell } from "lucide-react";

const notifications = [
  { id: 1, text: "Your Figma subscription renews in 3 days", time: "2h ago" },
  { id: 2, text: "New government scheme match found", time: "5h ago" },
  { id: 3, text: "Monthly goal is 62% complete", time: "1d ago" },
];

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white hover:bg-surface"
      >
        <Bell size={17} className="text-muted" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-card border border-border bg-white p-2 shadow-card-hover">
          {notifications.map((n) => (
            <div key={n.id} className="rounded-xl px-3 py-2.5 hover:bg-surface">
              <div className="text-sm text-[#14181C]">{n.text}</div>
              <div className="mt-0.5 text-xs text-muted">{n.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
