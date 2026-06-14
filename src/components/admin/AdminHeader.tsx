"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ExternalLink, ShieldCheck } from "lucide-react";

export function AdminHeader() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-2 text-[11px] text-rarity-uncommon">
          <ShieldCheck className="size-4" />
          <span className="hidden sm:inline">Admin Panel — server-authenticated. All actions are logged.</span>
          <span className="sm:hidden">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <ExternalLink className="size-3.5" /> App
          </Link>
          {name && <span className="hidden font-mono text-xs text-slate-500 sm:inline">{name}</span>}
          <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost px-3 py-1.5 text-xs">
            <LogOut className="size-3.5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
