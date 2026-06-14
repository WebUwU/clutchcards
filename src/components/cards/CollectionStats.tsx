"use client";

import { Library, Copy, Star, Sparkles } from "lucide-react";

export function CollectionStats({ owned, total, duplicates, completion }: {
  owned: number; total: number; duplicates: number; completion: number;
}) {
  const stats = [
    { label: "Owned", value: `${owned}/${total}`, icon: Library },
    { label: "Completion", value: `${completion}%`, icon: Sparkles },
    { label: "Duplicates", value: duplicates, icon: Copy },
    { label: "Unique", value: owned, icon: Star },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="panel p-3">
          <s.icon className="mb-1 size-4 text-slate-500" />
          <div className="font-display text-lg font-bold text-white">{s.value}</div>
          <div className="text-[11px] text-slate-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
