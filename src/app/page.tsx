"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Store, Swords, Layers, Sparkles, ShieldCheck, Flame } from "lucide-react";
import { cards } from "@/data/cards";
import { quests } from "@/data/quests";
import { CardItem } from "@/components/cards/CardItem";
import { QuestCard } from "@/components/quests/QuestCard";
import { ClosedEconomyNotice } from "@/components/layout/ClosedEconomyNotice";

export default function LandingPage() {
  const previewCards = cards.filter((c) => c.ownedAmount > 0).slice(0, 5);
  const previewQuests = quests.slice(0, 2);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-ascend text-white shadow-glow">
              <span className="font-display text-lg font-bold">A</span>
            </div>
            <div className="font-display text-base font-bold tracking-tight text-white">ASCENDANT</div>
          </div>
          <Link href="/dashboard" className="btn-ghost text-sm">Enter App <ArrowRight className="size-4" /></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint bg-[size:40px_40px] opacity-40" />
        <div className="absolute left-1/2 top-0 size-[600px] -translate-x-1/2 rounded-full bg-ascend/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="eyebrow mb-4 flex items-center gap-2">
              <Flame className="size-3.5 text-ascend" /> Tactical card collection
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white lg:text-7xl">
              Climb the ranks.
              <br />
              <span className="bg-gradient-to-r from-ascend to-ascend-bright bg-clip-text text-transparent">
                Collect the legends.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              Complete quests, level up, and crack open packs of agent cards. Fuse your
              duplicates into rarer pulls, then trade them on a player-run market — all
              inside one closed, cash-free economy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collection" className="btn-primary">
                Start Collecting <Sparkles className="size-4" />
              </Link>
              <Link href="/market" className="btn-ghost">
                View Market <Store className="size-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Swords, title: "Run Quests", body: "Daily, weekly and seasonal objectives reward XP, Free Coins and packs." },
            { icon: Layers, title: "Open Packs", body: "Every level grants a pack. Pull cards across six rarity tiers." },
            { icon: Sparkles, title: "Fuse Cards", body: "Spend Free Coins to combine duplicates into something rarer." },
            { icon: Store, title: "Trade", body: "List tradable cards on the community market for Premium Coins." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="panel p-5"
            >
              <div className="mb-3 grid size-10 place-items-center rounded-xl bg-ascend/10 text-ascend ring-1 ring-ascend/20">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Card preview */}
      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="eyebrow">The collection</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Featured cards</h2>
          </div>
          <Link href="/collection" className="hidden text-sm text-slate-400 hover:text-white sm:flex sm:items-center sm:gap-1">
            See all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {previewCards.map((c) => <CardItem key={c.id} card={c} />)}
        </div>
      </section>

      {/* Quests + premium */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-2 lg:px-8">
        <div>
          <span className="eyebrow">Daily objectives</span>
          <h2 className="mb-5 mt-2 font-display text-3xl font-bold text-white">Today&apos;s quests</h2>
          <div className="space-y-3">
            {previewQuests.map((q) => <QuestCard key={q.id} quest={q} onClaim={() => {}} />)}
          </div>
        </div>
        <div>
          <span className="eyebrow">Premium</span>
          <h2 className="mb-5 mt-2 font-display text-3xl font-bold text-white">Premium Coins</h2>
          <div className="panel space-y-4 p-6">
            <p className="text-sm leading-relaxed text-slate-300">
              Premium Coins power the community market and unlock cosmetics, frames and the
              season pass. Buy them once, and they live in your account forever.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck className="size-4 text-tactical" /> Convert Premium → Free Coins anytime
            </div>
            <ClosedEconomyNotice />
            <Link href="/shop" className="btn-cyan w-full">Visit the Shop</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-ascend text-white">
              <span className="font-display text-sm font-bold">A</span>
            </div>
            <span className="font-display text-sm font-bold text-white">ASCENDANT CARDS</span>
          </div>
          <p className="max-w-md font-mono text-[11px] leading-relaxed text-slate-500">
            A demo project. Not affiliated with Riot Games. No real-money cashout, no gift
            cards, no crypto, no gambling. Premium Coins are a closed platform currency.
          </p>
        </div>
      </footer>
    </div>
  );
}
