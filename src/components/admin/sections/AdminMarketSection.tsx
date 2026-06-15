"use client";

import { useEffect, useState } from "react";
import { AdminTable, Column } from "../AdminTable";
import { SectionHeader } from "./AdminCardsSection";
import { api } from "@/lib/apiClient";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { useToast } from "@/components/ui/Toast";

interface Listing { id: string; price: number; sellerName: string; card: any; }

export function AdminMarketSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [rows, setRows] = useState<Listing[]>([]);

  useEffect(() => {
    api.market().then((l) => setRows(l as Listing[]))
      .catch((e) => toast(e instanceof Error ? e.message : "Failed to load listings", "error"));
  }, [toast]);

  const columns: Column<Listing>[] = [
    { key: "card", header: "Card", render: (l) => <span className="font-medium text-white">{l.card.name}</span> },
    { key: "rarity", header: "Rarity", render: (l) => <RarityBadge rarity={l.card.rarityId} /> },
    { key: "price", header: "Price", render: (l) => <span className="font-mono text-xs text-slate-300">{l.price} PC</span> },
    { key: "seller", header: "Seller", render: (l) => <span className="text-slate-400">{l.sellerName}</span> },
  ];

  return (
    <div>
      <SectionHeader title="Market" count={rows.length} desc="Live view of all active market listings from the database. Closed-economy: Premium Coins stay in the platform and can never be cashed out." />
      <AdminTable rows={rows} columns={columns} searchKeys={["sellerName"]} />
    </div>
  );
}
