// ─── Pack helper library ────────────────────────────────────────────
// Pack querying + the weighted roll engine for opening packs. Rolls are
// purely cosmetic randomness over digital collectibles: there is no real
// value, no cashout, and no gambling payout of any kind.

import type {
  Pack, Card, User, PackOpeningResult, PackOpeningHistoryEntry, CollectionState,
} from "@/types";
import { resolvePacks, resolveCards, rarityOrderMap } from "@/lib/registry";
import { canAffordPack } from "@/lib/economy";
import { uid } from "@/lib/utils";

// ─── Queries ────────────────────────────────────────────────────────

export const getPackById = (id: string): Pack | undefined =>
  resolvePacks().find((p) => p.id === id);

export const getActivePacks = (): Pack[] =>
  resolvePacks().filter((p) => p.isActive);

/** Cards a pack can possibly yield (active cards in allowed, active sets). */
export function getPackCardPool(pack: Pack): Card[] {
  return resolveCards().filter(
    (c) => c.isActive && pack.allowedSetIds.includes(c.setId),
  );
}

/** Drop-rate preview: % chance per rarity, normalized from weights. */
export function getPackDropPreview(packId: string): { rarityId: string; pct: number }[] {
  const pack = getPackById(packId);
  if (!pack) return [];
  const total = pack.dropTable.reduce((s, e) => s + e.weight, 0) || 1;
  return pack.dropTable
    .map((e) => ({ rarityId: e.rarityId, pct: (e.weight / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);
}

export function calculatePackPrice(pack: Pack): { freeCoins: number; premiumCoins: number } {
  return { freeCoins: pack.priceFreeCoins, premiumCoins: pack.pricePremiumCoins };
}

export function canUserOpenPack(user: User, pack: Pack): { ok: boolean; reason?: string } {
  if (!pack.isActive) return { ok: false, reason: "This pack is not available." };
  const pool = getPackCardPool(pack);
  if (pool.length === 0) return { ok: false, reason: "This pack has no cards to award yet." };
  return canAffordPack(user, pack);
}

export const canAfford = (user: User, pack: Pack) => canAffordPack(user, pack);

// ─── Roll engine ────────────────────────────────────────────────────

function weightedPickRarity(pack: Pack, minRarityId?: string): string {
  const order = rarityOrderMap();
  const minOrder = minRarityId != null ? order[minRarityId] ?? 0 : -1;
  const eligible = pack.dropTable.filter((e) => (order[e.rarityId] ?? 0) >= minOrder);
  const table = eligible.length > 0 ? eligible : pack.dropTable;
  const total = table.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.rarityId;
  }
  return table[table.length - 1]?.rarityId ?? "common";
}

/** Roll a single card from the pack's pool, biased to a target rarity. */
export function rollCardFromDropTable(pack: Pack, forceRarityId?: string): Card | null {
  const pool = getPackCardPool(pack);
  if (pool.length === 0) return null;
  const rarityId = forceRarityId ?? weightedPickRarity(pack);
  let candidates = pool.filter((c) => c.rarityId === rarityId);
  if (candidates.length === 0) {
    // Fall back to the closest available rarity by sort order.
    const order = rarityOrderMap();
    const target = order[rarityId] ?? 0;
    candidates = [...pool].sort(
      (a, b) =>
        Math.abs((order[a.rarityId] ?? 0) - target) -
        Math.abs((order[b.rarityId] ?? 0) - target),
    );
  }
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

/** Roll the full set of cards for one pack opening, honoring guarantees. */
export function rollPackRewards(pack: Pack): Card[] {
  const out: Card[] = [];
  const order = rarityOrderMap();
  for (let i = 0; i < pack.cardCount; i++) {
    const card = rollCardFromDropTable(pack);
    if (card) out.push(card);
  }
  // Enforce guaranteed minimum rarity: if nothing meets it, upgrade one slot.
  if (pack.guaranteedRarity) {
    const minOrder = order[pack.guaranteedRarity] ?? 0;
    const meets = out.some((c) => (order[c.rarityId] ?? 0) >= minOrder);
    if (!meets && out.length > 0) {
      const forced = rollCardFromDropTable(pack, pack.guaranteedRarity);
      if (forced) out[out.length - 1] = forced;
    }
  }
  return out;
}

export function getRarityHitLevel(cards: Card[]): string {
  const order = rarityOrderMap();
  let best = "common";
  let bestOrder = -1;
  for (const c of cards) {
    const o = order[c.rarityId] ?? 0;
    if (o > bestOrder) {
      bestOrder = o;
      best = c.rarityId;
    }
  }
  return best;
}

// ─── Applying results ───────────────────────────────────────────────

/** Merge pulled cards into a collection state (increments duplicates). */
export function applyPackRewardsToCollection(
  collection: CollectionState,
  cards: Card[],
): CollectionState {
  const owned = { ...collection.owned };
  for (const c of cards) owned[c.id] = (owned[c.id] ?? 0) + 1;
  return { ...collection, owned };
}

export function createPackOpeningHistoryEntry(pack: Pack, cards: Card[]): PackOpeningHistoryEntry {
  return {
    id: uid("open"),
    packId: pack.id,
    packName: pack.name,
    cardIds: cards.map((c) => c.id),
    highestRarityId: getRarityHitLevel(cards),
    openedAt: new Date().toISOString(),
  };
}

/** Charge the pack price against a user, returning a patched user. */
export function deductPackPrice(user: User, pack: Pack): User {
  return {
    ...user,
    freeCoins: user.freeCoins - pack.priceFreeCoins,
    premiumCoins: user.premiumCoins - pack.pricePremiumCoins,
  };
}

/** High-level open: returns the result + the charged user + new collection. */
export function openPack(
  pack: Pack,
  user: User,
  collection: CollectionState,
): { result: PackOpeningResult; user: User; collection: CollectionState } {
  const cards = rollPackRewards(pack);
  const result: PackOpeningResult = {
    packId: pack.id,
    cards,
    highestRarityId: getRarityHitLevel(cards),
    openedAt: new Date().toISOString(),
  };
  return {
    result,
    user: deductPackPrice(user, pack),
    collection: applyPackRewardsToCollection(collection, cards),
  };
}
