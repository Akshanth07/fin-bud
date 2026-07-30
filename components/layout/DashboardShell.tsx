"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Navbar } from "@/components/navbar/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !session)) {
      router.replace("/login");
    }
  }, [user, session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-xs text-muted font-medium">Verifying Session...</span>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="pl-64 flex min-h-screen flex-col min-w-0">
        <Navbar />
        <main className="flex-1 px-8 py-7 min-w-0">{children}</main>
      </div>
    </div>
  );
}
