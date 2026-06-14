"use client";

import { useEffect, useState } from "react";
import type { PackOpeningHistoryEntry } from "@/types";
import { getPackOpeningHistory } from "@/lib/localDb";
import { rarityLabel, rarityColor } from "@/lib/utils";
import { History } from "lucide-react";

export function PackOpeningHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [history, setHistory] = useState<PackOpeningHistoryEntry[]>([]);
  useEffect(() => { setHistory(getPackOpeningHistory()); }, [refreshKey]);

  if (history.length === 0) return null;

  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <History className="size-4 text-slate-500" />
        <h3 className="font-display text-sm font-bold text-white">Recent openings</h3>
      </div>
      <div className="space-y-2">
        {history.slice(0, 8).map((h) => (
          <div key={h.id} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-ink-900/40 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm text-slate-200">{h.packName}</div>
              <div className="font-mono text-[10px] text-slate-500">{new Date(h.openedAt).toLocaleString()}</div>
            </div>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider" style={{ color: rarityColor[h.highestRarityId] }}>
              {rarityLabel[h.highestRarityId]} · {h.cardIds.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
