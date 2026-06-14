// ─── Card helper library ────────────────────────────────────────────
// Read/query helpers operate on the effective (seed + admin) card list.
// CRUD helpers mutate the admin-created overlay in local DB and return the
// updated admin list, so seeds remain immutable.

import type { Card, CardFilterState, CollectionState, User } from "@/types";
import {
  resolveCards, resolveRarities, rarityOrderMap,
} from "@/lib/registry";
import { getAdminCards, saveAdminCards } from "@/lib/localDb";
import { slugify } from "@/lib/utils";

// ─── Queries ────────────────────────────────────────────────────────

export const getCardById = (id: string): Card | undefined =>
  resolveCards().find((c) => c.id === id);

export const getCardsBySet = (setId: string): Card[] =>
  resolveCards().filter((c) => c.setId === setId);

export const getCardsByRarity = (rarityId: string): Card[] =>
  resolveCards().filter((c) => c.rarityId === rarityId);

export const getFeaturedCards = (): Card[] =>
  resolveCards().filter((c) => c.isFeatured && c.isActive);

export const getTradableCards = (): Card[] =>
  resolveCards().filter((c) => c.tradable && c.isActive);

export const getCardsByTag = (tag: string): Card[] =>
  resolveCards().filter((c) => c.tags.includes(tag));

export function searchCards(query: string): Card[] {
  const q = query.trim().toLowerCase();
  if (!q) return resolveCards();
  return resolveCards().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

/** Returns cards with live owned amounts taken from the collection. */
export function withOwnedAmounts(cards: Card[], collection: CollectionState | null): Card[] {
  if (!collection) return cards;
  return cards.map((c) => ({ ...c, ownedAmount: collection.owned[c.id] ?? 0 }));
}

export function getOwnedCards(collection: CollectionState | null): Card[] {
  return withOwnedAmounts(resolveCards(), collection).filter((c) => c.ownedAmount > 0);
}

export function getDuplicateCards(collection: CollectionState | null): Card[] {
  return withOwnedAmounts(resolveCards(), collection).filter((c) => c.ownedAmount > 1);
}

// ─── Filtering / sorting ────────────────────────────────────────────

export function filterCards(cards: Card[], f: CardFilterState): Card[] {
  const order = rarityOrderMap();
  const q = f.query.trim().toLowerCase();
  let out = cards.filter((c) => {
    if (f.setId !== "all" && c.setId !== f.setId) return false;
    if (f.rarityId !== "all" && c.rarityId !== f.rarityId) return false;
    if (f.typeId !== "all" && c.typeId !== f.typeId) return false;
    if (f.tradableOnly && !c.tradable) return false;
    if (f.ownedFilter === "owned" && c.ownedAmount < 1) return false;
    if (f.ownedFilter === "missing" && c.ownedAmount > 0) return false;
    if (f.duplicatesOnly && c.ownedAmount < 2) return false;
    if (f.limitedOnly && !c.isLimited) return false;
    if (f.animatedOnly && !c.isAnimated) return false;
    if (q) {
      const hit =
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  out = out.sort((a, b) => {
    switch (f.sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "owned":
        return b.ownedAmount - a.ownedAmount;
      case "newest":
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      case "set":
        return a.setId.localeCompare(b.setId);
      case "rarity":
      default:
        return (order[b.rarityId] ?? 0) - (order[a.rarityId] ?? 0);
    }
  });
  return out;
}

// ─── Admin CRUD (mutates admin overlay) ─────────────────────────────

export type CardInput = Omit<Card, "createdAt"> & { createdAt?: string };

function currentAdminCards(): Card[] {
  // Start from existing admin list, or empty (seeds are never mutated).
  return getAdminCards() ?? [];
}

export function createCard(input: CardInput): Card {
  const list = currentAdminCards();
  const card: Card = {
    ...input,
    slug: input.slug || slugify(input.name),
    rarityId: input.rarityId || input.rarity,
    rarity: input.rarity || input.rarityId,
    typeId: input.typeId || input.type,
    type: input.type || input.typeId,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  const next = [...list.filter((c) => c.id !== card.id), card];
  saveAdminCards(next);
  return card;
}

export function updateCard(id: string, patch: Partial<Card>): Card | undefined {
  // If editing a seed card, copy it into the admin overlay first.
  const existing = getCardById(id);
  if (!existing) return undefined;
  const list = currentAdminCards();
  const merged: Card = { ...existing, ...patch, id };
  const next = [...list.filter((c) => c.id !== id), merged];
  saveAdminCards(next);
  return merged;
}

export function disableCard(id: string): Card | undefined {
  return updateCard(id, { isActive: false });
}

export function enableCard(id: string): Card | undefined {
  return updateCard(id, { isActive: true });
}

export function deleteCard(id: string): void {
  const list = currentAdminCards();
  // Tombstone: store a disabled overlay so seed cards also vanish from views
  // that filter on isActive. If it's a pure admin card, just drop it.
  const isSeedCard = !list.some((c) => c.id === id) && !!getCardById(id);
  if (isSeedCard) {
    const existing = getCardById(id)!;
    saveAdminCards([...list, { ...existing, isActive: false }]);
  } else {
    saveAdminCards(list.filter((c) => c.id !== id));
  }
}

export function getAllRaritiesSorted() {
  return resolveRarities();
}
