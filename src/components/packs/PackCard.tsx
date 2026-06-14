"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Coins, Gem, Layers, Sparkles, Lock } from "lucide-react";
import type { Pack } from "@/types";
import { gradientFor } from "@/lib/utils";

export function PackCard({ pack, onOpen, onDetails }: { pack: Pack; onOpen: (p: Pack) => void; onDetails: (p: Pack) => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isPremium = pack.pricePremiumCoins > 0;
  const accent = isPremium ? "#ffb017" : "#1ce5d4";

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="card-surface group flex flex-col">
      {/* accent glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-50" style={{ background: accent }} />

      <button onClick={() => onDetails(pack)} className="relative block w-full text-left">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pack.image} alt={pack.name} onError={() => setImgFailed(true)} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="size-full transition-transform duration-500 group-hover:scale-105" style={{ background: gradientFor(pack.id) }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

          {/* Free / Premium badge */}
          <span className="absolute left-2.5 top-2.5 chip ring-1" style={{ background: `${accent}1a`, color: accent, borderColor: `${accent}44` }}>
            {isPremium ? <><Gem className="size-3" /> Premium</> : <><Sparkles className="size-3" /> Free</>}
          </span>
          {pack.guaranteedRarity && (
            <span className="absolute right-2.5 top-2.5 chip bg-ink-950/80 text-white ring-1 ring-white/10">
              <Lock className="size-3" /> {pack.guaranteedRarity}+
            </span>
          )}
        </div>
      </button>

      <div className="relative flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-white">{pack.name}</h3>
          <span className="flex shrink-0 items-center gap-1 font-mono text-[11px] text-slate-500"><Layers className="size-3" />{pack.cardCount} cards</span>
        </div>
        <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-slate-400">{pack.description}</p>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-mono text-base font-bold" style={{ color: accent }}>
            {isPremium ? <Gem className="size-4" /> : <Coins className="size-4" />}
            {isPremium ? pack.pricePremiumCoins : pack.priceFreeCoins}
          </span>
          <div className="flex gap-2">
            <button onClick={() => onDetails(pack)} className="btn-ghost px-3 py-2 text-xs">Odds</button>
            <button onClick={() => onOpen(pack)} className="btn-primary px-4 py-2 text-xs">Open Pack</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
