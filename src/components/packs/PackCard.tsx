"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Coins, Gem, Layers } from "lucide-react";
import type { Pack } from "@/types";
import { gradientFor } from "@/lib/utils";

export function PackCard({ pack, onOpen, onDetails }: { pack: Pack; onOpen: (p: Pack) => void; onDetails: (p: Pack) => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const priceLabel = pack.pricePremiumCoins > 0
    ? <span className="flex items-center gap-1 text-rarity-legendary"><Gem className="size-3.5" />{pack.pricePremiumCoins}</span>
    : <span className="flex items-center gap-1 text-tactical"><Coins className="size-3.5" />{pack.priceFreeCoins}</span>;

  return (
    <motion.div whileHover={{ y: -4 }} className="panel overflow-hidden">
      <button onClick={() => onDetails(pack)} className="block w-full text-left">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pack.image} alt={pack.name} onError={() => setImgFailed(true)} className="size-full object-cover" />
          ) : (
            <div className="size-full" style={{ background: gradientFor(pack.id) }} />
          )}
          {pack.guaranteedRarity && (
            <span className="absolute left-2 top-2 rounded-md bg-ink-950/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white ring-1 ring-white/10">
              Guaranteed {pack.guaranteedRarity}
            </span>
          )}
        </div>
      </button>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">{pack.name}</h3>
          <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500"><Layers className="size-3" />{pack.cardCount}</span>
        </div>
        <p className="mb-3 line-clamp-2 text-xs text-slate-400">{pack.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold">{priceLabel}</span>
          <button onClick={() => onOpen(pack)} className="btn-primary px-3 py-1.5 text-xs">Open</button>
        </div>
      </div>
    </motion.div>
  );
}
