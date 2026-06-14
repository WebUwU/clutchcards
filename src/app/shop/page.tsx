"use client";

import { useMemo, useState } from "react";
import type { ShopItem, ShopCategory } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { ExchangePanel } from "@/components/shop/ExchangePanel";
import { PurchaseSafetyNotice } from "@/components/shop/PurchaseSafetyNotice";
import { CoinDisplay } from "@/components/ui/CoinDisplay";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useLocalDb } from "@/hooks/useLocalDb";
import { resolveShopItems } from "@/lib/registry";
import { saveLocalUser, saveShopPurchase, saveExchange } from "@/lib/localDb";
import { canBuyPremiumItem } from "@/lib/economy";
import { cn, uid } from "@/lib/utils";
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
  const { loading, user, updateUser } = useLocalDb();
  const [tab, setTab] = useState<string>("coins");
  const allItems = useMemo(() => resolveShopItems().filter((i) => i.isActive), []);

  const activeTab = TABS.find((t) => t.key === tab)!;
  const items = allItems.filter((i) => activeTab.categories.includes(i.category));

  const purchase = (item: ShopItem) => {
    if (!user) return;
    if (item.category === "premium_bundle") {
      const grant = item.grantsPremium ?? 0;
      const nextUser = { ...user, premiumCoins: user.premiumCoins + grant };
      updateUser({ premiumCoins: nextUser.premiumCoins }); saveLocalUser(nextUser);
      saveShopPurchase({ id: uid("p"), shopItemId: item.id, name: item.name, paidWith: "real", amount: item.priceReal ?? 0, purchasedAt: new Date().toISOString() });
      toast(`Purchased ${item.name} — +${grant} Premium Coins (demo)`, "success");
      return;
    }
    const gate = canBuyPremiumItem(user, item);
    if (!gate.ok) return toast(gate.reason ?? "Can't purchase.", "error");
    const price = item.pricePremium ?? 0;
    const nextUser = { ...user, premiumCoins: user.premiumCoins - price };
    updateUser({ premiumCoins: nextUser.premiumCoins }); saveLocalUser(nextUser);
    saveShopPurchase({ id: uid("p"), shopItemId: item.id, name: item.name, paidWith: "premium", amount: price, purchasedAt: new Date().toISOString() });
    toast(`Purchased ${item.name}`, "success");
  };

  const exchange = (premiumSpent: number, freeReceived: number) => {
    if (!user) return;
    const nextUser = { ...user, premiumCoins: user.premiumCoins - premiumSpent, freeCoins: user.freeCoins + freeReceived };
    updateUser({ premiumCoins: nextUser.premiumCoins, freeCoins: nextUser.freeCoins }); saveLocalUser(nextUser);
    saveExchange({ id: uid("x"), premiumSpent, freeReceived, at: new Date().toISOString() });
    toast(`Converted ${premiumSpent} Premium → ${freeReceived} Free Coins`, "success");
  };

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-ascend/15 text-ascend"><ShoppingBag className="size-5" /></div>
          <div>
            <span className="eyebrow">Store</span>
            <h1 className="font-display text-2xl font-bold text-white">Shop</h1>
          </div>
        </div>
        {user && (
          <div className="glass flex items-center gap-3 rounded-xl px-4 py-2.5">
            <CoinDisplay type="free" amount={user.freeCoins} size="sm" />
            <span className="h-4 w-px bg-white/10" />
            <CoinDisplay type="premium" amount={user.premiumCoins} size="sm" />
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

      {loading || !user ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-ink-800/60" />)}</div>
      ) : tab === "exchange" ? (
        <div className="max-w-xl"><ExchangePanel user={user} onExchange={exchange} /></div>
      ) : items.length === 0 ? (
        <EmptyState title="Nothing here yet" hint="Add items in the admin panel under Shop Items." icon={<ShoppingBag className="size-6" />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => <ShopItemCard key={i.id} item={i} onPurchase={purchase} />)}
        </div>
      )}
    </AppShell>
  );
}
