"use client";

import { useState } from "react";
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
