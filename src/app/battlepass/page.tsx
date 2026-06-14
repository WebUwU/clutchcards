"use client";

import { useState } from "react";
import { Lock, Crown } from "lucide-react";
import type { BattlepassReward } from "@/types";
import { battlepass as initialBP } from "@/data/user";
import { AppShell } from "@/components/layout/AppShell";
import { BattlepassRewardCard } from "@/components/profile/BattlepassReward";
import { ClosedEconomyNotice } from "@/components/layout/ClosedEconomyNotice";
import { useToast } from "@/components/ui/Toast";

export default function BattlepassPage() {
  const toast = useToast();
  const [rewards, setRewards] = useState<BattlepassReward[]>(initialBP);
  const tiers = Array.from(new Set(rewards.map((r) => r.tier))).sort((a, b) => a - b);

  const claim = (r: BattlepassReward) => {
    setRewards((prev) => prev.map((x) => (x.tier === r.tier && x.track === r.track ? { ...x, claimed: true } : x)));
    toast(`Claimed: ${r.label}`, "success");
  };

  const free = (tier: number) => rewards.find((r) => r.tier === tier && r.track === "free")!;
  const premium = (tier: number) => rewards.find((r) => r.tier === tier && r.track === "premium")!;

  return (
    <AppShell>
      <div className="mb-5">
        <span className="eyebrow">Season · Act IV</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">Battlepass</h1>
        <p className="mt-1 text-sm text-slate-400">Fixed rewards along two tracks. No randomized real-money value.</p>
      </div>

      <div className="mb-6"><ClosedEconomyNotice /></div>

      {/* Track labels */}
      <div className="mb-3 grid grid-cols-[80px_1fr] gap-3">
        <div />
        <div className="flex gap-3 overflow-x-auto pb-1">
          {tiers.map((t) => (
            <div key={t} className="min-w-[120px] flex-1 text-center font-mono text-[11px] uppercase tracking-wider text-slate-500">
              Tier {t}
            </div>
          ))}
        </div>
      </div>

      {/* Free track */}
      <TrackRow label="Free" icon={<span className="font-mono text-[11px] text-slate-400">FREE</span>}>
        {tiers.map((t) => (
          <div key={t} className="min-w-[120px] flex-1">
            <BattlepassRewardCard reward={free(t)} onClaim={claim} />
          </div>
        ))}
      </TrackRow>

      {/* Premium track */}
      <TrackRow label="Premium" icon={<Crown className="size-4 text-tactical" />}>
        {tiers.map((t) => (
          <div key={t} className="min-w-[120px] flex-1">
            <BattlepassRewardCard reward={premium(t)} onClaim={claim} />
          </div>
        ))}
      </TrackRow>

      <div className="mt-6 panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-tactical/10 text-tactical ring-1 ring-tactical/20">
            <Lock className="size-5" />
          </div>
          <div>
            <p className="font-display font-semibold text-white">Unlock the Premium Track</p>
            <p className="text-sm text-slate-400">1,000 Premium Coins · all premium rewards this season</p>
          </div>
        </div>
        <button onClick={() => toast("Premium track unlocked (demo)", "success")} className="btn-cyan">Unlock</button>
      </div>
    </AppShell>
  );
}

function TrackRow({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 grid grid-cols-[80px_1fr] items-stretch gap-3">
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.06] bg-ink-800/60">
        {icon}
        <span className="font-display text-xs font-bold text-white">{label}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}
