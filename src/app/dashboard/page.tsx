"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Package, Swords, Store, Library, ArrowRight, Zap } from "lucide-react";
import { currentUser } from "@/data/user";
import { cards } from "@/data/cards";
import { quests } from "@/data/quests";
import { AppShell } from "@/components/layout/AppShell";
import { XPBar } from "@/components/ui/XPBar";
import { CoinDisplay } from "@/components/ui/CoinDisplay";
import { CardItem } from "@/components/cards/CardItem";
import { QuestCard } from "@/components/quests/QuestCard";
import { useToast } from "@/components/ui/Toast";
import { getXpForNextLevel } from "@/lib/economy";
import { formatNumber } from "@/lib/utils";
import { PackOpeningHistory } from "@/components/packs/PackOpeningHistory";

export default function DashboardPage() {
  const toast = useToast();
  const recentCards = cards.filter((c) => c.ownedAmount > 0).slice(0, 5);
  const activeQuests = quests.filter((q) => q.status === "active" || q.status === "completed").slice(0, 3);

  const stats = [
    { label: "Free Coins", node: <CoinDisplay type="free" amount={currentUser.freeCoins} />, icon: null },
    { label: "Premium Coins", node: <CoinDisplay type="premium" amount={currentUser.premiumCoins} />, icon: null },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">{currentUser.username}</h1>
      </div>

      {/* Level + balances */}
      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Account Level</span>
              <div className="font-display text-4xl font-bold text-white">{currentUser.level}</div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-ascend/10 px-3 py-2 ring-1 ring-ascend/20">
              <Flame className="size-5 text-ascend" />
              <div className="leading-none">
                <div className="font-display text-lg font-bold text-white">{currentUser.dailyStreak}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">day streak</div>
              </div>
            </div>
          </div>
          <div className="mt-5"><XPBar level={currentUser.level} xp={currentUser.xp} /></div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-ink-900/60 px-4 py-3">
            <Package className="size-5 text-tactical" />
            <span className="text-sm text-slate-300">
              Next level unlocks a <span className="font-semibold text-tactical">Premium Card Pack</span> ·{" "}
              <span className="font-mono text-slate-400">{formatNumber(getXpForNextLevel(currentUser.level) - currentUser.xp)} XP to go</span>
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-4">
          {stats.map((s) => (
            <div key={s.label} className="panel flex items-center justify-between p-5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">{s.label}</span>
              <span className="text-lg">{s.node}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Quick actions */}
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

      {/* Active quests */}
      <div className="mt-8 flex items-end justify-between">
        <h2 className="font-display text-xl font-bold text-white">Active quests</h2>
        <Link href="/quests" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">View all <ArrowRight className="size-4" /></Link>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {activeQuests.map((q) => (
          <QuestCard key={q.id} quest={q} onClaim={(quest) => toast(`Claimed: ${quest.title}`, "success")} />
        ))}
      </div>

      {/* Recent pack openings */}
      <div className="mt-8">
        <PackOpeningHistory />
      </div>

      {/* Recent cards */}
      <div className="mt-8 flex items-end justify-between">
        <h2 className="font-display text-xl font-bold text-white">Recent cards</h2>
        <Link href="/collection" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">Collection <ArrowRight className="size-4" /></Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {recentCards.map((c) => <CardItem key={c.id} card={c} />)}
      </div>
    </AppShell>
  );
}
