"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { X, FlaskConical, ArrowRight, Coins } from "lucide-react";
import type { Card } from "@/types";
import { cards as allCards } from "@/data/cards";
import { currentUser } from "@/data/user";
import { CardItem } from "./CardItem";
import { fusionCost } from "@/lib/economy";
import { useToast } from "@/components/ui/Toast";
import { formatNumber, rarityLabel, rarityOrder } from "@/lib/utils";


// Duplicates = owned more than once and tradable/fusable.
const fusable = allCards.filter((c) => c.ownedAmount > 1);

const nextRarity: Record<string, string> = {
  common: "uncommon", uncommon: "rare", rare: "epic",
  epic: "legendary", legendary: "mythic", mythic: "mythic",
};

export function FusionPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedCards = fusable.filter((c) => selected.has(c.id));
  const cost = selectedCards.length >= 2 ? fusionCost(selectedCards.length) : 0;
  const canAfford = currentUser.freeCoins >= cost;

  const resultRarity = useMemo<string | null>(() => {
    if (selectedCards.length < 2) return null;
    const highest = selectedCards.reduce<string>((acc, c) =>
      rarityOrder[c.rarity] > rarityOrder[acc] ? c.rarity : acc, "common");
    return nextRarity[highest];
  }, [selectedCards]);

  const toggle = (card: Card) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(card.id) ? next.delete(card.id) : next.add(card.id);
      return next;
    });
  };

  const fuse = () => {
    if (selectedCards.length < 2) return toast("Select at least two duplicates.", "error");
    if (!canAfford) return toast("Not enough Free Coins.", "error");
    toast(`Fused ${selectedCards.length} cards into a ${resultRarity} card!`, "success");
    setSelected(new Set());
    onClose();
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
              </div>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-400">
              Combine duplicate cards into one of a higher rarity. Fusion costs Free Coins —
              it never costs Premium Coins and never pays out real value.
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {fusable.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">You have no duplicate cards to fuse yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {fusable.map((c) => (
                    <CardItem key={c.id} card={c} selectable selected={selected.has(c.id)} onClick={toggle} />
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
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
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-mono text-sm text-rarity-legendary">
                  <Coins className="size-4" /> {formatNumber(cost)}
                </span>
                <button onClick={fuse} disabled={selectedCards.length < 2 || !canAfford} className="btn-cyan">
                  Fuse
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
