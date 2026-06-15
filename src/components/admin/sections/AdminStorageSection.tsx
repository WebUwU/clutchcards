"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "./AdminCardsSection";
import { ConfirmDialog } from "../ConfirmDialog";
import { api } from "@/lib/apiClient";
import { useToast } from "@/components/ui/Toast";
import { Database, RotateCcw, ScrollText } from "lucide-react";

// DB-backed ops: view recent audit log + a guarded gameplay reset.
export function AdminStorageSection() {
  const toast = useToast();
  const [audit, setAudit] = useState<any[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => api.adminAudit().then(setAudit).catch(() => setAudit([]));
  useEffect(() => { load(); }, []);

  const doReset = async () => {
    setBusy(true);
    try {
      await fetch("/api/admin/reset", { method: "POST" });
      toast("Gameplay state reset (inventories, market, quests cleared).", "success");
      setConfirm(false); load();
    } catch { toast("Reset failed", "error"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <SectionHeader title="Data & Logs" desc="Database operations and the admin audit trail. The catalog (cards, packs, etc.) is stored in your Postgres database." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-tactical"><Database className="size-4" /><span className="font-display font-bold text-white">Storage</span></div>
          <p className="mt-1 text-sm text-slate-400">All content lives in your Postgres database. No browser storage is used in production.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-ascend-bright"><RotateCcw className="size-4" /><span className="font-display font-bold text-white">Reset gameplay</span></div>
          <p className="mt-1 text-sm text-slate-400">Clears inventories, listings, quest progress and synced matches. Keeps the catalog and users.</p>
          <button onClick={() => setConfirm(true)} className="btn-ghost mt-3 px-3 py-1.5 text-xs text-ascend-bright">Reset gameplay state</button>
        </div>
      </div>

      <div className="panel p-5">
        <div className="mb-3 flex items-center gap-2"><ScrollText className="size-4 text-slate-400" /><span className="font-display font-bold text-white">Audit log</span><span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-400">{audit.length}</span></div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {audit.length === 0 ? (
            <p className="text-sm text-slate-500">No admin actions logged yet.</p>
          ) : audit.map((l) => (
            <div key={l.id} className="flex items-center justify-between gap-3 rounded-lg bg-ink-900/50 px-3 py-2 font-mono text-[11px]">
              <span className="text-tactical">{l.action}</span>
              <span className="truncate text-slate-500">{l.target}</span>
              <span className="shrink-0 text-slate-600">{new Date(l.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog open={confirm} title="Reset gameplay state" message="This clears all inventories, market listings, quest progress and synced matches for every user. The catalog and accounts stay. Continue?" confirmLabel={busy ? "Resetting…" : "Reset"} destructive onConfirm={doReset} onCancel={() => setConfirm(false)} />
    </div>
  );
}
