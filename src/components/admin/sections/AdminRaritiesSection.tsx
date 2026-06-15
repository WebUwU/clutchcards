"use client";

import { useEffect, useState } from "react";
import type { RarityConfig } from "@/types";
import { AdminTable, Column } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, NumberInput } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { api } from "@/lib/apiClient";
import { uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminRaritiesSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [rarities, setRarities] = useState<RarityConfig[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RarityConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<RarityConfig | null>(null);

  const load = async () => {
    try { setRarities(await api.adminList("rarities") as RarityConfig[]); }
    catch (e) { toast(e instanceof Error ? e.message : "Failed to load", "error"); }
  };
  useEffect(() => { load(); }, []);
  const bump = () => { load(); onChanged(); };

  const startNew = () => {
    setEditing(false);
    setDraft({ id: uid("rarity"), name: "", sortOrder: rarities.length, color: "#9aa4b2", glowClass: "shadow-none", dropWeight: 100, minFusionRequired: 3, borderStyle: "solid" });
    setOpen(true);
  };
  const startEdit = (r: RarityConfig) => { setEditing(true); setDraft({ ...r }); setOpen(true); };

  const save = async () => {
    if (!draft) return;
    try {
      await api.adminSave("rarities", draft as any);
      toast(editing ? `Updated ${draft.name}` : `Created ${draft.name}`, "success");
      setOpen(false); setDraft(null); bump();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await api.adminDelete("rarities", toDelete.id); toast(`Deleted ${toDelete.name}`, "success"); setToDelete(null); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Can't delete — it may be in use by cards.", "error"); setToDelete(null); }
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
