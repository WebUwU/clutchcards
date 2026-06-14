"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types";
import { SectionHeader } from "./AdminCardsSection";
import { getLocalUser } from "@/lib/localDb";
import { currentUser as seedUser } from "@/data/user";
import { Coins, Gem, Star, Trophy } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function AdminUsersSection() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { setUser(getLocalUser() ?? seedUser); }, []);
  if (!user) return null;

  const stats = [
    { label: "Level", value: user.level, icon: Star },
    { label: "XP", value: formatNumber(user.xp), icon: Trophy },
    { label: "Free Coins", value: formatNumber(user.freeCoins), icon: Coins },
    { label: "Premium Coins", value: formatNumber(user.premiumCoins), icon: Gem },
  ];

  return (
    <div>
      <SectionHeader title="Users Preview" desc="This local demo has a single player profile (stored in your browser). A real deployment would list all server users here." />
      <div className="panel max-w-lg p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="size-12 rounded-xl bg-ink-700 bg-cover" style={{ backgroundImage: `url(${user.avatar})` }} />
          <div>
            <div className="font-display text-lg font-bold text-white">{user.displayName || user.username}</div>
            <div className="text-xs text-slate-400">@{user.username} · {user.rank}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-ink-900/50 p-3">
              <s.icon className="mb-1 size-4 text-slate-500" />
              <div className="font-display text-lg font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
