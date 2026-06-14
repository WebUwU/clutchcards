"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { X, FlaskConical, ArrowRight, Sparkles } from "lucide-react";
import type { Card } from "@/types";
import { CardItem } from "./CardItem";
import { useGameData } from "@/components/providers/GameDataProvider";
import { useToast } from "@/components/ui/Toast";
import { rarityLabel, rarityOrder } from "@/lib/utils";

const nextRarity: Record<string, string> = {
  common: "uncommon", uncommon: "rare", rare: "epic",
  epic: "legendary", legendary: "mythic", mythic: "mythic",
};

export function FusionPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const { inventory } = useGameData();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Real duplicates only — cards the user actually owns 2+ of.
  const fusable = useMemo(
    () => inventory
      .filter((i) => i.amount > 1 && i.card.tradable)
      .map((i) => ({ ...i.card, ownedAmount: i.amount } as Card)),
    [inventory],
  );

  const selectedCards = fusable.filter((c) => selected.has(c.id));
  const resultRarity = useMemo<string | null>(() => {
    if (selectedCards.length < 2) return null;
    const highest = selectedCards.reduce<string>((acc, c) => {
      const rk = (c as { rarityId?: string }).rarityId ?? c.rarity;
      return rarityOrder[rk] > rarityOrder[acc] ? rk : acc;
    }, "common");
    return nextRarity[highest];
  }, [selectedCards]);

  const toggle = (card: Card) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(card.id) ? next.delete(card.id) : next.add(card.id);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/85 p-4 backdrop-blur"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong flex max-h-[88vh] w-full max-w-3xl flex-col rounded-2xl p-5 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-5 text-tactical" />
                <h3 className="font-display text-lg font-bold text-white">Fusion Forge</h3>
                <span className="chip bg-rarity-legendary/10 text-rarity-legendary ring-1 ring-rarity-legendary/30">Coming soon</span>
              </div>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-400">
              Combine duplicate cards into one of a higher rarity. Fusion will cost Free Coins —
              never Premium Coins, and never pays out real value.
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {fusable.length === 0 ? (
                <div className="grid place-items-center py-12 text-center">
                  <Sparkles className="size-7 text-slate-600" />
                  <p className="mt-2 text-sm text-slate-400">You have no duplicate cards to fuse yet.</p>
                  <p className="mt-0.5 text-xs text-slate-600">Open packs to collect duplicates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {fusable.map((c) => (
                    <CardItem key={c.id} card={c} selectable selected={selected.has(c.id)} onClick={toggle} />
                  ))}
                </div>
              )}
            </div>

            {fusable.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 rounded-xl bg-ink-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-slate-400">{selectedCards.length} selected</span>
                  {resultRarity && (
                    <>
                      <ArrowRight className="size-4 text-slate-600" />
                      <span className="font-display font-semibold text-tactical">{rarityLabel[resultRarity]} card</span>
                    </>
                  )}
                </div>
                <button onClick={() => toast("Fusion is coming soon!", "info")} disabled={selectedCards.length < 2} className="btn-cyan disabled:opacity-50">
                  Fuse (soon)
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
