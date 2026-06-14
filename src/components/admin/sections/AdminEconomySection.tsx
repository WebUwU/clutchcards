"use client";

import { useMemo, useState } from "react";
import type { EconomyConfig } from "@/types";
import { Field, NumberInput } from "../fields";
import { SectionHeader } from "./AdminCardsSection";
import { resolveEconomyConfig } from "@/lib/registry";
import { saveEconomyConfig } from "@/lib/localDb";
import { useToast } from "@/components/ui/Toast";
import { ShieldCheck, Lock } from "lucide-react";

export function AdminEconomySection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const [v, setV] = useState(0);
  const initial = useMemo(() => resolveEconomyConfig(), [v]);
  const [cfg, setCfg] = useState<EconomyConfig>(initial);
  const set = <K extends keyof EconomyConfig>(k: K, val: EconomyConfig[K]) => setCfg((c) => ({ ...c, [k]: val }));

  const save = () => {
    saveEconomyConfig({ ...cfg, allowFreeToPremium: false, allowCashout: false });
    toast("Economy config saved", "success");
    setV((x) => x + 1); onChanged();
  };

  return (
    <div className="max-w-lg">
      <SectionHeader title="Economy Rules" desc="Tune fees and conversion rates. The closed-economy invariants below are permanently locked." />
      <div className="panel p-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Market fee rate" hint="0–1 (e.g. 0.1 = 10%)"><NumberInput value={cfg.marketFeeRate} onChange={(x) => set("marketFeeRate", x)} min={0} step={0.01} /></Field>
          <Field label="Listing flat fee (PC)"><NumberInput value={cfg.listingFeeFlat} onChange={(x) => set("listingFeeFlat", x)} min={0} /></Field>
          <Field label="Premium → Free rate" hint="1 PC = N FC"><NumberInput value={cfg.premiumToFreeRate} onChange={(x) => set("premiumToFreeRate", x)} min={1} /></Field>
          <Field label="Fusion base cost (FC)"><NumberInput value={cfg.fusionBaseCost} onChange={(x) => set("fusionBaseCost", x)} min={0} /></Field>
          <Field label="Fusion per extra card (FC)"><NumberInput value={cfg.fusionPerExtraCard} onChange={(x) => set("fusionPerExtraCard", x)} min={0} /></Field>
        </div>
        <button onClick={save} className="btn-primary mt-2 w-full">Save economy config</button>
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
