// Thin client for the server API. All economy actions go through these.
async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json.data as T;
}

export const api = {
  me: () => req<{ profile: Record<string, unknown>; valorant: unknown }>("/api/me"),
  packs: () => req<unknown[]>("/api/packs"),
  openPack: (packId: string) => req<{ cards: unknown[]; highestRarity: string }>("/api/packs/open", { method: "POST", body: JSON.stringify({ packId }) }),
  inventory: () => req<unknown[]>("/api/inventory"),
  market: () => req<unknown[]>("/api/market"),
  buy: (listingId: string) => req("/api/market/buy", { method: "POST", body: JSON.stringify({ listingId }) }),
  sell: (cardId: string, price: number) => req("/api/market/sell", { method: "POST", body: JSON.stringify({ cardId, price }) }),
  cancelListing: (listingId: string) => req("/api/market/cancel", { method: "POST", body: JSON.stringify({ listingId }) }),
  exchange: (premiumAmount: number) => req("/api/exchange", { method: "POST", body: JSON.stringify({ premiumAmount }) }),
  quests: () => req<unknown[]>("/api/quests"),
  claimQuest: (questId: string) => req("/api/quests/claim", { method: "POST", body: JSON.stringify({ questId }) }),
  linkRiot: (riotName: string, riotTag: string, region: string) => req("/api/riot/link", { method: "POST", body: JSON.stringify({ riotName, riotTag, region }) }),
  syncMatches: () => req<{ added: number; total: number }>("/api/riot/sync", { method: "POST" }),
};
