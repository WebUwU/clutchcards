"use client";

import { useEffect, useState } from "react";
import type { ShopItem, ShopCategory } from "@/types";
import { AdminTable, Column, StatusPill } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, NumberInput, TextArea, Select, Toggle } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { api } from "@/lib/apiClient";
import { uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES: ShopCategory[] = ["premium_bundle", "cosmetic", "frame", "showcase", "booster", "season_pass", "exchange", "pack"];

export function AdminShopSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ShopItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<ShopItem | null>(null);

  const load = async () => {
    try { setItems(await api.adminList("shop") as ShopItem[]); }
    catch (e) { toast(e instanceof Error ? e.message : "Failed to load", "error"); }
  };
  useEffect(() => { load(); }, []);
  const bump = () => { load(); onChanged(); };

  const startNew = () => {
    setEditing(false);
    setDraft({ id: uid("s"), name: "", description: "", category: "cosmetic", image: "", isActive: true } as ShopItem);
    setOpen(true);
  };
  const startEdit = (i: ShopItem) => { setEditing(true); setDraft({ ...i }); setOpen(true); };
  const save = async () => {
    if (!draft) return;
    try {
      await api.adminSave("shop", { ...draft, slug: (draft as any).slug || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") } as any);
      toast(editing ? `Updated ${draft.name}` : `Created ${draft.name}`, "success");
      setOpen(false); setDraft(null); bump();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };
  const toggle = async (i: ShopItem) => {
    try { await api.adminSave("shop", { ...i, isActive: !i.isActive } as any); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Toggle failed", "error"); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await api.adminDelete("shop", toDelete.id); toast(`Deleted ${toDelete.name}`, "success"); setToDelete(null); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Delete failed", "error"); }
  };
  const set = <K extends keyof ShopItem>(k: K, val: ShopItem[K]) => setDraft((d) => (d ? { ...d, [k]: val } : d));

  const columns: Column<ShopItem>[] = [
    { key: "name", header: "Item", render: (i) => <span className="font-medium text-white">{i.name}</span> },
    { key: "cat", header: "Category", render: (i) => <span className="text-slate-400">{i.category.replace("_", " ")}</span> },
    { key: "price", header: "Price", render: (i) => (
      <span className="font-mono text-xs text-slate-400">
        {i.priceReal ? `€${i.priceReal}` : i.pricePremium ? `${i.pricePremium} PC` : i.priceFreeCoins ? `${i.priceFreeCoins} FC` : "—"}
      </span>
    )},
    { key: "status", header: "Status", render: (i) => <StatusPill active={i.isActive} /> },
  ];

  return (
    <div>
      <SectionHeader title="Shop Items" count={items.length} desc="Manage coin bundles, cosmetics, boosters and exchange offers. Closed-economy rules still apply (no cashout, no free→premium)." />
      <AdminTable rows={items} columns={columns} searchKeys={["name", "category"]} onAdd={startNew} addLabel="Add item"
        actions={[{ icon: "edit", label: "Edit", onClick: startEdit }, { icon: "disable", label: "Toggle", onClick: toggle }, { icon: "delete", label: "Delete", onClick: setToDelete }]} />
      {open && draft && (
        <AdminFormDrawer open={open} title={editing ? "Edit item" : "New item"} onClose={() => setOpen(false)} onSubmit={save}>
          <Field label="Name"><TextInput value={draft.name} onChange={(x) => set("name", x)} /></Field>
          <Field label="Description"><TextArea value={draft.description} onChange={(x) => set("description", x)} /></Field>
          <Field label="Category"><Select value={draft.category} onChange={(x) => set("category", x as ShopCategory)} options={CATEGORIES.map((c) => ({ value: c, label: c.replace("_", " ") }))} /></Field>
          <Field label="Image path"><TextInput value={draft.image} onChange={(x) => set("image", x)} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Price (€)"><NumberInput value={draft.priceReal ?? 0} onChange={(x) => set("priceReal", x || undefined)} min={0} step={0.01} /></Field>
            <Field label="Price (PC)"><NumberInput value={draft.pricePremium ?? 0} onChange={(x) => set("pricePremium", x || undefined)} min={0} /></Field>
            <Field label="Price (FC)"><NumberInput value={draft.priceFreeCoins ?? 0} onChange={(x) => set("priceFreeCoins", x || undefined)} min={0} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Grants Premium"><NumberInput value={draft.grantsPremium ?? 0} onChange={(x) => set("grantsPremium", x || undefined)} min={0} /></Field>
            <Field label="Grants Free"><NumberInput value={draft.grantsFree ?? 0} onChange={(x) => set("grantsFree", x || undefined)} min={0} /></Field>
          </div>
          <Field label="Badge (optional)"><TextInput value={draft.badge ?? ""} onChange={(x) => set("badge", x || undefined)} /></Field>
          <Toggle checked={draft.isActive} onChange={(x) => set("isActive", x)} label="Active" />
        </AdminFormDrawer>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete item" message={`Delete "${toDelete?.name}"?`} confirmLabel="Delete" destructive onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
