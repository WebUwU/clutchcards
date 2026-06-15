// Thin client for the server API. All economy actions go through these.
async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json.data as T;
}

export interface MeProfile {
  id: string; username: string; displayName: string; bio: string; avatar: string;
  region: string; language: string; timezone: string; favoriteRole: string; favoriteCategory: string;
  level: number; xp: number; freeCoins: number; premiumCoins: number; dailyStreak: number;
  isPublic: boolean; showcaseCardIds: string;
}

export const api = {
  me: () => req<{ profile: MeProfile; valorant: unknown }>("/api/me"),
  catalog: () => req<{ cards: any[]; sets: any[]; rarities: any[]; types: any[] }>("/api/catalog"),
  packs: () => req<any[]>("/api/packs"),
  openPack: (packId: string) => req<{ cards: any[]; highestRarity: string }>("/api/packs/open", { method: "POST", body: JSON.stringify({ packId }) }),
  inventory: () => req<any[]>("/api/inventory"),
  market: () => req<any[]>("/api/market"),
  buy: (listingId: string) => req("/api/market/buy", { method: "POST", body: JSON.stringify({ listingId }) }),
  sell: (cardId: string, price: number) => req("/api/market/sell", { method: "POST", body: JSON.stringify({ cardId, price }) }),
  cancelListing: (listingId: string) => req("/api/market/cancel", { method: "POST", body: JSON.stringify({ listingId }) }),
  exchange: (premiumAmount: number) => req<{ freeCoins: number; premiumCoins: number; freeReceived: number }>("/api/exchange", { method: "POST", body: JSON.stringify({ premiumAmount }) }),
  quests: () => req<any[]>("/api/quests"),
  claimQuest: (questId: string) => req("/api/quests/claim", { method: "POST", body: JSON.stringify({ questId }) }),
  getSettings: () => req<Record<string, unknown>>("/api/settings"),
  saveSettings: (settings: Record<string, unknown>) => req("/api/settings", { method: "PUT", body: JSON.stringify(settings) }),
  updateProfile: (patch: Record<string, unknown>) => req<MeProfile>("/api/profile", { method: "PUT", body: JSON.stringify(patch) }),
  linkRiot: (riotName: string, riotTag: string, region: string) => req("/api/riot/link", { method: "POST", body: JSON.stringify({ riotName, riotTag, region }) }),
  syncMatches: () => req<{ added: number; total: number }>("/api/riot/sync", { method: "POST" }),
  // Admin CRUD (entity = cards | sets | rarities | types | packs | quests)
  adminList: (entity: string) => req<any[]>(`/api/admin/${entity}`),
  adminSave: (entity: string, data: Record<string, unknown>) => req<any>(`/api/admin/${entity}`, { method: "POST", body: JSON.stringify(data) }),
  adminDelete: (entity: string, id: string) => req(`/api/admin/${entity}?id=${encodeURIComponent(id)}`, { method: "DELETE" }),
  adminAudit: () => req<any[]>("/api/admin/audit"),
};
