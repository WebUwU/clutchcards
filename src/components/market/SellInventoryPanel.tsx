"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Card } from "@/types";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { gradientFor } from "@/lib/utils";

// Lets the user pick one of their tradable duplicates to list.
export function SellInventoryPanel({ open, cards, onPick, onClose }: {
  open: boolean;
  cards: Card[];
  onPick: (card: Card) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur" onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-lg rounded-2xl p-5 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Sell from inventory</h3>
                <p className="text-xs text-slate-400">Only tradable duplicates can be listed.</p>
              </div>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                You have no tradable duplicates to sell. Open packs to find more!
              </div>
            ) : (
              <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                {cards.map((c) => (
                  <button key={c.id} onClick={() => onPick(c)} className="group text-left">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cover ring-1 ring-white/10 transition group-hover:ring-tactical/50"
                      style={{ backgroundImage: `url(${c.image})`, backgroundColor: "#1b1f29" }}>
                      <span className="absolute right-1 top-1 rounded bg-ink-950/80 px-1.5 py-0.5 font-mono text-[10px] text-white">×{c.ownedAmount}</span>
                    </div>
                    <div className="mt-1 truncate text-xs font-medium text-white">{c.name}</div>
                    <RarityBadge rarity={c.rarityId} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
