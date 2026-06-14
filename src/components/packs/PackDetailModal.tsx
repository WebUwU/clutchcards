"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Coins, Gem, Layers, Boxes } from "lucide-react";
import type { Pack } from "@/types";
import { DropRateTable } from "./DropRateTable";
import { PackSafetyNotice } from "./PackSafetyNotice";
import { resolveCardSets } from "@/lib/registry";
import { gradientFor } from "@/lib/utils";
import { useState } from "react";

export function PackDetailModal({ pack, canAfford, onClose, onOpen }: {
  pack: Pack | null;
  canAfford: boolean;
  onClose: () => void;
  onOpen: (p: Pack) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const sets = resolveCardSets();
  const allowed = pack ? sets.filter((s) => pack.allowedSetIds.includes(s.id)) : [];

  return (
    <AnimatePresence>
      {pack && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/85 p-4 backdrop-blur" onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-lg overflow-hidden rounded-2xl shadow-card"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              {!imgFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pack.image} alt={pack.name} onError={() => setImgFailed(true)} className="size-full object-cover" />
              ) : (
                <div className="size-full" style={{ background: gradientFor(pack.id) }} />
              )}
              <button onClick={onClose} className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-ink-950/70 text-slate-300 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{pack.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{pack.description}</p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-300"><Layers className="size-4 text-slate-500" />{pack.cardCount} cards</span>
                {pack.guaranteedRarity && <span className="flex items-center gap-1.5 capitalize text-slate-300"><Boxes className="size-4 text-slate-500" />Guaranteed {pack.guaranteedRarity}</span>}
                <span className="flex items-center gap-1.5 font-semibold">
                  {pack.pricePremiumCoins > 0
                    ? <><Gem className="size-4 text-rarity-legendary" /><span className="text-rarity-legendary">{pack.pricePremiumCoins}</span></>
                    : <><Coins className="size-4 text-tactical" /><span className="text-tactical">{pack.priceFreeCoins}</span></>}
                </span>
              </div>

              {allowed.length > 0 && (
                <div>
                  <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-500">Possible sets</div>
                  <div className="flex flex-wrap gap-1.5">
                    {allowed.map((s) => (
                      <span key={s.id} className="rounded-lg bg-ink-800 px-2.5 py-1 text-xs text-slate-300">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">Drop rates</div>
                <DropRateTable packId={pack.id} />
              </div>

              <PackSafetyNotice />

              <button
                onClick={() => onOpen(pack)}
                disabled={!canAfford}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {canAfford ? "Open pack" : "Not enough coins"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
