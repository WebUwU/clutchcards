"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PackGrid } from "@/components/packs/PackGrid";
import { PackDetailModal } from "@/components/packs/PackDetailModal";
import { PackOpeningModal } from "@/components/packs/PackOpeningModal";
import { PackOpeningHistory } from "@/components/packs/PackOpeningHistory";
import { PackSafetyNotice } from "@/components/packs/PackSafetyNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocalDb } from "@/hooks/useLocalDb";
import { getActivePacks, canAfford } from "@/lib/packs";
import { saveLocalUser } from "@/lib/localDb";
import { useToast } from "@/components/ui/Toast";
import type { Pack, PackOpeningResult, User, CollectionState } from "@/types";
import { Gem, Coins } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function PacksPage() {
  const toast = useToast();
  const { loading, user, settings, collection, updateUser, setCollection } = useLocalDb();
  const [detail, setDetail] = useState<Pack | null>(null);
  const [opening, setOpening] = useState<Pack | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const packs = useMemo(() => getActivePacks(), []);
  const reduceMotion = settings?.appearance.reduceMotion ?? false;

  const tryOpen = (pack: Pack) => {
    if (!user) return;
    const aff = canAfford(user, pack);
    if (!aff.ok) { toast(aff.reason ?? "Can't open this pack.", "error"); return; }
    setDetail(null);
    setOpening(pack);
  };

  const handleComplete = (_result: PackOpeningResult, nextUser: User, nextCollection: CollectionState) => {
    // Persist charged balance + new cards.
    updateUser({ freeCoins: nextUser.freeCoins, premiumCoins: nextUser.premiumCoins });
    saveLocalUser(nextUser);
    setCollection(nextCollection);
    setHistoryKey((k) => k + 1);
  };

  const openAnother = () => {
    if (!opening || !user) return;
    const aff = canAfford(user, opening);
    if (!aff.ok) { toast(aff.reason ?? "Not enough coins for another.", "error"); setOpening(null); return; }
    // Force the modal to remount with a fresh roll.
    const again = opening;
    setOpening(null);
    setTimeout(() => setOpening(again), 50);
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-ascend/15 text-ascend"><Package className="size-5" /></div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Packs</h1>
            <p className="text-sm text-slate-400">Open packs to grow your collection.</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-tactical"><Coins className="size-4" />{formatNumber(user.freeCoins)}</span>
            <span className="flex items-center gap-1.5 text-rarity-legendary"><Gem className="size-4" />{formatNumber(user.premiumCoins)}</span>
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
        <div className="space-y-8">
          <PackGrid packs={packs} onOpen={tryOpen} onDetails={setDetail} />
          <PackOpeningHistory refreshKey={historyKey} />
        </div>
      )}

      <PackDetailModal
        pack={detail}
        canAfford={!!(detail && user && canAfford(user, detail).ok)}
        onClose={() => setDetail(null)}
        onOpen={tryOpen}
      />

      {opening && user && collection && (
        <PackOpeningModal
          pack={opening}
          user={user}
          collection={collection}
          reduceMotion={reduceMotion}
          onClose={() => setOpening(null)}
          onComplete={handleComplete}
          onOpenAnother={openAnother}
        />
      )}
    </AppShell>
  );
}
