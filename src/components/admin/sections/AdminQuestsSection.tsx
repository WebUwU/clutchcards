"use client";

import { useEffect, useState } from "react";
import type { Quest, QuestPeriod, QuestDifficulty } from "@/types";
import { AdminTable, Column, StatusPill } from "../AdminTable";
import { AdminFormDrawer } from "../AdminFormDrawer";
import { Field, TextInput, NumberInput, TextArea, Select, Toggle } from "../fields";
import { ConfirmDialog } from "../ConfirmDialog";
import { SectionHeader } from "./AdminCardsSection";
import { api } from "@/lib/apiClient";
import { uid } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const PERIODS: QuestPeriod[] = ["daily", "weekly", "seasonal"];
const DIFFS: QuestDifficulty[] = ["easy", "medium", "hard"];

// Adapt a DB quest row to the form's Quest shape.
function fromDb(q: any): Quest {
  return {
    ...q, type: q.period, progress: 0, progressRequired: q.goal, status: "not_started",
    reward: { xp: q.rewardXp, freeCoins: q.rewardFreeCoins, packId: q.rewardPackId ?? undefined },
  };
}

export function AdminQuestsSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Quest | null>(null);
  const [editing, setEditing] = useState(false);
  const [toDelete, setToDelete] = useState<Quest | null>(null);

  const load = async () => {
    try {
      const [q, p] = await Promise.all([api.adminList("quests"), api.adminList("packs")]);
      setQuests((q as any[]).map(fromDb)); setPacks(p);
    } catch (e) { toast(e instanceof Error ? e.message : "Failed to load", "error"); }
  };
  useEffect(() => { load(); }, []);
  const bump = () => { load(); onChanged(); };

  const startNew = () => {
    setEditing(false);
    setDraft({
      id: uid("q"), title: "", description: "", period: "daily", type: "daily",
      difficulty: "easy", progress: 0, goal: 1, progressRequired: 1, status: "not_started",
      reward: { xp: 100, freeCoins: 100 }, rewardXp: 100, rewardFreeCoins: 100, isActive: true,
    });
    setOpen(true);
  };
  const startEdit = (q: Quest) => { setEditing(true); setDraft({ ...q }); setOpen(true); };

  const save = async () => {
    if (!draft) return;
    // Map the form back to DB columns. Keep metric/goal sensible.
    const payload = {
      id: draft.id, title: draft.title, description: draft.description,
      period: draft.period, difficulty: draft.difficulty,
      metric: (draft as any).metric ?? "matches_played",
      goal: draft.goal, rewardXp: draft.reward.xp, rewardFreeCoins: draft.reward.freeCoins,
      rewardPackId: draft.rewardPackId ?? null, isActive: draft.isActive,
    };
    try {
      await api.adminSave("quests", payload);
      toast(editing ? "Updated quest" : "Created quest", "success");
      setOpen(false); setDraft(null); bump();
    } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); }
  };
  const toggle = async (q: Quest) => {
    try { await api.adminSave("quests", { ...q, metric: (q as any).metric ?? "matches_played", rewardXp: q.reward.xp, rewardFreeCoins: q.reward.freeCoins, isActive: !q.isActive }); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Toggle failed", "error"); }
  };
  const confirmDelete = async () => {
    if (!toDelete) return;
    try { await api.adminDelete("quests", toDelete.id); toast("Deleted quest", "success"); setToDelete(null); bump(); }
    catch (e) { toast(e instanceof Error ? e.message : "Delete failed", "error"); }
  };
  const set = <K extends keyof Quest>(k: K, val: Quest[K]) => setDraft((d) => (d ? { ...d, [k]: val } : d));
  const setReward = (patch: Partial<Quest["reward"]>) => setDraft((d) => (d ? { ...d, reward: { ...d.reward, ...patch } } : d));

  const columns: Column<Quest>[] = [
    { key: "title", header: "Quest", render: (q) => <span className="font-medium text-white">{q.title}</span> },
    { key: "period", header: "Period", render: (q) => <span className="capitalize text-slate-400">{q.period}</span> },
    { key: "diff", header: "Difficulty", render: (q) => <span className="capitalize text-slate-400">{q.difficulty}</span> },
    { key: "reward", header: "Reward", render: (q) => <span className="font-mono text-xs text-slate-400">{q.reward.xp} XP · {q.reward.freeCoins} FC</span> },
    { key: "status", header: "Status", render: (q) => <StatusPill active={q.isActive} /> },
  ];

  return (
    <div>
      <SectionHeader title="Quests" count={quests.length} desc="Define daily, weekly and seasonal quests with XP, Free Coin and optional pack rewards." />
      <AdminTable rows={quests} columns={columns} searchKeys={["title"]} onAdd={startNew} addLabel="Add quest"
        actions={[{ icon: "edit", label: "Edit", onClick: startEdit }, { icon: "disable", label: "Toggle", onClick: toggle }, { icon: "delete", label: "Delete", onClick: setToDelete }]} />
      {open && draft && (
        <AdminFormDrawer open={open} title={editing ? "Edit quest" : "New quest"} onClose={() => setOpen(false)} onSubmit={save}>
          <Field label="Title"><TextInput value={draft.title} onChange={(x) => set("title", x)} /></Field>
          <Field label="Description"><TextArea value={draft.description} onChange={(x) => set("description", x)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Period"><Select value={draft.period} onChange={(x) => { set("period", x as QuestPeriod); set("type", x as QuestPeriod); }} options={PERIODS.map((p) => ({ value: p, label: p }))} /></Field>
            <Field label="Difficulty"><Select value={draft.difficulty} onChange={(x) => set("difficulty", x as QuestDifficulty)} options={DIFFS.map((d) => ({ value: d, label: d }))} /></Field>
          </div>
          <Field label="Goal (progress required)"><NumberInput value={draft.goal} onChange={(x) => { set("goal", x); set("progressRequired", x); }} min={1} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Reward XP"><NumberInput value={draft.reward.xp} onChange={(x) => setReward({ xp: x })} min={0} /></Field>
            <Field label="Reward Free Coins"><NumberInput value={draft.reward.freeCoins} onChange={(x) => setReward({ freeCoins: x })} min={0} /></Field>
          </div>
          <Field label="Reward pack (optional)">
            <Select value={draft.rewardPackId ?? ""} onChange={(x) => set("rewardPackId", x || undefined)}
              options={[{ value: "", label: "None" }, ...packs.map((p) => ({ value: p.id, label: p.name }))]} />
          </Field>
          <Toggle checked={draft.isActive} onChange={(x) => set("isActive", x)} label="Active" />
        </AdminFormDrawer>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete quest" message={`Delete "${toDelete?.title}"?`} confirmLabel="Delete" destructive onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
