"use client";

import { useEffect, useState } from "react";
import { Swords } from "lucide-react";
import type { Quest, QuestPeriod } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { SignInGate } from "@/components/layout/SignInGate";
import { QuestCard } from "@/components/quests/QuestCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useGameData } from "@/components/providers/GameDataProvider";
import { api } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const tabs: { key: QuestPeriod; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "seasonal", label: "Seasonal" },
];

// Adapt server quest rows to the QuestCard's expected Quest shape.
function adapt(s: any): Quest {
  return {
    id: s.id, title: s.title, description: s.description,
    period: s.period, type: s.period, difficulty: s.difficulty,
    progress: s.progress ?? 0, goal: s.goal, progressRequired: s.goal,
    status: s.status ?? "active",
    reward: { xp: s.rewardXp, freeCoins: s.rewardFreeCoins, packId: s.rewardPackId ?? undefined },
    rewardXp: s.rewardXp, rewardFreeCoins: s.rewardFreeCoins, rewardPackId: s.rewardPackId ?? undefined,
    isActive: s.isActive,
  };
}

export default function QuestsPage() {
  const toast = useToast();
  const { refreshProfile } = useGameData();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [tab, setTab] = useState<QuestPeriod>("daily");
  const [loading, setLoading] = useState(true);

  const load = () => api.quests().then((q) => setQuests((q as any[]).map(adapt))).catch(() => setQuests([])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const claim = async (q: Quest) => {
    try {
      await api.claimQuest(q.id);
      toast(`+${q.reward.xp} XP, +${q.reward.freeCoins} Free Coins`, "success");
      await Promise.all([load(), refreshProfile()]);
    } catch (e) { toast(e instanceof Error ? e.message : "Claim failed", "error"); }
  };

  const filtered = quests.filter((q) => q.period === tab);

  return (
    <AppShell>
      <SignInGate>
      <div className="mb-6">
        <span className="eyebrow">Objectives</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">Quests</h1>
        <p className="mt-1 text-sm text-slate-400">Complete objectives to earn XP, Free Coins and packs. Progress updates when you sync Valorant matches.</p>
      </div>

      <div className="mb-6 inline-flex rounded-xl border border-white/[0.06] bg-ink-900/60 p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("rounded-lg px-4 py-2 font-display text-sm font-semibold tracking-wide transition-colors", tab === t.key ? "bg-ascend text-white shadow-glow" : "text-slate-400 hover:text-white")}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-800/60" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No quests here yet" hint="Check back after the next reset." icon={<Swords className="size-6" />} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q) => <QuestCard key={q.id} quest={q} onClaim={claim} />)}
        </div>
      )}
      </SignInGate>
    </AppShell>
  );
}
