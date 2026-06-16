"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/apiClient";
import { useToast } from "@/components/ui/Toast";

// Compact "Check Matches" button for the profile header.
export function MatchSyncButton({ onSynced }: { onSynced?: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const sync = async () => {
    setBusy(true);
    try {
      const res = await api.syncMatches();
      toast(`Synced ${res.added} new match${res.added === 1 ? "" : "es"}`, "success");
      onSynced?.();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Sync failed", "error");
    } finally { setBusy(false); }
  };

  return (
    <button onClick={sync} disabled={busy} className="btn-cyan px-4 py-2 text-sm disabled:opacity-60">
      <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} /> Check Matches
    </button>
  );
}

// Topbar variant: only shows when a Riot account is linked. Self-contained
// so it can sit in the navbar on every page.
export function TopbarMatchSync() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    api.me().then((d: any) => setLinked(!!d?.valorant)).catch(() => setLinked(false));
  }, []);

  if (!linked) return null;

  const sync = async () => {
    setBusy(true);
    try {
      const res = await api.syncMatches();
      toast(res.added > 0 ? `Synced ${res.added} new match${res.added === 1 ? "" : "es"}!` : "You're up to date — no new matches.", res.added > 0 ? "success" : "info");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Sync failed", "error");
    } finally { setBusy(false); }
  };

  return (
    <button onClick={sync} disabled={busy} title="Check Valorant matches"
      className="hidden items-center gap-1.5 rounded-lg bg-tactical/10 px-3 py-1.5 font-mono text-xs font-semibold text-tactical ring-1 ring-tactical/20 transition-colors hover:bg-tactical/20 disabled:opacity-60 sm:inline-flex">
      <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
      {busy ? "Syncing…" : "Check Matches"}
    </button>
  );
}

// Sidebar variant: full-width button shown when a Riot account is linked.
// Lives at the bottom of the sidebar so "Check Matches" is always one click away.
export function SidebarMatchSync() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [linked, setLinked] = useState(false);
  const [last, setLast] = useState<string | null>(null);

  const refresh = () => api.me().then((d: any) => {
    setLinked(!!d?.valorant);
    setLast(d?.valorant?.lastSync ?? null);
  }).catch(() => setLinked(false));

  useEffect(() => { refresh(); }, []);

  if (!linked) return null;

  const sync = async () => {
    setBusy(true);
    try {
      const res = await api.syncMatches();
      toast(res.added > 0 ? `Synced ${res.added} new match${res.added === 1 ? "" : "es"}!` : "You're up to date — no new matches.", res.added > 0 ? "success" : "info");
      refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Sync failed", "error");
    } finally { setBusy(false); }
  };

  const ago = last ? timeAgo(new Date(last)) : null;

  return (
    <button onClick={sync} disabled={busy} title="Check your latest Valorant matches"
      className="flex w-full items-center gap-2.5 rounded-xl bg-tactical/10 px-3 py-2.5 text-left ring-1 ring-tactical/20 transition-colors hover:bg-tactical/15 disabled:opacity-60">
      <RefreshCw className={`size-4 shrink-0 text-tactical ${busy ? "animate-spin" : ""}`} />
      <span className="min-w-0">
        <span className="block font-display text-xs font-semibold text-white">{busy ? "Syncing…" : "Check Matches"}</span>
        {ago && <span className="block truncate font-mono text-[10px] text-slate-500">Last: {ago}</span>}
      </span>
    </button>
  );
}

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
