"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Store, Swords, Layers, Package, ShieldCheck, Flame, Trophy, Gem, Crown, Zap } from "lucide-react";

const features = [
  { icon: Package, title: "Open Packs", desc: "Crack packs and pull cards across rarities — from Common to Mythic.", color: "#ff4655", href: "/packs" },
  { icon: Swords, title: "Complete Quests", desc: "Link your Valorant account and earn rewards from real match performance.", color: "#1ce5d4", href: "/quests" },
  { icon: Store, title: "Trade on the Market", desc: "Buy and sell tradable cards with other collectors on an open market.", color: "#3ea6ff", href: "/market" },
  { icon: Layers, title: "Build Your Collection", desc: "Complete sets, track progress and climb the vault.", color: "#b15cff", href: "/collection" },
];

const steps = [
  { n: "01", title: "Create your account", desc: "Sign up free and get 1,000 coins to start." },
  { n: "02", title: "Open your first pack", desc: "Pull your starter cards and begin your collection." },
  { n: "03", title: "Quest, trade, complete", desc: "Earn from matches, trade duplicates, finish sets." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/4 size-[36rem] rounded-full bg-ascend/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 size-[32rem] rounded-full bg-tactical/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 size-[28rem] rounded-full bg-rarity-epic/10 blur-[120px]" />
      </div>

      {/* nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-ascend text-white shadow-glow">
            <span className="font-display text-lg font-bold">C</span>
          </div>
          <div className="leading-none">
            <div className="font-display text-base font-bold tracking-tight text-white">CLUTCHCARDS</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500">Collect · Trade · Clutch</div>
          </div>
        </div>
        <Link href="/login" className="btn-ghost px-4 py-2 text-sm">Sign in</Link>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16 pt-12 sm:pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ascend/30 bg-ascend/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ascend-bright">
            <Flame className="size-3.5" /> Season · Act IV live now
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] text-white sm:text-6xl">
            Collect. Trade.<br /><span className="bg-gradient-to-r from-ascend via-ascend-bright to-rarity-epic bg-clip-text text-transparent">Clutch.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            Collect digital cards by completing Valorant-based quests, opening packs, and trading on the market. Build your collection and complete your legacy.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login" className="btn-primary px-6 py-3 text-base">Start Collecting <ArrowRight className="size-4" /></Link>
            <Link href="/packs" className="btn-cyan px-6 py-3 text-base"><Package className="size-4" /> Open Free Pack</Link>
            <Link href="/market" className="btn-ghost px-6 py-3 text-base"><Store className="size-4" /> View Market</Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-rarity-uncommon" /> Closed economy · no gambling</span>
            <span className="flex items-center gap-1.5"><Gem className="size-3.5 text-rarity-legendary" /> 1,000 coins free to start</span>
            <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-tactical" /> Daily quests & packs</span>
          </div>
        </motion.div>
      </section>

      {/* feature cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <Link href={f.href} className="card-surface group block h-full p-5">
                <div className="absolute -right-8 -top-8 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40" style={{ background: f.color }} />
                <div className="relative grid size-11 place-items-center rounded-xl" style={{ background: `${f.color}1a`, color: f.color }}>
                  <f.icon className="size-5" />
                </div>
                <h3 className="relative mt-4 font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-16">
        <h2 className="mb-6 text-center font-display text-2xl font-bold text-white sm:text-3xl">Start in three steps</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="panel p-6">
              <div className="font-display text-3xl font-bold text-ascend/40">{s.n}</div>
              <h3 className="mt-2 font-display text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* founder teaser */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-2xl border border-rarity-legendary/30 bg-gradient-to-br from-rarity-legendary/10 via-ink-900 to-ink-950 p-7 sm:p-9">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-rarity-legendary/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-rarity-legendary/40 bg-rarity-legendary/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-rarity-legendary">
                <Crown className="size-3.5" /> Coming soon
              </div>
              <h3 className="mt-3 font-display text-2xl font-bold text-white">Become a Founder</h3>
              <p className="mt-1.5 max-w-md text-sm text-slate-300">
                Early supporters get an exclusive Founder card, a profile frame, a Supporter badge and Founder status. Support the project as it grows.
              </p>
            </div>
            <Link href="/shop" className="btn-founder shrink-0 px-6 py-3"><Trophy className="size-4" /> Learn more</Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">ClutchCards · Collect. Trade. Clutch.</p>
          <p className="mt-2 text-xs text-slate-600">A closed-economy collectible game. Not affiliated with Riot Games. No real-money gambling.</p>
        </div>
      </footer>
    </div>
  );
}
