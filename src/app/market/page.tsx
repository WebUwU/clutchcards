"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Store, Tag, Plus, Gem } from "lucide-react";
import type { Card } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { SignInGate } from "@/components/layout/SignInGate";
import { MarketListingCard } from "@/components/market/MarketListingCard";
import { SellModal } from "@/components/market/SellModal";
import { SellInventoryPanel } from "@/components/market/SellInventoryPanel";
import { MarketSafetyNotice } from "@/components/market/MarketSafetyNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useGameData } from "@/components/providers/GameDataProvider";
import { api } from "@/lib/apiClient";
import { rarityOrder, cn, formatNumber } from "@/lib/utils";

type Sort = "cheapest" | "newest" | "rarity";
interface Listing { id: string; price: number; createdAt: string; sellerName: string; card: any; }

export default function MarketPage() {
  const toast = useToast();
  const { profile, inventory, catalog, refreshProfile, refreshInventory } = useGameData();
  const rarities = useMemo(() => catalog?.rarities ?? [], [catalog]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<string | "all">("all");
  const [sort, setSort] = useState<Sort>("cheapest");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [sellCard, setSellCard] = useState<Card | null>(null);

  const loadListings = () => api.market().then((l) => setListings(l as Listing[])).catch(() => setListings([]));
  useEffect(() => { loadListings(); }, []);

  // Sellable = tradable cards the user owns more than one of.
  const sellableDuplicates = useMemo(
    () => inventory.filter((i) => i.card.tradable && i.amount > 1).map((i) => ({ ...i.card, ownedAmount: i.amount } as Card)),
    [inventory],
  );

  const view = useMemo(() => {
    const list = listings
      .filter((l) => (rarity === "all" ? true : l.card.rarityId === rarity))
      .filter((l) => l.card.name.toLowerCase().includes(query.toLowerCase()));
    list.sort((a, b) => {
      if (sort === "cheapest") return a.price - b.price;
      if (sort === "newest") return +new Date(b.createdAt) - +new Date(a.createdAt);
      return rarityOrder[b.card.rarityId] - rarityOrder[a.card.rarityId];
    });
    return list;
  }, [listings, query, rarity, sort]);

  const buy = async (l: { id: string; sellerName: string; card: any }) => {
    if (!profile) return;
    if (l.sellerName === profile.username) {
      try { await api.cancelListing(l.id); toast(`Cancelled your listing of ${l.card.name}`, "info"); await Promise.all([loadListings(), refreshInventory()]); }
      catch (e) { toast(e instanceof Error ? e.message : "Cancel failed", "error"); }
      return;
    }
    try {
      await api.buy(l.id);
      toast(`Purchased ${l.card.name}`, "success");
      await Promise.all([loadListings(), refreshProfile(), refreshInventory()]);
    } catch (e) { toast(e instanceof Error ? e.message : "Purchase failed", "error"); }
  };

  const listCard = async (card: Card, price: number) => {
    try {
      await api.sell(card.id, price);
      setSellCard(null);
      toast(`Listed ${card.name}`, "success");
      await Promise.all([loadListings(), refreshInventory()]);
    } catch (e) { toast(e instanceof Error ? e.message : "Failed to list", "error"); }
  };

  // Adapt server listing shape to the MarketListingCard's expected props.
  const asCardListing = (l: Listing) => ({
    id: l.id, price: l.price, sellerName: l.sellerName, listedAt: l.createdAt,
    card: { ...l.card, ownedAmount: 1 },
    ownListing: l.sellerName === profile?.username,
  });

  return (
    <AppShell>
      <SignInGate>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Community market</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Market</h1>
          <p className="mt-1 text-sm text-slate-400">Trade tradable cards with other players using Premium Coins.</p>
        </div>
        <div className="flex items-center gap-3">
          {profile && <span className="flex items-center gap-1.5 text-sm text-rarity-legendary"><Gem className="size-4" />{formatNumber(profile.premiumCoins)}</span>}
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
        {rarities.map((r: any) => <Chip key={r.id} active={rarity === r.id} onClick={() => setRarity(r.id)}>{r.name}</Chip>)}
      </div>

      {view.length === 0 ? (
        <EmptyState title="No listings found" hint="Try a different filter, or list one of your own cards." icon={<Store className="size-6" />} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {view.map((l) => <MarketListingCard key={l.id} listing={asCardListing(l)} onBuy={() => buy(l)} />)}
        </div>
      )}

      <SellInventoryPanel open={inventoryOpen} cards={sellableDuplicates}
        onPick={(c) => { setInventoryOpen(false); setSellCard(c); }} onClose={() => setInventoryOpen(false)} />
      <SellModal card={sellCard} open={!!sellCard} onClose={() => setSellCard(null)} onList={listCard} />
      </SignInGate>
    </AppShell>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-lg px-3 py-1.5 font-mono text-xs transition-colors", active ? "bg-ascend/15 text-ascend ring-1 ring-ascend/30" : "bg-ink-800/60 text-slate-400 hover:text-white ring-1 ring-white/[0.06]")}>{children}</button>
  );
}
