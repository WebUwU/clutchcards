"use client";

import { useMemo, useState } from "react";
import type { CardSet } from "@/types";
import { AdminTable, Column, StatusPill } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, NumberInput, TextArea, Toggle } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { resolveCardSets } from "@/lib/registry";
import { getAdminCardSets, saveAdminCardSets } from "@/lib/localDb";
import { slugify, uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

function persist(next: CardSet[]) { saveAdminCardSets(next); }

export function AdminSetsSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [v, setV] = useState(0);
  const sets = useMemo(() => resolveCardSets(), [v]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CardSet | null>(null);
  const [draft, setDraft] = useState<CardSet | null>(null);
  const [toDelete, setToDelete] = useState<CardSet | null>(null);
  const bump = () => { setV((x) => x + 1); onChanged(); };

  const overlay = () => getAdminCardSets() ?? [];

  const startNew = () => {
    setEditing(null);
    setDraft({
      id: uid("set"), name: "", slug: "", description: "", season: "Act I",
      releaseDate: new Date().toISOString().slice(0, 10), coverImage: "/images/cards/",
      isActive: true, totalCards: 0, accentColor: "#ff4655", backgroundStyle: "radial",
    });
    setOpen(true);
  };

  const startEdit = (s: CardSet) => { setEditing(s); setDraft({ ...s }); setOpen(true); };

  const save = () => {
    if (!draft) return;
    const final = { ...draft, slug: draft.slug || slugify(draft.name) };
    const list = overlay().filter((s) => s.id !== final.id);
    persist([...list, final]);
    toast(editing ? `Updated ${final.name}` : `Created ${final.name}`, "success");
    setOpen(false); setDraft(null); bump();
  };

  const toggle = (s: CardSet) => {
    const list = overlay().filter((x) => x.id !== s.id);
    persist([...list, { ...s, isActive: !s.isActive }]);
    bump();
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const isAdmin = overlay().some((s) => s.id === toDelete.id);
    if (isAdmin) persist(overlay().filter((s) => s.id !== toDelete.id));
    else persist([...overlay(), { ...toDelete, isActive: false }]);
    toast(`Deleted ${toDelete.name}`, "success");
    setToDelete(null); bump();
  };

  const set = <K extends keyof CardSet>(k: K, val: CardSet[K]) => setDraft((d) => (d ? { ...d, [k]: val } : d));

  const columns: Column<CardSet>[] = [
    { key: "name", header: "Name", render: (s) => (
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full" style={{ background: s.accentColor }} />
        <span className="font-medium text-white">{s.name}</span>
      </div>
    )},
    { key: "season", header: "Season", render: (s) => <span className="text-slate-400">{s.season}</span> },
    { key: "release", header: "Released", render: (s) => <span className="font-mono text-xs text-slate-500">{s.releaseDate}</span> },
    { key: "status", header: "Status", render: (s) => <StatusPill active={s.isActive} /> },
  ];

  return (
    <div>
      <SectionHeader title="Card Sets" count={sets.length} desc="Group cards into themed sets with their own season, cover and accent color." />
      <AdminTable rows={sets} columns={columns} searchKeys={["name", "season"]} onAdd={startNew} addLabel="Add set"
        actions={[
          { icon: "edit", label: "Edit", onClick: startEdit },
          { icon: "disable", label: "Toggle", onClick: toggle },
          { icon: "delete", label: "Delete", onClick: setToDelete },
        ]} />
      {open && draft && (
        <AdminFormDrawer open={open} title={editing ? "Edit set" : "New set"} onClose={() => setOpen(false)} onSubmit={save}>
          <Field label="Name"><TextInput value={draft.name} onChange={(x) => set("name", x)} /></Field>
          <Field label="Slug" hint="Auto from name if blank"><TextInput value={draft.slug} onChange={(x) => set("slug", x)} /></Field>
          <Field label="Season"><TextInput value={draft.season} onChange={(x) => set("season", x)} /></Field>
          <Field label="Release date"><TextInput type="date" value={draft.releaseDate} onChange={(x) => set("releaseDate", x)} /></Field>
          <Field label="Description"><TextArea value={draft.description} onChange={(x) => set("description", x)} /></Field>
          <Field label="Cover image path"><TextInput value={draft.coverImage} onChange={(x) => set("coverImage", x)} /></Field>
          <Field label="Accent color"><TextInput value={draft.accentColor} onChange={(x) => set("accentColor", x)} /></Field>
          <Field label="Total cards"><NumberInput value={draft.totalCards} onChange={(x) => set("totalCards", x)} min={0} /></Field>
          <Toggle checked={draft.isActive} onChange={(x) => set("isActive", x)} label="Active" />
        </AdminFormDrawer>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete set" message={`Delete "${toDelete?.name}"?`} confirmLabel="Delete" destructive onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
