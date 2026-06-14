"use client";

import { useState } from "react";
import { Lock, Crown, Sparkles, Star } from "lucide-react";
import type { BattlepassReward } from "@/types";
import { battlepass as initialBP } from "@/data/user";
import { AppShell } from "@/components/layout/AppShell";
import { SignInGate } from "@/components/layout/SignInGate";
import { BattlepassRewardCard } from "@/components/profile/BattlepassReward";
import { useToast } from "@/components/ui/Toast";
import { useGameData } from "@/components/providers/GameDataProvider";

export default function BattlepassPage() {
  const toast = useToast();
  const { profile } = useGameData();
  const [rewards, setRewards] = useState<BattlepassReward[]>(initialBP);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const tiers = Array.from(new Set(rewards.map((r) => r.tier))).sort((a, b) => a - b);

  const claimedCount = rewards.filter((r) => r.claimed).length;
  const seasonPct = Math.round((claimedCount / rewards.length) * 100);

  const claim = (r: BattlepassReward) => {
    if (r.track === "premium" && !premiumUnlocked) { toast("Unlock the premium track first.", "info"); return; }
    setRewards((prev) => prev.map((x) => (x.tier === r.tier && x.track === r.track ? { ...x, claimed: true } : x)));
    toast(`Claimed: ${r.label}`, "success");
  };

  const free = (tier: number) => rewards.find((r) => r.tier === tier && r.track === "free")!;
  const premium = (tier: number) => rewards.find((r) => r.tier === tier && r.track === "premium")!;

  return (
    <AppShell>
      <SignInGate>
        {/* Hero banner */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ascend/20 via-ink-900 to-tactical/10 p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-ascend/20 blur-3xl" />
          <div className="absolute -bottom-12 left-1/3 size-40 rounded-full bg-tactical/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ascend">
              <Sparkles className="size-3.5" /> Season · Act IV
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Battlepass</h1>
            <p className="mt-1 max-w-lg text-sm text-slate-300">
              Climb the tiers and claim fixed rewards along two tracks. No randomized real-money value — every reward is a digital collectible.
            </p>

            <div className="mt-5 max-w-md">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-300"><Star className="size-3.5 text-rarity-legendary" /> Season progress</span>
                <span className="font-mono text-slate-400">{claimedCount}/{rewards.length} claimed · {seasonPct}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-ink-950/60 ring-1 ring-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-ascend to-tactical transition-all" style={{ width: `${seasonPct}%` }} />
              </div>
            </div>

            {profile && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink-950/50 px-3 py-2 text-sm ring-1 ring-white/10">
                <Crown className="size-4 text-tactical" />
                <span className="text-slate-300">Account level <span className="font-bold text-white">{profile.level}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Tier headers */}
        <div className="mb-3 grid grid-cols-[80px_1fr] gap-3">
          <div />
          <div className="flex gap-3 overflow-x-auto pb-1">
            {tiers.map((t) => (
              <div key={t} className="min-w-[120px] flex-1 text-center font-mono text-[11px] uppercase tracking-wider text-slate-500">Tier {t}</div>
            ))}
          </div>
        </div>

        <TrackRow label="Free" accent="#9aa4b2" icon={<span className="font-mono text-[11px] text-slate-400">FREE</span>}>
          {tiers.map((t) => <div key={t} className="min-w-[120px] flex-1"><BattlepassRewardCard reward={free(t)} onClaim={claim} /></div>)}
        </TrackRow>

        <TrackRow label="Premium" accent="#1ce5d4" locked={!premiumUnlocked} icon={<Crown className="size-4 text-tactical" />}>
          {tiers.map((t) => <div key={t} className="min-w-[120px] flex-1"><BattlepassRewardCard reward={premium(t)} onClaim={claim} /></div>)}
        </TrackRow>

        {!premiumUnlocked && (
          <div className="mt-6 panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-tactical/10 text-tactical ring-1 ring-tactical/20"><Lock className="size-5" /></div>
              <div>
                <p className="font-display font-semibold text-white">Unlock the Premium Track</p>
                <p className="text-sm text-slate-400">1,000 Premium Coins · all premium rewards this season</p>
              </div>
            </div>
            <button onClick={() => { setPremiumUnlocked(true); toast("Premium track unlocked", "success"); }} className="btn-cyan">Unlock</button>
          </div>
        )}
      </SignInGate>
    </AppShell>
  );
}

function TrackRow({ label, icon, accent, locked, children }: { label: string; icon: React.ReactNode; accent: string; locked?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-3 grid grid-cols-[80px_1fr] items-stretch gap-3">
      <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-white/[0.06] bg-ink-800/60" style={{ boxShadow: `inset 0 0 0 1px ${accent}22` }}>
        {icon}
        <span className="font-display text-xs font-bold text-white">{label}</span>
        {locked && <Lock className="size-3 text-slate-500" />}
      </div>
      <div className={`flex gap-3 overflow-x-auto pb-1 ${locked ? "opacity-60" : ""}`}>{children}</div>
    </div>
  );
}
