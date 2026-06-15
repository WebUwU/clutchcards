"use client";

import { useEffect, useState } from "react";
import type { CardSet } from "@/types";
import { AdminTable, Column, StatusPill } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, NumberInput, TextArea, Toggle } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { api } from "@/lib/apiClient";
import { slugify, uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

// DB stores releaseDate as DateTime; the form uses a YYYY-MM-DD string.
function fromDb(s: any): CardSet {
  return { ...s, releaseDate: s.releaseDate ? String(s.releaseDate).slice(0, 10) : "" };
}

export function AdminSetsSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [sets, setSets] = useState<CardSet[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CardSet | null>(null);
  const [draft, setDraft] = useState<CardSet | null>(null);
  const [toDelete, setToDelete] = useState<CardSet | null>(null);

  const load = async () => {
    try { setSets((await api.adminList("sets") as any[]).map(fromDb)); }
    catch (e) { toast(e instanceof Error ? e.message : "Failed to load", "error"); }
  };
  useEffect(() => { load(); }, []);
  const bump = () => { load(); onChanged(); };

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

  const save = async () => {
    if (!draft) return;
    const payload = {
      ...draft, slug: draft.slug || slugify(draft.name),
      releaseDate: new Date(draft.releaseDate || Date.now()).toISOString(),
    };
    try {
      await api.adminSave("sets", payload as any);
      toast(editing ? `Updated ${draft.name}` : `Created ${draft.name}`, "success");
      setOpen(false); setDraft(null); bump();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };

  const toggle = async (s: CardSet) => {
    try { await api.adminSave("sets", { ...s, isActive: !s.isActive, releaseDate: new Date(s.releaseDate || Date.now()).toISOString() } as any); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Toggle failed", "error"); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await api.adminDelete("sets", toDelete.id); toast(`Deleted ${toDelete.name}`, "success"); setToDelete(null); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Delete failed", "error"); }
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
