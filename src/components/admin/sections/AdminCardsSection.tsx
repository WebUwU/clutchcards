"use client";

import { useMemo, useState } from "react";
import type { Card } from "@/types";
import { AdminTable, Column, StatusPill } from "../AdminTable";
import { AdminCardForm } from "../AdminCardForm";
import { ConfirmDialog } from "../ConfirmDialog";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { resolveCards, resolveCardSets, resolveRarities, resolveCardTypes } from "@/lib/registry";
import { createCard, updateCard, deleteCard } from "@/lib/cards";
import { uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function SectionHeader({ title, count, desc }: { title: string; count?: number; desc: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-xl font-bold text-white">{title}</h2>
        {count != null && <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-400">{count}</span>}
      </div>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
    </div>
  );
}

export function AdminCardsSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const cards = useMemo(() => resolveCards(), [version]);
  const sets = useMemo(() => resolveCardSets(), [version]);
  const rarities = useMemo(() => resolveRarities(), [version]);
  const types = useMemo(() => resolveCardTypes(), [version]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [toDelete, setToDelete] = useState<Card | null>(null);

  const bump = () => { setVersion((v) => v + 1); onChanged(); };

  const onSave = (card: Card) => {
    const exists = cards.some((c) => c.id === card.id);
    if (exists) { updateCard(card.id, card); toast(`Updated ${card.name}`, "success"); }
    else { createCard(card); toast(`Created ${card.name}`, "success"); }
    setFormOpen(false); setEditing(null); bump();
  };

  const duplicate = (card: Card) => {
    createCard({ ...card, id: uid("card"), name: `${card.name} (copy)`, slug: "" });
    toast(`Duplicated ${card.name}`, "success"); bump();
  };

  const toggle = (card: Card) => {
    updateCard(card.id, { isActive: !card.isActive });
    toast(`${card.isActive ? "Disabled" : "Enabled"} ${card.name}`, "info"); bump();
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteCard(toDelete.id);
    toast(`Deleted ${toDelete.name}`, "success");
    setToDelete(null); bump();
  };

  const columns: Column<Card>[] = [
    { key: "name", header: "Name", render: (c) => (
      <div className="flex items-center gap-2">
        <div className="size-8 shrink-0 rounded-md bg-ink-700 bg-cover" style={{ backgroundImage: `url(${c.image})` }} />
        <div>
          <div className="font-medium text-white">{c.name}</div>
          <div className="font-mono text-[10px] text-slate-500">{c.id}</div>
        </div>
      </div>
    )},
    { key: "rarity", header: "Rarity", render: (c) => <RarityBadge rarity={c.rarityId} /> },
    { key: "set", header: "Set", render: (c) => <span className="text-slate-400">{sets.find((s) => s.id === c.setId)?.name ?? c.setId}</span> },
    { key: "type", header: "Type", render: (c) => <span className="capitalize text-slate-400">{c.typeId}</span> },
    { key: "tradable", header: "Tradable", render: (c) => <span className={c.tradable ? "text-tactical" : "text-slate-500"}>{c.tradable ? "Yes" : "No"}</span> },
    { key: "status", header: "Status", render: (c) => <StatusPill active={c.isActive} /> },
  ];

  return (
    <div>
      <SectionHeader title="Cards" count={cards.length} desc="Create and manage every collectible card. New cards appear in the collection, packs and market." />
      <AdminTable
        rows={cards}
        columns={columns}
        searchKeys={["name", "id", "rarityId", "typeId"]}
        onAdd={() => { setEditing(null); setFormOpen(true); }}
        addLabel="Add card"
        actions={[
          { icon: "edit", label: "Edit", onClick: (c) => { setEditing(c); setFormOpen(true); } },
          { icon: "duplicate", label: "Duplicate", onClick: duplicate },
          { icon: "disable", label: "Toggle active", onClick: toggle },
          { icon: "delete", label: "Delete", onClick: (c) => setToDelete(c) },
        ]}
      />
      {formOpen && (
        <AdminCardForm
          open={formOpen} initial={editing} sets={sets} rarities={rarities} types={types}
          onClose={() => { setFormOpen(false); setEditing(null); }} onSave={onSave}
        />
      )}
      <ConfirmDialog
        open={!!toDelete}
        title="Delete card"
        message={`Delete "${toDelete?.name}"? This removes it from the collection and packs. Seed cards are tombstoned so they can be restored via Reset.`}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
