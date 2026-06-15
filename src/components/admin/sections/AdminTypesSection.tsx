"use client";

import { useEffect, useState } from "react";
import type { CardTypeConfig } from "@/types";
import { AdminTable, Column } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, TextArea } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { api } from "@/lib/apiClient";
import { uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminTypesSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [types, setTypes] = useState<CardTypeConfig[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CardTypeConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<CardTypeConfig | null>(null);

  const load = async () => {
    try { setTypes(await api.adminList("types") as CardTypeConfig[]); }
    catch (e) { toast(e instanceof Error ? e.message : "Failed to load", "error"); }
  };
  useEffect(() => { load(); }, []);
  const bump = () => { load(); onChanged(); };

  const startNew = () => { setEditing(false); setDraft({ id: uid("type"), name: "", description: "", icon: "Shapes", color: "#3ea6ff" }); setOpen(true); };
  const startEdit = (t: CardTypeConfig) => { setEditing(true); setDraft({ ...t }); setOpen(true); };
  const save = async () => {
    if (!draft) return;
    try {
      await api.adminSave("types", draft as any);
      toast(editing ? `Updated ${draft.name}` : `Created ${draft.name}`, "success");
      setOpen(false); setDraft(null); bump();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await api.adminDelete("types", toDelete.id); toast(`Deleted ${toDelete.name}`, "success"); setToDelete(null); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Can't delete — it may be in use by cards.", "error"); setToDelete(null); }
  };
  const set = <K extends keyof CardTypeConfig>(k: K, val: CardTypeConfig[K]) => setDraft((d) => (d ? { ...d, [k]: val } : d));

  const columns: Column<CardTypeConfig>[] = [
    { key: "name", header: "Type", render: (t) => (
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full" style={{ background: t.color }} />
        <span className="font-medium text-white">{t.name}</span>
      </span>
    )},
    { key: "desc", header: "Description", render: (t) => <span className="text-slate-400">{t.description}</span> },
  ];

  return (
    <div>
      <SectionHeader title="Card Types" count={types.length} desc="Categorize cards (Agent, Weapon, Ability, etc)." />
      <AdminTable rows={types} columns={columns} searchKeys={["name"]} onAdd={startNew} addLabel="Add type"
        actions={[{ icon: "edit", label: "Edit", onClick: startEdit }, { icon: "delete", label: "Delete", onClick: setToDelete }]} />
      {open && draft && (
        <AdminFormDrawer open={open} title={editing ? "Edit type" : "New type"} onClose={() => setOpen(false)} onSubmit={save}>
          <Field label="Name"><TextInput value={draft.name} onChange={(x) => set("name", x)} /></Field>
          <Field label="Description"><TextArea value={draft.description} onChange={(x) => set("description", x)} /></Field>
          <Field label="Icon (lucide name)"><TextInput value={draft.icon} onChange={(x) => set("icon", x)} /></Field>
          <Field label="Color (hex)"><TextInput value={draft.color} onChange={(x) => set("color", x)} /></Field>
        </AdminFormDrawer>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete type" message={`Delete "${toDelete?.name}"?`} confirmLabel="Delete" destructive onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
