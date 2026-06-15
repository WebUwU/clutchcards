"use client";

import { useEffect, useState } from "react";
import { SectionHeader } from "./AdminCardsSection";
import { useToast } from "@/components/ui/Toast";
import { ShieldCheck, Lock } from "lucide-react";

// Read-only view of the live, server-enforced economy values. These are
// enforced in code (economy.server.ts) — the source of truth for the
// closed economy — so they're shown here for transparency, not editing.
export function AdminEconomySection() {
  const toast = useToast();
  const [cfg, setCfg] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/economy").then((r) => r.json()).then((j) => setCfg(j.data)).catch(() => {});
  }, []);

  const rows = cfg ? [
    { label: "Market fee rate", value: `${Math.round(cfg.marketFeeRate * 100)}%` },
    { label: "Listing flat fee", value: `${cfg.listingFeeFlat} PC` },
    { label: "Premium → Free rate", value: `1 PC = ${cfg.premiumToFreeRate} FC` },
  ] : [];

  return (
    <div className="max-w-lg">
      <SectionHeader title="Economy Rules" desc="Live, server-enforced economy values. These are defined in code as the single source of truth for the closed economy." />
      <div className="panel p-5">
        {cfg ? (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-lg bg-ink-900/50 px-3 py-2.5">
                <span className="text-sm text-slate-300">{r.label}</span>
                <span className="font-mono text-sm font-semibold text-white">{r.value}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-slate-500">Loading…</p>}
      </div>

      <div className="mt-4 space-y-2">
        {[
          "Free Coins can never be converted to Premium Coins",
          "No cashout to real money, gift cards or crypto",
          "No external transfers of any currency or item",
          "Pack rewards and cards are digital collectibles only",
        ].map((t) => (
          <div key={t} className="flex items-center gap-2 rounded-xl bg-rarity-uncommon/[0.06] px-3 py-2.5 text-xs text-rarity-uncommon ring-1 ring-rarity-uncommon/15">
            <Lock className="size-3.5 shrink-0" /> {t}
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-xl bg-tactical/[0.06] px-3 py-2.5 text-xs text-tactical ring-1 ring-tactical/15">
          <ShieldCheck className="size-3.5 shrink-0" /> These rules are enforced in code regardless of any config value.
        </div>
      </div>
    </div>
  );
}
