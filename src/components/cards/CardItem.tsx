"use client";

import { motion } from "framer-motion";
import { Lock, Copy } from "lucide-react";
import type { Card } from "@/types";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { rarityColor, gradientFor, cn } from "@/lib/utils";
import { useState } from "react";

export function CardItem({
  card,
  onClick,
  selectable = false,
  selected = false,
}: {
  card: Card;
  onClick?: (card: Card) => void;
  selectable?: boolean;
  selected?: boolean;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const owned = card.ownedAmount > 0;
  const rarityKey = (card as { rarityId?: string }).rarityId ?? card.rarity;
  const typeKey = (card as { typeId?: string }).typeId ?? card.type;
  const color = rarityColor[rarityKey];

  return (
    <motion.button
      type="button"
      onClick={() => onClick?.(card)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl border bg-ink-800/80 text-left shadow-card transition-shadow",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        selected ? "ring-2 ring-tactical" : "border-white/[0.06]"
      )}
      style={{ boxShadow: owned ? `0 0 0 1px ${color}33, 0 8px 30px -12px ${color}66` : undefined, ["--rc" as string]: color }}
    >
      {/* Art */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.image}
            alt={card.name}
            onError={() => setImgFailed(true)}
            className={cn(
              "size-full object-cover transition-transform duration-500 group-hover:scale-105",
              !owned && "opacity-40 grayscale"
            )}
          />
        ) : (
          <div
            className={cn("size-full transition-transform duration-500 group-hover:scale-105", !owned && "opacity-40 grayscale")}
            style={{ background: gradientFor(card.id) }}
          >
            <div className="grid size-full place-items-center">
              <span className="font-display text-4xl font-bold text-white/15">{card.name.charAt(0)}</span>
            </div>
          </div>
        )}

        {/* top-edge glow line in rarity color */}
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />

        {/* gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

        {/* status corner */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
          {!owned && (
            <span className="flex items-center gap-1 rounded-md bg-ink-950/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 backdrop-blur">
              <Lock className="size-3" /> Locked
            </span>
          )}
          {card.ownedAmount > 1 && (
            <span className="flex items-center gap-1 rounded-md bg-ink-950/80 px-1.5 py-0.5 font-mono text-[10px] text-tactical backdrop-blur">
              <Copy className="size-3" /> ×{card.ownedAmount}
            </span>
          )}
        </div>

        {/* name + rarity */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <RarityBadge rarity={rarityKey} className="mb-1.5" />
          <h3 className="truncate font-display text-sm font-bold text-white">{card.name}</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
            {typeKey} · {card.role}
          </p>
        </div>

        {selectable && (
          <div className={cn("absolute left-2 top-2 grid size-5 place-items-center rounded-md border transition-colors",
            selected ? "border-tactical bg-tactical text-ink-950" : "border-white/30 bg-ink-950/60")}>
            {selected && <span className="text-xs font-bold">✓</span>}
          </div>
        )}
      </div>
    </motion.button>
  );
}
