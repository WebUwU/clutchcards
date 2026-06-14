"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { X, Gem, Info } from "lucide-react";
import type { Card } from "@/types";
import { calculateMarketFee, calculateSellerPayout, canListCard, MARKET_FEE_RATE } from "@/lib/economy";
import { rarityColor, gradientFor, formatNumber } from "@/lib/utils";

export function SellModal({
  card,
  open,
  onClose,
  onList,
}: {
  card: Card | null;
  open: boolean;
  onClose: () => void;
  onList: (card: Card, price: number) => void;
}) {
  const [price, setPrice] = useState(300);

  if (!card) return null;
  const gate = canListCard(card);
  const fee = calculateMarketFee(price);
  const payout = calculateSellerPayout(price);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-md rounded-2xl p-5 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">List on Market</h3>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl" style={{ background: gradientFor(card.id), boxShadow: `0 0 0 1px ${rarityColor[(card as any).rarityId ?? card.rarity]}44` }} />
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-bold text-white">{card.name}</h4>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-slate-500">{(card as any).typeId ?? card.type} · {card.role}</p>
                <p className="mt-2 text-xs text-slate-400">Owned: ×{card.ownedAmount}</p>
              </div>
            </div>

            {!gate.ok ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-ascend/10 px-3 py-2.5 text-xs text-ascend-bright ring-1 ring-ascend/20">
                <Info className="mt-0.5 size-4 shrink-0" /> {gate.reason}
              </div>
            ) : (
              <>
                <label className="mt-4 block">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Price (Premium Coins)</span>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900 px-3 py-2.5 focus-within:border-tactical">
                    <Gem className="size-4 text-tactical" />
                    <input
                      type="number" min={1} value={price}
                      onChange={(e) => setPrice(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-transparent font-mono text-sm text-white outline-none"
                    />
                  </div>
                </label>

                <div className="mt-4 space-y-1.5 rounded-xl bg-ink-900/60 p-3 font-mono text-xs">
                  <div className="flex justify-between text-slate-400"><span>List price</span><span>{formatNumber(price)}</span></div>
                  <div className="flex justify-between text-slate-400"><span>Platform fee ({MARKET_FEE_RATE * 100}%)</span><span>−{formatNumber(fee)}</span></div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5 font-semibold text-tactical"><span>You receive</span><span>{formatNumber(payout)}</span></div>
                </div>

                <button onClick={() => onList(card, price)} className="btn-primary mt-4 w-full">
                  Confirm Listing
                </button>
                <p className="mt-2 text-center text-[10px] text-slate-500">
                  Premium Coins stay inside the platform and cannot be withdrawn.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
