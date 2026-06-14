"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Gem, ShoppingCart } from "lucide-react";
import type { MarketListing } from "@/types";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { rarityColor, gradientFor, formatNumber, timeAgo } from "@/lib/utils";

export function MarketListingCard({
  listing,
  onBuy,
}: {
  listing: MarketListing;
  onBuy: (l: MarketListing) => void;
}) {
  const { card, price, sellerName, listedAt } = listing;
  const [imgFailed, setImgFailed] = useState(false);
  const color = rarityColor[card.rarity];

  return (
    <motion.div whileHover={{ y: -3 }} className="panel overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.image} alt={card.name} onError={() => setImgFailed(true)} className="size-full object-cover" />
        ) : (
          <div className="size-full" style={{ background: gradientFor(card.id) }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
        <div className="absolute left-2 top-2"><RarityBadge rarity={card.rarity} /></div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="truncate font-display text-sm font-bold text-white">{card.name}</h3>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between font-mono text-[11px] text-slate-500">
          <span>by {sellerName}</span>
          <span>{timeAgo(listedAt)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-base font-bold text-tactical">
            <Gem className="size-4" /> {formatNumber(price)}
          </span>
          <button onClick={() => onBuy(listing)} className="btn-primary px-3 py-1.5 text-xs">
            <ShoppingCart className="size-3.5" /> Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
}
