"use client";

import { Award, TrendingUp, Swords, Library } from "lucide-react";
import { currentUser } from "@/data/user";
import { cards } from "@/data/cards";
import { getCardById } from "@/lib/cards";
import { quests } from "@/data/quests";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { CardItem } from "@/components/cards/CardItem";

export default function ProfilePage() {
  const owned = cards.filter((c) => c.ownedAmount > 0).length;
  const completion = Math.round((owned / cards.length) * 100);
  const questsClaimed = quests.filter((q) => q.status === "claimed").length;
  const favorites = currentUser.favoriteCardIds.map((id) => getCardById(id)).filter(Boolean);

  const stats = [
    { label: "Collection", value: `${completion}%`, icon: Library, accent: "text-tactical" },
    { label: "Cards owned", value: `${owned}/${cards.length}`, icon: TrendingUp, accent: "text-rarity-rare" },
    { label: "Quests done", value: String(questsClaimed), icon: Swords, accent: "text-ascend" },
    { label: "Badges", value: String(currentUser.badges.length), icon: Award, accent: "text-rarity-legendary" },
  ];

  return (
    <AppShell>
      <ProfileHeader user={currentUser} />

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-4">
            <s.icon className={`mb-2 size-5 ${s.accent}`} />
            <div className="font-display text-2xl font-bold text-white">{s.value}</div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold text-white">Favorite cards</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {favorites.map((c) => c && <CardItem key={c.id} card={c} />)}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl font-bold text-white">Badges</h2>
        <div className="flex flex-wrap gap-2">
          {currentUser.badges.map((b) => (
            <span key={b} className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-ink-800/60 px-3 py-2 text-sm text-slate-200">
              <Award className="size-4 text-rarity-legendary" /> {b}
            </span>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
