"use client";

import { useMemo, useState } from "react";
import type { Pack, PackDropTableEntry } from "@/types";
import { AdminTable, Column, StatusPill } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, NumberInput, TextArea, Select, Toggle } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { resolvePacks, resolveCardSets, resolveRarities } from "@/lib/registry";
import { getAdminPacks, saveAdminPacks } from "@/lib/localDb";
import { slugify, uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { Trash2, Plus } from "lucide-react";

export function AdminPacksSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [v, setV] = useState(0);
  const packs = useMemo(() => resolvePacks(), [v]);
  const sets = useMemo(() => resolveCardSets(), [v]);
  const rarities = useMemo(() => resolveRarities(), [v]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Pack | null>(null);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<Pack | null>(null);
  const overlay = () => getAdminPacks() ?? [];
  const bump = () => { setV((x) => x + 1); onChanged(); };

  const startNew = () => {
    setEditing(false);
    setDraft({
      id: uid("pack"), name: "", slug: "", description: "", image: "/images/packs/",
      priceFreeCoins: 500, pricePremiumCoins: 0, allowedSetIds: sets[0] ? [sets[0].id] : [],
      dropTable: rarities.slice(0, 4).map((r) => ({ rarityId: r.id, weight: r.dropWeight })),
      guaranteedRarity: undefined, cardCount: 3, isPremium: false, isActive: true,
      createdAt: new Date().toISOString(),
    });
    setOpen(true);
  };
  const startEdit = (p: Pack) => { setEditing(true); setDraft({ ...p, dropTable: [...p.dropTable], allowedSetIds: [...p.allowedSetIds] }); setOpen(true); };

  const save = () => {
    if (!draft) return;
    const final = { ...draft, slug: draft.slug || slugify(draft.name), isPremium: draft.pricePremiumCoins > 0 };
    saveAdminPacks([...overlay().filter((p) => p.id !== final.id), final]);
    toast(editing ? `Updated ${final.name}` : `Created ${final.name}`, "success");
    setOpen(false); setDraft(null); bump();
  };
  const toggle = (p: Pack) => { saveAdminPacks([...overlay().filter((x) => x.id !== p.id), { ...p, isActive: !p.isActive }]); bump(); };
  const confirmDelete = () => {
    if (!toDelete) return;
    const isAdmin = overlay().some((p) => p.id === toDelete.id);
    if (isAdmin) saveAdminPacks(overlay().filter((p) => p.id !== toDelete.id));
    else saveAdminPacks([...overlay(), { ...toDelete, isActive: false }]);
    toast(`Deleted ${toDelete.name}`, "success");
    setToDelete(null); bump();
  };
  const set = <K extends keyof Pack>(k: K, val: Pack[K]) => setDraft((d) => (d ? { ...d, [k]: val } : d));

  const toggleSet = (setId: string) => {
    if (!draft) return;
    const has = draft.allowedSetIds.includes(setId);
    set("allowedSetIds", has ? draft.allowedSetIds.filter((s) => s !== setId) : [...draft.allowedSetIds, setId]);
  };
  const updateDrop = (i: number, patch: Partial<PackDropTableEntry>) => {
    if (!draft) return;
    const next = draft.dropTable.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    set("dropTable", next);
  };
  const addDrop = () => { if (draft) set("dropTable", [...draft.dropTable, { rarityId: rarities[0]?.id ?? "common", weight: 100 }]); };
  const removeDrop = (i: number) => { if (draft) set("dropTable", draft.dropTable.filter((_, idx) => idx !== i)); };

  const columns: Column<Pack>[] = [
    { key: "name", header: "Pack", render: (p) => (
      <div>
        <div className="font-medium text-white">{p.name}</div>
        <div className="font-mono text-[10px] text-slate-500">{p.cardCount} cards</div>
      </div>
    )},
    { key: "price", header: "Price", render: (p) => (
      <span className="font-mono text-xs text-slate-300">
        {p.pricePremiumCoins > 0 ? `${p.pricePremiumCoins} PC` : `${p.priceFreeCoins} FC`}
      </span>
    )},
    { key: "guar", header: "Guaranteed", render: (p) => <span className="capitalize text-slate-400">{p.guaranteedRarity ?? "—"}</span> },
    { key: "status", header: "Status", render: (p) => <StatusPill active={p.isActive} /> },
  ];

  return (
    <div>
      <SectionHeader title="Packs" count={packs.length} desc="Build packs with drop tables, allowed sets and a guaranteed minimum rarity. Active packs appear on the Packs page." />
      <AdminTable rows={packs} columns={columns} searchKeys={["name"]} onAdd={startNew} addLabel="Add pack"
        actions={[
          { icon: "edit", label: "Edit", onClick: startEdit },
          { icon: "disable", label: "Toggle", onClick: toggle },
          { icon: "delete", label: "Delete", onClick: setToDelete },
        ]} />
      {open && draft && (
        <AdminFormDrawer open={open} title={editing ? "Edit pack" : "New pack"} onClose={() => setOpen(false)} onSubmit={save}>
          <Field label="Name"><TextInput value={draft.name} onChange={(x) => set("name", x)} /></Field>
          <Field label="Slug" hint="Auto from name if blank"><TextInput value={draft.slug} onChange={(x) => set("slug", x)} /></Field>
          <Field label="Description"><TextArea value={draft.description} onChange={(x) => set("description", x)} /></Field>
          <Field label="Image path"><TextInput value={draft.image} onChange={(x) => set("image", x)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (Free Coins)"><NumberInput value={draft.priceFreeCoins} onChange={(x) => set("priceFreeCoins", x)} min={0} /></Field>
            <Field label="Price (Premium Coins)"><NumberInput value={draft.pricePremiumCoins} onChange={(x) => set("pricePremiumCoins", x)} min={0} /></Field>
          </div>
          <Field label="Card count"><NumberInput value={draft.cardCount} onChange={(x) => set("cardCount", x)} min={1} /></Field>
          <Field label="Guaranteed rarity">
            <Select value={draft.guaranteedRarity ?? ""} onChange={(x) => set("guaranteedRarity", x || undefined)}
              options={[{ value: "", label: "None" }, ...rarities.map((r) => ({ value: r.id, label: r.name }))]} />
          </Field>

          <div className="mb-4">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Allowed sets</span>
            <div className="flex flex-wrap gap-1.5">
              {sets.map((s) => {
                const on = draft.allowedSetIds.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSet(s.id)} type="button"
                    className={`rounded-lg px-2.5 py-1 text-xs ${on ? "bg-ascend/15 text-ascend ring-1 ring-ascend/30" : "bg-ink-800 text-slate-400"}`}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Drop table</span>
              <button onClick={addDrop} type="button" className="flex items-center gap-1 text-[11px] text-tactical"><Plus className="size-3" /> Add</button>
            </div>
            <div className="space-y-2">
              {draft.dropTable.map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={e.rarityId} onChange={(ev) => updateDrop(i, { rarityId: ev.target.value })}
                    className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-xs text-white outline-none">
                    {rarities.map((r) => <option key={r.id} value={r.id} className="bg-ink-900">{r.name}</option>)}
                  </select>
                  <input type="number" value={e.weight} onChange={(ev) => updateDrop(i, { weight: Number(ev.target.value) })}
                    className="w-20 rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-xs text-white outline-none" />
                  <button onClick={() => removeDrop(i)} type="button" className="grid size-7 place-items-center rounded-lg border border-white/10 text-slate-500 hover:text-ascend">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Weights are relative. Higher weight = more common.</p>
          </div>

          <Toggle checked={draft.isActive} onChange={(x) => set("isActive", x)} label="Active" />
        </AdminFormDrawer>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete pack" message={`Delete "${toDelete?.name}"?`} confirmLabel="Delete" destructive onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
