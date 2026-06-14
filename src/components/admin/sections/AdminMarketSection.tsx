"use client";

import { useEffect, useState } from "react";
import type { MarketListing } from "@/types";
import { AdminTable, Column } from "../AdminTable";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { getMarketListings, saveMarketListings } from "@/lib/localDb";
import { marketListings as seedListings } from "@/data/market";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { useToast } from "@/components/ui/Toast";

export function AdminMarketSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [rows, setRows] = useState<MarketListing[]>([]);
  const [toDelete, setToDelete] = useState<MarketListing | null>(null);

  useEffect(() => { setRows(getMarketListings() ?? seedListings); }, []);

  const confirmDelete = () => {
    if (!toDelete) return;
    const next = rows.filter((l) => l.id !== toDelete.id);
    setRows(next); saveMarketListings(next);
    toast("Listing removed", "success");
    setToDelete(null); onChanged();
  };

  const columns: Column<MarketListing>[] = [
    { key: "card", header: "Card", render: (l) => <span className="font-medium text-white">{l.card.name}</span> },
    { key: "rarity", header: "Rarity", render: (l) => <RarityBadge rarity={l.card.rarityId} /> },
    { key: "price", header: "Price", render: (l) => <span className="font-mono text-xs text-slate-300">{l.price} PC</span> },
    { key: "seller", header: "Seller", render: (l) => <span className="text-slate-400">{l.sellerName}</span> },
  ];

  return (
    <div>
      <SectionHeader title="Market" count={rows.length} desc="Moderate active market listings. The market is closed-economy: Premium Coins stay in the platform and can never be cashed out." />
      <AdminTable rows={rows} columns={columns} searchKeys={["sellerName"]}
        actions={[{ icon: "delete", label: "Remove listing", onClick: setToDelete }]} />
      <ConfirmDialog open={!!toDelete} title="Remove listing" message={`Remove ${toDelete?.card.name} listed by ${toDelete?.sellerName}?`} confirmLabel="Remove" destructive onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
