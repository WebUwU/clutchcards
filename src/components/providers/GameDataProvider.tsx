"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { api, MeProfile } from "@/lib/apiClient";

interface InventoryEntry { id: string; amount: number; favorite: boolean; card: any; }

interface GameData {
  status: "loading" | "authenticated" | "unauthenticated";
  profile: MeProfile | null;
  catalog: { cards: any[]; sets: any[]; rarities: any[]; types: any[] } | null;
  inventory: InventoryEntry[];
  ownedMap: Record<string, number>;
  refreshProfile: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  setProfileLocal: (p: Partial<MeProfile>) => void;
}

const Ctx = createContext<GameData | null>(null);

export function GameDataProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [catalog, setCatalog] = useState<GameData["catalog"]>(null);
  const [inventory, setInventory] = useState<InventoryEntry[]>([]);

  const refreshProfile = useCallback(async () => {
    try { const me = await api.me(); setProfile(me.profile); } catch { /* not logged in */ }
  }, []);
  const refreshInventory = useCallback(async () => {
    try { setInventory(await api.inventory() as InventoryEntry[]); } catch { setInventory([]); }
  }, []);

  // Catalog is public — always load it.
  useEffect(() => { api.catalog().then(setCatalog).catch(() => setCatalog(null)); }, []);

  // Profile + inventory require a session.
  useEffect(() => {
    if (status === "authenticated") { refreshProfile(); refreshInventory(); }
    else if (status === "unauthenticated") { setProfile(null); setInventory([]); }
  }, [status, refreshProfile, refreshInventory]);

  const ownedMap = inventory.reduce<Record<string, number>>((m, i) => { m[i.card.id] = i.amount; return m; }, {});
  const setProfileLocal = (p: Partial<MeProfile>) => setProfile((prev) => (prev ? { ...prev, ...p } : prev));

  return (
    <Ctx.Provider value={{
      status: status as GameData["status"],
      profile, catalog, inventory, ownedMap,
      refreshProfile, refreshInventory, setProfileLocal,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGameData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGameData must be used within GameDataProvider");
  return ctx;
}
