"use client";

import { useMemo, useState } from "react";
import type { RarityConfig } from "@/types";
import { AdminTable, Column } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, NumberInput } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { resolveRarities } from "@/lib/registry";
import { getAdminRarities, saveAdminRarities } from "@/lib/localDb";
import { uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminRaritiesSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [v, setV] = useState(0);
  const rarities = useMemo(() => resolveRarities(), [v]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RarityConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<RarityConfig | null>(null);
  const overlay = () => getAdminRarities() ?? [];
  const bump = () => { setV((x) => x + 1); onChanged(); };

  const startNew = () => {
    setEditing(false);
    setDraft({ id: uid("rarity"), name: "", sortOrder: rarities.length, color: "#9aa4b2", glowClass: "shadow-none", dropWeight: 100, minFusionRequired: 3, borderStyle: "solid" });
    setOpen(true);
  };
  const startEdit = (r: RarityConfig) => { setEditing(true); setDraft({ ...r }); setOpen(true); };

  const save = () => {
    if (!draft) return;
    const list = overlay().filter((r) => r.id !== draft.id);
    saveAdminRarities([...list, draft]);
    toast(editing ? `Updated ${draft.name}` : `Created ${draft.name}`, "success");
    setOpen(false); setDraft(null); bump();
  };
  const confirmDelete = () => {
    if (!toDelete) return;
    const isAdmin = overlay().some((r) => r.id === toDelete.id);
    if (isAdmin) saveAdminRarities(overlay().filter((r) => r.id !== toDelete.id));
    else toast("Seed rarities can't be deleted, only overridden.", "info");
    setToDelete(null); bump();
  };
  const set = <K extends keyof RarityConfig>(k: K, val: RarityConfig[K]) => setDraft((d) => (d ? { ...d, [k]: val } : d));

  const columns: Column<RarityConfig>[] = [
    { key: "name", header: "Rarity", render: (r) => (
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full" style={{ background: r.color }} />
        <span className="font-medium text-white">{r.name}</span>
      </span>
    )},
    { key: "order", header: "Order", render: (r) => <span className="font-mono text-slate-400">{r.sortOrder}</span> },
    { key: "weight", header: "Drop weight", render: (r) => <span className="font-mono text-slate-400">{r.dropWeight}</span> },
    { key: "fuse", header: "Min fuse", render: (r) => <span className="font-mono text-slate-400">{r.minFusionRequired}</span> },
  ];

  return (
    <div>
      <SectionHeader title="Rarities" count={rarities.length} desc="Define rarity tiers. Drop weight controls how often each tier appears in packs (higher = more common)." />
      <AdminTable rows={rarities} columns={columns} searchKeys={["name"]} onAdd={startNew} addLabel="Add rarity"
        actions={[
          { icon: "edit", label: "Edit", onClick: startEdit },
          { icon: "delete", label: "Delete", onClick: setToDelete },
        ]} />
      {open && draft && (
        <AdminFormDrawer open={open} title={editing ? "Edit rarity" : "New rarity"} onClose={() => setOpen(false)} onSubmit={save}>
          <Field label="Name"><TextInput value={draft.name} onChange={(x) => set("name", x)} /></Field>
          <Field label="Color (hex)"><TextInput value={draft.color} onChange={(x) => set("color", x)} /></Field>
          <Field label="Sort order" hint="Higher = rarer"><NumberInput value={draft.sortOrder} onChange={(x) => set("sortOrder", x)} /></Field>
          <Field label="Drop weight" hint="Relative pack chance"><NumberInput value={draft.dropWeight} onChange={(x) => set("dropWeight", x)} min={0} /></Field>
          <Field label="Min fusion required"><NumberInput value={draft.minFusionRequired} onChange={(x) => set("minFusionRequired", x)} min={0} /></Field>
          <Field label="Border style"><TextInput value={draft.borderStyle} onChange={(x) => set("borderStyle", x)} /></Field>
        </AdminFormDrawer>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete rarity" message={`Delete "${toDelete?.name}"?`} confirmLabel="Delete" destructive onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
