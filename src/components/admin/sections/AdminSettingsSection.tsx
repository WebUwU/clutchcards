"use client";

import { SectionHeader } from "./AdminCardsSection";
import { getAdminSession } from "@/lib/adminAuth";
import { useEffect, useState } from "react";
import { ShieldAlert, KeyRound, Server } from "lucide-react";

export function AdminSettingsSection() {
  const [since, setSince] = useState("");
  useEffect(() => {
    const s = getAdminSession();
    if (s) setSince(new Date(s.since).toLocaleString());
  }, []);

  return (
    <div className="max-w-lg">
      <SectionHeader title="Settings" desc="Admin session info and deployment guidance." />
      <div className="panel mb-4 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <KeyRound className="size-4 text-slate-500" /> Session started: <span className="font-mono text-slate-400">{since || "—"}</span>
        </div>
      </div>
      <div className="panel space-y-3 p-5">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-rarity-legendary">
          <ShieldAlert className="size-4" /> Before deploying
        </div>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2"><Server className="mt-0.5 size-4 shrink-0 text-slate-500" /> Replace this client-side login with real server-side authentication.</li>
          <li className="flex gap-2"><Server className="mt-0.5 size-4 shrink-0 text-slate-500" /> Store hashed passwords and enforce role-based access control.</li>
          <li className="flex gap-2"><Server className="mt-0.5 size-4 shrink-0 text-slate-500" /> Move economy validation server-side so closed-economy rules can't be bypassed.</li>
        </ul>
      </div>
    </div>
  );
}
