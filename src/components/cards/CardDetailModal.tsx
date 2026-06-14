"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Copy, Tag } from "lucide-react";
import { useState } from "react";
import type { Card } from "@/types";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { gradientFor, rarityColor } from "@/lib/utils";
import { resolveCardSets } from "@/lib/registry";

export function CardDetailModal({ card, onClose }: { card: Card | null; onClose: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const sets = resolveCardSets();

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center bg-ink-950/85 p-4 backdrop-blur" onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong grid w-full max-w-2xl gap-5 rounded-2xl p-5 sm:grid-cols-2"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl" style={{ boxShadow: `0 0 24px ${rarityColor[card.rarityId]}44` }}>
              {!imgFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.image} alt={card.name} onError={() => setImgFailed(true)} className="size-full object-cover" />
              ) : (
                <div className="size-full" style={{ background: gradientFor(card.id) }} />
              )}
            </div>
            <div className="relative">
              <button onClick={onClose} className="absolute right-0 top-0 grid size-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <X className="size-4" />
              </button>
              <RarityBadge rarity={card.rarityId} />
              <h2 className="mt-2 font-display text-2xl font-bold text-white">{card.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.description}</p>

              <dl className="mt-4 space-y-1.5 text-sm">
                <Row label="Set" value={sets.find((s) => s.id === card.setId)?.name ?? card.setId} />
                <Row label="Type" value={card.typeId} />
                <Row label="Role" value={card.role} />
                <Row label="Owned" value={`${card.ownedAmount}`} />
                <Row label="Tradable" value={card.tradable ? "Yes" : "No"} />
                <Row label="Fusion value" value={`${card.fusionValue} FC`} />
              </dl>

              {card.ownedAmount > 1 && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-tactical/10 px-2.5 py-1 text-xs text-tactical">
                  <Copy className="size-3.5" /> {card.ownedAmount - 1} duplicate{card.ownedAmount - 1 > 1 ? "s" : ""}
                </div>
              )}

              {card.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {card.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-md bg-ink-800 px-2 py-0.5 text-[11px] text-slate-400">
                      <Tag className="size-2.5" />{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-1.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium capitalize text-slate-200">{value}</dd>
    </div>
  );
}
