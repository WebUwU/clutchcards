"use client";

import { useMemo } from "react";
import { TrendingUp, Swords, Library, Shield } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SignInGate } from "@/components/layout/SignInGate";
import { CardItem } from "@/components/cards/CardItem";
import { XPBar } from "@/components/ui/XPBar";
import { useGameData } from "@/components/providers/GameDataProvider";
import { MatchSyncButton } from "@/components/valorant/MatchSyncButton";

export default function ProfilePage() {
  const { profile, inventory, catalog } = useGameData();

  const totalCards = catalog?.cards.length ?? 0;
  const owned = inventory.length;
  const completion = totalCards > 0 ? Math.round((owned / totalCards) * 100) : 0;
  const favorites = useMemo(
    () => inventory.filter((i) => i.favorite).slice(0, 5).map((i) => ({ ...i.card, ownedAmount: i.amount })),
    [inventory],
  );
  const topCards = useMemo(
    () => inventory.slice(0, 5).map((i) => ({ ...i.card, ownedAmount: i.amount })),
    [inventory],
  );

  return (
    <AppShell>
      <SignInGate>
      {profile && (
        <>
          <div className="panel p-6">
            <div className="flex items-center gap-4">
              <div className="size-16 overflow-hidden rounded-2xl bg-gradient-to-br from-ascend/40 to-tactical/30 ring-2 ring-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold text-white">{profile.displayName || profile.username}</h1>
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Shield className="size-3.5" /> Level {profile.level} · @{profile.username}
                </div>
                {profile.bio && <p className="mt-1 text-sm text-slate-400">{profile.bio}</p>}
              </div>
              <MatchSyncButton />
            </div>
            <div className="mt-4"><XPBar level={profile.level} xp={profile.xp} /></div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
            <div className="panel p-4">
              <Library className="mb-2 size-5 text-tactical" />
              <div className="font-display text-2xl font-bold text-white">{completion}%</div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Collection</div>
            </div>
            <div className="panel p-4">
              <TrendingUp className="mb-2 size-5 text-rarity-rare" />
              <div className="font-display text-2xl font-bold text-white">{owned}/{totalCards}</div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Cards owned</div>
            </div>
            <div className="panel p-4">
              <Swords className="mb-2 size-5 text-ascend" />
              <div className="font-display text-2xl font-bold text-white">{profile.dailyStreak}</div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Day streak</div>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 font-display text-xl font-bold text-white">Favorite cards</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {favorites.map((c) => <CardItem key={c.id} card={c} />)}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-white">{favorites.length > 0 ? "Recent cards" : "Your cards"}</h2>
            {topCards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {topCards.map((c) => <CardItem key={c.id} card={c} />)}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No cards yet — open a pack to start your collection!</p>
            )}
          </div>
        </>
      )}
      </SignInGate>
    </AppShell>
  );
}
