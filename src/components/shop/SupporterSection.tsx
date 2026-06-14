"use client";

import { Crown, Shield, Frame, Megaphone, Target, Trophy, Sparkles, Lock } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Monetization prep — everything here is a CLEARLY-LABELLED "Coming soon"
// showcase. No payment is triggered; no fake charges. Founder Pack is a FIXED
// bundle (no randomized odds), so no drop-rate disclosure is required.
const FOUNDER_PERKS = [
  { icon: Crown, label: "Founder card", desc: "An exclusive card only early supporters will ever own." },
  { icon: Shield, label: "Supporter badge", desc: "A permanent badge shown on your profile." },
  { icon: Frame, label: "Profile frame", desc: "A cosmetic frame to make your profile stand out." },
  { icon: Sparkles, label: "Early supporter status", desc: "Recognition for backing the project early." },
];

export function SupporterSection() {
  const toast = useToast();
  const notify = () => toast("Founder Pack isn't on sale yet — it's coming soon.", "info");

  return (
    <div className="space-y-6">
      {/* Founder Pack — fixed bundle */}
      <div className="relative overflow-hidden rounded-2xl border border-rarity-legendary/30 bg-gradient-to-br from-rarity-legendary/10 via-ink-900 to-ink-950 p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-rarity-legendary/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-rarity-legendary/40 bg-rarity-legendary/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-rarity-legendary">
            <Lock className="size-3.5" /> Coming soon
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold text-white">Founder Pack</h2>
          <p className="mt-1.5 max-w-lg text-sm text-slate-300">
            A one-time, fixed bundle for early supporters. Exact contents — no randomized odds, no surprises. Everything below is included.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {FOUNDER_PERKS.map((p) => (
              <div key={p.label} className="flex gap-3 rounded-xl border border-white/[0.06] bg-ink-900/50 p-3.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-rarity-legendary/10 text-rarity-legendary"><p.icon className="size-4.5" /></div>
                <div>
                  <div className="font-display text-sm font-semibold text-white">{p.label}</div>
                  <div className="text-xs text-slate-400">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={notify} className="btn-founder mt-6 px-6 py-3"><Trophy className="size-4" /> Notify me at launch</button>
          <p className="mt-2 font-mono text-[11px] text-slate-500">Payments are not enabled yet. Nothing will be charged.</p>
        </div>
      </div>

      {/* Other supporter perks */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Shield, title: "Supporter Badge", desc: "Show your support with a profile badge.", color: "#1ce5d4" },
          { icon: Frame, title: "Profile Frames", desc: "Cosmetic frames to personalize your profile.", color: "#b15cff" },
          { icon: Trophy, title: "Tournament Rewards", desc: "Exclusive cards for community events.", color: "#ffb017" },
        ].map((c) => (
          <div key={c.title} className="card-surface p-5">
            <div className="grid size-10 place-items-center rounded-xl" style={{ background: `${c.color}1a`, color: c.color }}><c.icon className="size-5" /></div>
            <h3 className="mt-3 font-display text-base font-bold text-white">{c.title}</h3>
            <p className="mt-1 text-xs text-slate-400">{c.desc}</p>
            <span className="mt-3 inline-block chip bg-white/5 text-slate-500">Coming soon</span>
          </div>
        ))}
      </div>

      {/* Community funding goal */}
      <div className="panel p-6">
        <div className="flex items-center gap-2 text-tactical"><Target className="size-4" /><span className="font-display text-base font-bold text-white">Community Goal</span></div>
        <p className="mt-1 text-sm text-slate-400">Help unlock the next season of cards and events. Progress is illustrative for now.</p>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between font-mono text-[11px] text-slate-400"><span>Season II funding</span><span>0% · coming soon</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink-950/60 ring-1 ring-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-tactical to-rarity-rare" style={{ width: "3%" }} />
          </div>
        </div>
      </div>

      {/* Sponsored slot placeholder */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-ink-900/40 p-8 text-center">
        <Megaphone className="size-6 text-slate-600" />
        <p className="mt-2 font-display text-sm font-semibold text-slate-400">Advertise here</p>
        <p className="mt-0.5 text-xs text-slate-600">Sponsored placement coming soon for community partners.</p>
      </div>
    </div>
  );
}
