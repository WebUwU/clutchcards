"use client";

import { useMemo } from "react";
import { resolveEconomyConfig } from "@/lib/registry";
import { calculateMarketFee, calculateListingFee, calculateSellerReceives } from "@/lib/economy";
import { Gem } from "lucide-react";

export function ListingFeePreview({ price }: { price: number }) {
  const cfg = useMemo(() => resolveEconomyConfig(), []);
  const marketFee = calculateMarketFee(price, cfg);
  const listingFee = calculateListingFee(cfg);
  const receives = Math.max(0, calculateSellerReceives(price, cfg) - listingFee);

  return (
    <div className="space-y-1.5 rounded-xl border border-white/[0.06] bg-ink-900/50 p-3 text-sm">
      <Row label="List price" value={price} />
      <Row label={`Market fee (${Math.round(cfg.marketFeeRate * 100)}%)`} value={-marketFee} muted />
      <Row label="Listing fee" value={-listingFee} muted />
      <div className="my-1 h-px bg-white/[0.06]" />
      <Row label="You receive" value={receives} highlight />
    </div>
  );
}

function Row({ label, value, muted, highlight }: { label: string; value: number; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-slate-500" : "text-slate-300"}>{label}</span>
      <span className={`flex items-center gap-1 font-mono ${highlight ? "font-bold text-rarity-legendary" : muted ? "text-slate-500" : "text-slate-200"}`}>
        <Gem className="size-3" />{value}
      </span>
    </div>
  );
}
