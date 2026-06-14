"use client";

import type { CardSet } from "@/types";

export function SetProgressCard({ set, owned, total }: { set: CardSet; owned: number; total: number }) {
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ background: set.accentColor }} />
          <span className="font-display text-sm font-bold text-white">{set.name}</span>
        </div>
        <span className="font-mono text-xs text-slate-400">{owned}/{total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: set.accentColor }} />
      </div>
      <div className="mt-1.5 text-right font-mono text-[10px] text-slate-500">{pct}% complete</div>
    </div>
  );
}
