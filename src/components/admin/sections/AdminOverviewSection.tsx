"use client";

import { useMemo } from "react";
import { SectionHeader, } from "./AdminCardsSection";
import { AdminTabKey } from "../admin-tabs";
import {
  resolveCards, resolveCardSets, resolvePacks, resolveQuests,
  resolveShopItems, resolveRarities, resolveCardTypes,
} from "@/lib/registry";
import { Layers, Boxes, Package, Swords, ShoppingBag, Gem, Shapes, ArrowRight } from "lucide-react";

export function AdminOverviewSection({ go }: { go: (key: AdminTabKey) => void }) {
  const counts = useMemo(() => ({
    cards: resolveCards().length,
    sets: resolveCardSets().length,
    packs: resolvePacks().length,
    quests: resolveQuests().length,
    shop: resolveShopItems().length,
    rarities: resolveRarities().length,
    types: resolveCardTypes().length,
  }), []);

  const tiles: { key: AdminTabKey; label: string; value: number; icon: typeof Layers }[] = [
    { key: "cards", label: "Cards", value: counts.cards, icon: Layers },
    { key: "sets", label: "Card Sets", value: counts.sets, icon: Boxes },
    { key: "packs", label: "Packs", value: counts.packs, icon: Package },
    { key: "quests", label: "Quests", value: counts.quests, icon: Swords },
    { key: "shop", label: "Shop Items", value: counts.shop, icon: ShoppingBag },
    { key: "rarities", label: "Rarities", value: counts.rarities, icon: Gem },
    { key: "types", label: "Card Types", value: counts.types, icon: Shapes },
  ];

  return (
    <div>
      <SectionHeader title="Overview" desc="A snapshot of everything managed in this local instance. Click a tile to jump in." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <button key={t.key} onClick={() => go(t.key)}
            className="group panel p-4 text-left transition-colors hover:border-ascend/30">
            <div className="mb-3 flex items-center justify-between">
              <t.icon className="size-5 text-slate-500 group-hover:text-ascend" />
              <ArrowRight className="size-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-ascend" />
            </div>
            <div className="font-display text-2xl font-bold text-white">{t.value}</div>
            <div className="text-xs text-slate-400">{t.label}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 panel p-5">
        <h3 className="mb-2 font-display text-sm font-bold text-white">Closed economy</h3>
        <p className="text-sm leading-relaxed text-slate-400">
          This platform is a closed collectible economy. Premium Coins can be bought and converted
          one-way into Free Coins, but nothing converts back to real value. There is no cashout,
          no gift cards, no crypto and no external transfers. All cards, packs and rewards are
          digital collectibles with no monetary value.
        </p>
      </div>
    </div>
  );
}
