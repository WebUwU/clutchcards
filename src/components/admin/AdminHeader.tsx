"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, ShieldAlert } from "lucide-react";
import { logoutAdmin, getAdminSession } from "@/lib/adminAuth";
import { useEffect, useState } from "react";

export function AdminHeader() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(getAdminSession()?.username ?? "");
  }, []);

  const logout = () => {
    logoutAdmin();
    router.replace("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-2 text-[11px] text-rarity-legendary">
          <ShieldAlert className="size-4" />
          <span className="hidden sm:inline">Local Admin Panel — not production secure. Add server auth before deployment.</span>
          <span className="sm:hidden">Local demo admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <ExternalLink className="size-3.5" /> App
          </Link>
          {username && <span className="hidden font-mono text-xs text-slate-500 sm:inline">@{username}</span>}
          <button onClick={logout} className="btn-ghost px-3 py-1.5 text-xs">
            <LogOut className="size-3.5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
