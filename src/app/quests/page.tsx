"use client";

import { useState } from "react";
import { Swords } from "lucide-react";
import type { Quest, QuestPeriod } from "@/types";
import { quests as initialQuests } from "@/data/quests";
import { AppShell } from "@/components/layout/AppShell";
import { QuestCard } from "@/components/quests/QuestCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const tabs: { key: QuestPeriod; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "seasonal", label: "Seasonal" },
];

export default function QuestsPage() {
  const toast = useToast();
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [tab, setTab] = useState<QuestPeriod>("daily");

  const claim = (q: Quest) => {
    setQuests((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: "claimed" } : x)));
    toast(`+${q.reward.xp} XP, +${q.reward.freeCoins} Free Coins`, "success");
  };

  const filtered = quests.filter((q) => q.period === tab);

  return (
    <AppShell>
      <div className="mb-6">
        <span className="eyebrow">Objectives</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">Quests</h1>
        <p className="mt-1 text-sm text-slate-400">Complete objectives to earn XP, Free Coins and packs.</p>
      </div>

      <div className="mb-6 inline-flex rounded-xl border border-white/[0.06] bg-ink-900/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-4 py-2 font-display text-sm font-semibold tracking-wide transition-colors",
              tab === t.key ? "bg-ascend text-white shadow-glow" : "text-slate-400 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No quests here yet" hint="Check back after the next reset." icon={<Swords className="size-6" />} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q) => <QuestCard key={q.id} quest={q} onClaim={claim} />)}
        </div>
      )}
    </AppShell>
  );
}
