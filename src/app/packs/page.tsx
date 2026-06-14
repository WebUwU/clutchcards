"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Gem, Coins } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SignInGate } from "@/components/layout/SignInGate";
import { PackGrid } from "@/components/packs/PackGrid";
import { PackDetailModal } from "@/components/packs/PackDetailModal";
import { ServerPackOpeningModal } from "@/components/packs/ServerPackOpeningModal";
import { PackSafetyNotice } from "@/components/packs/PackSafetyNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useGameData } from "@/components/providers/GameDataProvider";
import { api } from "@/lib/apiClient";
import type { Pack, Card } from "@/types";
import { formatNumber } from "@/lib/utils";

function canAffordPack(profile: { freeCoins: number; premiumCoins: number } | null, pack: Pack) {
  if (!profile) return false;
  if (pack.pricePremiumCoins > 0 && profile.premiumCoins < pack.pricePremiumCoins) return false;
  if (pack.priceFreeCoins > 0 && profile.freeCoins < pack.priceFreeCoins) return false;
  return true;
}

export default function PacksPage() {
  const toast = useToast();
  const { profile, refreshProfile, refreshInventory } = useGameData();
  const settings = null as null; // reduce-motion read from prefers-reduced-motion below
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Pack | null>(null);
  const [opening, setOpening] = useState<{ pack: Pack; cards: Card[]; highestRarity: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => { api.packs().then((p) => setPacks(p as Pack[])).catch(() => setPacks([])).finally(() => setLoading(false)); }, []);

  const doOpen = async (pack: Pack) => {
    if (busy) return;
    if (!canAffordPack(profile, pack)) { toast("Not enough coins for this pack.", "error"); return; }
    setBusy(true);
    setDetail(null);
    try {
      const res = await api.openPack(pack.id);
      setOpening({ pack, cards: res.cards as Card[], highestRarity: res.highestRarity });
      await Promise.all([refreshProfile(), refreshInventory()]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to open pack", "error");
    } finally {
      setBusy(false);
    }
  };

  const openAnother = async () => {
    const pack = opening?.pack;
    setOpening(null);
    if (pack) await doOpen(pack);
  };

  return (
    <AppShell>
      <SignInGate>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-ascend/15 text-ascend"><Package className="size-5" /></div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Packs</h1>
              <p className="text-sm text-slate-400">Open packs to grow your collection.</p>
            </div>
          </div>
          {profile && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-tactical"><Coins className="size-4" />{formatNumber(profile.freeCoins)}</span>
              <span className="flex items-center gap-1.5 text-rarity-legendary"><Gem className="size-4" />{formatNumber(profile.premiumCoins)}</span>
            </div>
          )}
        </div>

        <div className="mb-5"><PackSafetyNotice /></div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-ink-800/60" />)}
          </div>
        ) : packs.length === 0 ? (
          <EmptyState icon={<Package className="size-6" />} title="No packs available" hint="Create one in the admin panel to get started." />
        ) : (
          <PackGrid packs={packs} onOpen={doOpen} onDetails={setDetail} />
        )}

        <PackDetailModal
          pack={detail}
          canAfford={!!(detail && canAffordPack(profile, detail))}
          onClose={() => setDetail(null)}
          onOpen={doOpen}
        />

        {opening && (
          <ServerPackOpeningModal
            pack={opening.pack}
            cards={opening.cards}
            highestRarity={opening.highestRarity}
            reduceMotion={!!reduceMotion}
            onClose={() => setOpening(null)}
            onOpenAnother={openAnother}
          />
        )}
      </SignInGate>
    </AppShell>
  );
}
