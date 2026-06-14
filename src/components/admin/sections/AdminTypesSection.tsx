"use client";

import { useMemo, useState } from "react";
import type { CardTypeConfig } from "@/types";
import { AdminTable, Column } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, TextArea } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { resolveCardTypes } from "@/lib/registry";
import { getAdminCardTypes, saveAdminCardTypes } from "@/lib/localDb";
import { uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function AdminTypesSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [v, setV] = useState(0);
  const types = useMemo(() => resolveCardTypes(), [v]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CardTypeConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<CardTypeConfig | null>(null);
  const overlay = () => getAdminCardTypes() ?? [];
  const bump = () => { setV((x) => x + 1); onChanged(); };

  const startNew = () => { setEditing(false); setDraft({ id: uid("type"), name: "", description: "", icon: "Shapes", color: "#3ea6ff" }); setOpen(true); };
  const startEdit = (t: CardTypeConfig) => { setEditing(true); setDraft({ ...t }); setOpen(true); };
  const save = () => {
    if (!draft) return;
    saveAdminCardTypes([...overlay().filter((t) => t.id !== draft.id), draft]);
    toast(editing ? `Updated ${draft.name}` : `Created ${draft.name}`, "success");
    setOpen(false); setDraft(null); bump();
  };
  const confirmDelete = () => {
    if (!toDelete) return;
    const isAdmin = overlay().some((t) => t.id === toDelete.id);
    if (isAdmin) saveAdminCardTypes(overlay().filter((t) => t.id !== toDelete.id));
    else toast("Seed types can't be deleted, only overridden.", "info");
    setToDelete(null); bump();
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
