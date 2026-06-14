"use client";

import { motion } from "framer-motion";
import { Gem, Coins, Sparkles, ArrowRightLeft, Euro } from "lucide-react";
import type { ShopItem } from "@/types";
import { formatNumber, gradientFor } from "@/lib/utils";

export function ShopItemCard({ item, onPurchase }: { item: ShopItem; onPurchase: (i: ShopItem) => void }) {
  const isExchange = item.category === "exchange";
  const isBundle = item.category === "premium_bundle";

  return (
    <motion.div whileHover={{ y: -4 }} className="panel flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden" style={{ background: gradientFor(item.id) }}>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
        {item.badge && (
          <span className="absolute right-2 top-2 rounded-md bg-ascend px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-glow">
            {item.badge}
          </span>
        )}
        <div className="absolute bottom-2 left-3">
          {isBundle ? <Gem className="size-7 text-tactical" /> : isExchange ? <ArrowRightLeft className="size-7 text-rarity-legendary" /> : <Sparkles className="size-7 text-slate-200" />}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-sm font-bold text-white">{item.name}</h3>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-400">{item.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="font-mono text-sm font-bold">
            {item.priceReal != null && (
              <span className="flex items-center gap-1 text-white"><Euro className="size-3.5" />{item.priceReal.toFixed(2)}</span>
            )}
            {item.pricePremium != null && item.priceReal == null && (
              <span className="flex items-center gap-1 text-tactical"><Gem className="size-3.5" />{formatNumber(item.pricePremium)}</span>
            )}
          </div>
          <button onClick={() => onPurchase(item)} className={isExchange ? "btn-ghost px-3 py-1.5 text-xs" : "btn-primary px-3 py-1.5 text-xs"}>
            {isBundle ? "Buy" : isExchange ? "Convert" : "Purchase"}
          </button>
        </div>

        {item.grantsPremium != null && (
          <p className="mt-2 flex items-center gap-1 font-mono text-[11px] text-tactical">
            <Gem className="size-3" /> +{formatNumber(item.grantsPremium)} Premium Coins
          </p>
        )}
        {item.grantsFree != null && (
          <p className="mt-2 flex items-center gap-1 font-mono text-[11px] text-rarity-legendary">
            <Coins className="size-3" /> +{formatNumber(item.grantsFree)} Free Coins
          </p>
        )}
      </div>
    </motion.div>
  );
}
