"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Card } from "@/types";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { rarityColor, gradientFor, rarityOrder, cn } from "@/lib/utils";

// A single card that flips in. Higher rarities get stronger glow + shine.
export function CardReveal({ card, index, reduceMotion }: { card: Card; index: number; reduceMotion: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = rarityColor[card.rarityId];
  const tier = rarityOrder[card.rarityId];
  const isHigh = tier >= 3; // epic+
  const isElite = tier >= 4; // legendary/mythic

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { rotateY: 180, opacity: 0, scale: 0.8 }}
      animate={reduceMotion ? { opacity: 1 } : { rotateY: 0, opacity: 1, scale: 1 }}
      transition={{ delay: reduceMotion ? index * 0.05 : index * 0.18, type: "spring", stiffness: 220, damping: 20 }}
      className="relative"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        className={cn("relative overflow-hidden rounded-xl border bg-ink-800")}
        style={{
          borderColor: `${color}55`,
          boxShadow: isElite ? `0 0 32px ${color}88` : isHigh ? `0 0 20px ${color}55` : `0 0 0 1px ${color}33`,
        }}
      >
        <div className="relative aspect-[3/4] w-full">
          {!imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.image} alt={card.name} onError={() => setImgFailed(true)} className="size-full object-cover" />
          ) : (
            <div className="size-full" style={{ background: gradientFor(card.id) }} />
          )}
          {/* Shine sweep for elite pulls */}
          {isElite && !reduceMotion && (
            <motion.div
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{ delay: index * 0.18 + 0.4, duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}
        </div>
        <div className="p-2">
          <div className="mb-1 truncate font-display text-xs font-semibold text-white">{card.name}</div>
          <RarityBadge rarity={card.rarityId} />
        </div>
      </div>
    </motion.div>
  );
}
