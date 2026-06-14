"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Store, Tag, Plus, Gem } from "lucide-react";
import type { MarketListing, Card } from "@/types";
import { marketListings as seedListings } from "@/data/market";
import { AppShell } from "@/components/layout/AppShell";
import { MarketListingCard } from "@/components/market/MarketListingCard";
import { SellModal } from "@/components/market/SellModal";
import { SellInventoryPanel } from "@/components/market/SellInventoryPanel";
import { MarketSafetyNotice } from "@/components/market/MarketSafetyNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useLocalDb } from "@/hooks/useLocalDb";
import { canBuyListing } from "@/lib/economy";
import { getMarketListings, saveMarketListings, saveLocalUser } from "@/lib/localDb";
import { resolveCards, resolveRarities, resolveEconomyConfig } from "@/lib/registry";
import { withOwnedAmounts } from "@/lib/cards";
import { calculateSellerReceives, calculateListingFee } from "@/lib/economy";
import { rarityOrder, cn, formatNumber, uid } from "@/lib/utils";

type Sort = "cheapest" | "newest" | "rarity";

export default function MarketPage() {
  const toast = useToast();
  const { user, collection, updateUser } = useLocalDb();
  const rarities = useMemo(() => resolveRarities(), []);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<string | "all">("all");
  const [sort, setSort] = useState<Sort>("cheapest");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [sellCard, setSellCard] = useState<Card | null>(null);

  // Hydrate listings from local DB (seed on first run).
  useEffect(() => {
    const stored = getMarketListings();
    if (stored) setListings(stored);
    else { setListings(seedListings); saveMarketListings(seedListings); }
  }, []);

  const persist = (next: MarketListing[]) => { setListings(next); saveMarketListings(next); };

  const sellableDuplicates = useMemo(() => {
    const live = withOwnedAmounts(resolveCards().filter((c) => c.isActive), collection);
    return live.filter((c) => c.tradable && c.ownedAmount > 1);
  }, [collection]);

  const view = useMemo(() => {
    const list = listings
      .filter((l) => (rarity === "all" ? true : l.card.rarityId === rarity))
      .filter((l) => l.card.name.toLowerCase().includes(query.toLowerCase()));
    list.sort((a, b) => {
      if (sort === "cheapest") return a.price - b.price;
      if (sort === "newest") return +new Date(b.listedAt) - +new Date(a.listedAt);
      return rarityOrder[b.card.rarityId] - rarityOrder[a.card.rarityId];
    });
    return list;
  }, [listings, query, rarity, sort]);

  const buy = (l: MarketListing) => {
    if (!user) return;
    if (l.sellerName === user.username) {
      // Cancel own listing
      persist(listings.filter((x) => x.id !== l.id));
      toast(`Cancelled your listing of ${l.card.name}`, "info");
      return;
    }
    const gate = canBuyListing(user, l);
    if (!gate.ok) return toast(gate.reason!, "error");
    const nextUser = { ...user, premiumCoins: user.premiumCoins - l.price };
    updateUser({ premiumCoins: nextUser.premiumCoins });
    saveLocalUser(nextUser);
    persist(listings.filter((x) => x.id !== l.id));
    toast(`Purchased ${l.card.name} for ${l.price} Premium Coins`, "success");
  };

  const listCard = (card: Card, price: number) => {
    if (!user) return;
    const cfg = resolveEconomyConfig();
    const receives = Math.max(0, calculateSellerReceives(price, cfg) - calculateListingFee(cfg));
    const newListing: MarketListing = {
      id: uid("m"), card: { ...card, ownedAmount: 1 }, price,
      sellerName: user.username, listedAt: new Date().toISOString(), ownListing: true,
    };
    persist([newListing, ...listings]);
    setSellCard(null);
    toast(`Listed ${card.name} — you'll receive ${receives} Premium Coins after fees`, "success");
  };

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Community market</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Market</h1>
          <p className="mt-1 text-sm text-slate-400">Trade tradable cards with other players using Premium Coins.</p>
        </div>
        <div className="flex items-center gap-3">
          {user && <span className="flex items-center gap-1.5 text-sm text-rarity-legendary"><Gem className="size-4" />{formatNumber(user.premiumCoins)}</span>}
          <button onClick={() => setInventoryOpen(true)} className="btn-primary"><Plus className="size-4" /> Sell a card</button>
        </div>
      </div>

      <div className="mb-5"><MarketSafetyNotice /></div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 focus-within:border-ascend/40">
          <Search className="size-4 text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search listings…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
        </div>
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-slate-500" />
          {(["cheapest", "newest", "rarity"] as Sort[]).map((s) => (
            <button key={s} onClick={() => setSort(s)} className={cn("rounded-lg px-3 py-1.5 font-mono text-xs capitalize transition-colors", sort === s ? "bg-ascend/15 text-ascend ring-1 ring-ascend/30" : "bg-ink-800/60 text-slate-400 hover:text-white ring-1 ring-white/[0.06]")}>{s}</button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={rarity === "all"} onClick={() => setRarity("all")}>All</Chip>
        {rarities.map((r) => <Chip key={r.id} active={rarity === r.id} onClick={() => setRarity(r.id)}>{r.name}</Chip>)}
      </div>

      {view.length === 0 ? (
        <EmptyState title="No listings found" hint="Try a different filter, or list one of your own cards." icon={<Store className="size-6" />} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {view.map((l) => <MarketListingCard key={l.id} listing={l} onBuy={buy} />)}
        </div>
      )}

      <SellInventoryPanel open={inventoryOpen} cards={sellableDuplicates}
        onPick={(c) => { setInventoryOpen(false); setSellCard(c); }} onClose={() => setInventoryOpen(false)} />
      <SellModal card={sellCard} open={!!sellCard} onClose={() => setSellCard(null)} onList={listCard} />
    </AppShell>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-lg px-3 py-1.5 font-mono text-xs transition-colors", active ? "bg-ascend/15 text-ascend ring-1 ring-ascend/30" : "bg-ink-800/60 text-slate-400 hover:text-white ring-1 ring-white/[0.06]")}>{children}</button>
  );
}
