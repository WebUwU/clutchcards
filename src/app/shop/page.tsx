"use client";

import { useMemo, useState } from "react";
import type { ShopItem, ShopCategory } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { ExchangePanel } from "@/components/shop/ExchangePanel";
import { PurchaseSafetyNotice } from "@/components/shop/PurchaseSafetyNotice";
import { CoinDisplay } from "@/components/ui/CoinDisplay";
import { EmptyState } from "@/components/ui/EmptyState";
import { SignInGate } from "@/components/layout/SignInGate";
import { useToast } from "@/components/ui/Toast";
import { useGameData } from "@/components/providers/GameDataProvider";
import { api } from "@/lib/apiClient";
import { resolveShopItems } from "@/lib/registry";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

type Tab = { key: string; label: string; categories: ShopCategory[] };
const TABS: Tab[] = [
  { key: "coins", label: "Premium Coins", categories: ["premium_bundle"] },
  { key: "cosmetics", label: "Cosmetics", categories: ["cosmetic", "frame", "showcase"] },
  { key: "boosters", label: "Boosters", categories: ["booster", "season_pass"] },
  { key: "packs", label: "Packs", categories: ["pack"] },
  { key: "exchange", label: "Exchange", categories: ["exchange"] },
];

export default function ShopPage() {
  const toast = useToast();
  const { profile, refreshProfile, setProfileLocal } = useGameData();
  const [tab, setTab] = useState<string>("coins");
  const allItems = useMemo(() => resolveShopItems().filter((i) => i.isActive), []);

  const activeTab = TABS.find((t) => t.key === tab)!;
  const items = allItems.filter((i) => activeTab.categories.includes(i.category));

  // Note: shop item purchases (cosmetics/bundles) are display-only for now —
  // premium coins can only be minted by a verified Stripe webhook server-side.
  const purchase = (item: ShopItem) => {
    if (item.category === "premium_bundle") {
      toast("Real-money purchases are not enabled yet (Stripe scaffold).", "info");
      return;
    }
    toast("This item isn't purchasable in this build yet.", "info");
  };

  const exchange = async (premiumSpent: number) => {
    try {
      const res = await api.exchange(premiumSpent);
      setProfileLocal({ premiumCoins: res.premiumCoins, freeCoins: res.freeCoins });
      await refreshProfile();
      toast(`Converted ${premiumSpent} Premium → ${res.freeReceived} Free Coins`, "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Exchange failed", "error");
    }
  };

  return (
    <AppShell>
      <SignInGate>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-ascend/15 text-ascend"><ShoppingBag className="size-5" /></div>
          <div>
            <span className="eyebrow">Store</span>
            <h1 className="font-display text-2xl font-bold text-white">Shop</h1>
          </div>
        </div>
        {profile && (
          <div className="glass flex items-center gap-3 rounded-xl px-4 py-2.5">
            <CoinDisplay type="free" amount={profile.freeCoins} size="sm" />
            <span className="h-4 w-px bg-white/10" />
            <CoinDisplay type="premium" amount={profile.premiumCoins} size="sm" />
          </div>
        )}
      </div>

      <div className="mb-5"><PurchaseSafetyNotice /></div>

      <div className="mb-6 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("shrink-0 rounded-lg px-3.5 py-2 font-display text-sm transition-colors",
              tab === t.key ? "bg-ascend/15 text-ascend ring-1 ring-ascend/30" : "bg-ink-800/60 text-slate-400 hover:text-white")}>
            {t.label}
          </button>
        ))}
      </div>

      {!profile ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink-800/60" />)}</div>
      ) : tab === "exchange" ? (
        <div className="max-w-xl"><ExchangePanel premiumCoins={profile.premiumCoins} onExchange={exchange} /></div>
      ) : items.length === 0 ? (
        <EmptyState title="Nothing here yet" hint="Add items in the admin panel under Shop Items." icon={<ShoppingBag className="size-6" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => <ShopItemCard key={i.id} item={i} onPurchase={purchase} />)}
        </div>
      )}
      </SignInGate>
    </AppShell>
  );
}
