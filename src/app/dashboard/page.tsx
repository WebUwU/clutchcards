"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Package, Swords, Store, Library, ArrowRight, Crown } from "lucide-react";
import type { Quest } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { SignInGate } from "@/components/layout/SignInGate";
import { XPBar } from "@/components/ui/XPBar";
import { CoinDisplay } from "@/components/ui/CoinDisplay";
import { CardItem } from "@/components/cards/CardItem";
import { QuestCard } from "@/components/quests/QuestCard";
import { useToast } from "@/components/ui/Toast";
import { useGameData } from "@/components/providers/GameDataProvider";
import { api } from "@/lib/apiClient";
import { getXpForNextLevel } from "@/lib/economy";
import { formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const toast = useToast();
  const { profile, inventory, refreshProfile } = useGameData();
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    api.quests().then((q) => setQuests((q as any[]).map((s) => ({
      ...s, period: s.period, goal: s.goal, progress: s.progress ?? 0, status: s.status ?? "active",
      reward: { xp: s.rewardXp, freeCoins: s.rewardFreeCoins },
    } as Quest)))).catch(() => setQuests([]));
  }, []);

  const recentCards = useMemo(
    () => inventory.slice(0, 5).map((i) => ({ ...i.card, ownedAmount: i.amount })),
    [inventory],
  );
  const activeQuests = quests.filter((q) => q.status === "active" || q.status === "completed").slice(0, 3);

  const claim = async (q: Quest) => {
    try { await api.claimQuest(q.id); toast(`Claimed: ${q.title}`, "success"); await refreshProfile(); }
    catch (e) { toast(e instanceof Error ? e.message : "Claim failed", "error"); }
  };

  return (
    <AppShell>
      <SignInGate>
      {profile && (
        <>
          <div className="mb-6">
            <span className="eyebrow">Welcome back</span>
            <h1 className="mt-1 font-display text-3xl font-bold text-white">{profile.displayName || profile.username}</h1>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Account Level</span>
                  <div className="font-display text-4xl font-bold text-white">{profile.level}</div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-ascend/10 px-3 py-2 ring-1 ring-ascend/20">
                  <Flame className="size-5 text-ascend" />
                  <div className="leading-none">
                    <div className="font-display text-lg font-bold text-white">{profile.dailyStreak}</div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">day streak</div>
                  </div>
                </div>
              </div>
              <div className="mt-5"><XPBar level={profile.level} xp={profile.xp} /></div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-900/60 px-4 py-3">
                <Package className="size-5 text-tactical" />
                <span className="text-sm text-slate-300">
                  <span className="font-mono text-slate-400">{formatNumber(Math.max(0, getXpForNextLevel(profile.level) - profile.xp))} XP</span> to the next level
                </span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-4">
              <div className="panel flex items-center justify-between p-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Free Coins</span>
                <CoinDisplay type="free" amount={profile.freeCoins} />
              </div>
              <div className="panel flex items-center justify-between p-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Premium Coins</span>
                <CoinDisplay type="premium" amount={profile.premiumCoins} />
              </div>
            </motion.div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: "/packs", label: "Open Packs", icon: Package },
              { href: "/quests", label: "Quests", icon: Swords },
              { href: "/collection", label: "Collection", icon: Library },
              { href: "/market", label: "Market", icon: Store },
            ].map((a) => (
              <Link key={a.href} href={a.href} className="panel group flex items-center gap-3 p-4 transition-colors hover:border-ascend/30">
                <div className="grid size-10 place-items-center rounded-xl bg-ink-700 text-slate-300 transition-colors group-hover:bg-ascend/10 group-hover:text-ascend">
                  <a.icon className="size-5" />
                </div>
                <span className="font-display text-sm font-semibold text-white">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* Founder teaser — retention/monetization prep (no payment) */}
          <Link href="/shop" className="mt-4 flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-rarity-legendary/25 bg-gradient-to-r from-rarity-legendary/10 to-transparent p-4 transition-colors hover:border-rarity-legendary/40">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-rarity-legendary/15 text-rarity-legendary"><Crown className="size-5" /></div>
              <div>
                <div className="font-display text-sm font-bold text-white">Become a Founder</div>
                <div className="text-xs text-slate-400">Exclusive card, badge & frame for early supporters · coming soon</div>
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-rarity-legendary" />
          </Link>

          {activeQuests.length > 0 && (
            <>
              <div className="mt-8 flex items-end justify-between">
                <h2 className="font-display text-xl font-bold text-white">Active quests</h2>
                <Link href="/quests" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">View all <ArrowRight className="size-4" /></Link>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {activeQuests.map((q) => <QuestCard key={q.id} quest={q} onClaim={claim} />)}
              </div>
            </>
          )}

          <div className="mt-8 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold text-white">Recent cards</h2>
            <Link href="/collection" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">Collection <ArrowRight className="size-4" /></Link>
          </div>
          {recentCards.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {recentCards.map((c) => <CardItem key={c.id} card={c} />)}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No cards yet — open a pack to get started!</p>
          )}
        </>
      )}
      </SignInGate>
    </AppShell>
  );
}
