"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, SkipForward, RotateCw, Library } from "lucide-react";
import Link from "next/link";
import type { Pack, Card } from "@/types";
import { PackOpeningAnimation } from "./PackOpeningAnimation";
import { PackResultSummary } from "./PackResultSummary";
import { rarityColor, rarityOrder } from "@/lib/utils";
import { playSound } from "@/lib/sound";

type Phase = "idle" | "shaking" | "burst" | "revealed";

// Server-driven: the cards are already rolled & charged on the server. This
// modal just plays the animation and reveals the given result.
export function ServerPackOpeningModal({
  pack, cards, highestRarity, reduceMotion, onClose, onOpenAnother,
}: {
  pack: Pack;
  cards: Card[];
  highestRarity: string;
  reduceMotion: boolean;
  onClose: () => void;
  onOpenAnother: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const eliteColor = rarityColor[highestRarity];

  const reveal = useCallback(() => {
    setPhase("revealed");
    playSound(rarityOrder[highestRarity] >= 4 ? "legendary_hit" : rarityOrder[highestRarity] >= 2 ? "rare_hit" : "card_flip");
  }, [highestRarity]);

  const runSequence = useCallback(() => {
    if (reduceMotion) { reveal(); return; }
    playSound("pack_open");
    setPhase("shaking");
    const t1 = setTimeout(() => setPhase("burst"), 1100);
    const t2 = setTimeout(() => reveal(), 1750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [reduceMotion, reveal]);

  useEffect(() => { const cleanup = runSequence(); return cleanup; }, [runSequence]);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] grid place-items-center bg-ink-950/90 p-4 backdrop-blur-md">
        {phase === "burst" && !reduceMotion && (
          <motion.div className="pointer-events-none absolute inset-0" style={{ background: eliteColor }}
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.35, 0] }} transition={{ duration: 0.6 }} />
        )}
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass-strong relative w-full max-w-2xl rounded-2xl p-5 shadow-card sm:p-6">
          <button onClick={onClose} className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
            <X className="size-4" />
          </button>

          {phase !== "revealed" ? (
            <div>
              <div className="mb-1 text-center font-display text-lg font-bold text-white">Opening {pack.name}</div>
              <p className="mb-2 text-center text-xs text-slate-400">
                {phase === "idle" ? "Preparing…" : phase === "shaking" ? "Something's inside…" : "Here we go!"}
              </p>
              <PackOpeningAnimation pack={pack} phase={phase} eliteColor={eliteColor} />
              {!reduceMotion && (
                <div className="mt-2 flex justify-center">
                  <button onClick={reveal} className="btn-ghost px-4 py-2 text-xs"><SkipForward className="size-3.5" /> Skip animation</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 text-center font-display text-xl font-bold text-white">You unpacked {cards.length} cards!</div>
              <PackResultSummary cards={cards} highestRarityId={highestRarity} reduceMotion={reduceMotion} />
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button onClick={onOpenAnother} className="btn-primary px-4 py-2 text-sm"><RotateCw className="size-4" /> Open another</button>
                <Link href="/collection" className="btn-cyan px-4 py-2 text-sm"><Library className="size-4" /> Go to collection</Link>
                <button onClick={onClose} className="btn-ghost px-4 py-2 text-sm">Close</button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
