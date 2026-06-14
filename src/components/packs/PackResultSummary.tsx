"use client";

import type { Card } from "@/types";
import { CardReveal } from "./CardReveal";
import { rarityLabel } from "@/lib/utils";

export function PackResultSummary({
  cards, highestRarityId, reduceMotion,
}: {
  cards: Card[];
  highestRarityId: string;
  reduceMotion: boolean;
}) {
  return (
    <div>
      <div className="mb-4 text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Best pull</div>
        <div className="font-display text-lg font-bold text-white">{rarityLabel[highestRarityId]}</div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {cards.map((c, i) => (
          <CardReveal key={`${c.id}-${i}`} card={c} index={i} reduceMotion={reduceMotion} />
        ))}
      </div>
    </div>
  );
}
