"use client";

import { useMemo } from "react";
import { getPackDropPreview } from "@/lib/packs";
import { resolveRarities } from "@/lib/registry";
import { rarityLabel } from "@/lib/utils";

export function DropRateTable({ packId }: { packId: string }) {
  const preview = useMemo(() => getPackDropPreview(packId), [packId]);
  const rarities = useMemo(() => resolveRarities(), []);
  const colorOf = (id: string) => rarities.find((r) => r.id === id)?.color ?? "#9aa4b2";

  if (preview.length === 0) return null;

  return (
    <div className="space-y-2">
      {preview.map((row) => (
        <div key={row.rarityId} className="flex items-center gap-3">
          <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-wider" style={{ color: colorOf(row.rarityId) }}>
            {rarityLabel[row.rarityId]}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700">
            <div className="h-full rounded-full" style={{ width: `${Math.max(row.pct, 1.5)}%`, background: colorOf(row.rarityId) }} />
          </div>
          <span className="w-12 shrink-0 text-right font-mono text-[11px] text-slate-400">{row.pct.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}
