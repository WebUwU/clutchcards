// ─── Runtime registry ───────────────────────────────────────────────
// Resolves the "effective" set of cards / sets / packs / rarities / etc by
// merging seed data with admin-created overrides from local DB. Admin entries
// with the same id override seed entries; new ids are appended. All functions
// are SSR-safe (local DB returns null on the server, so seeds are used).

import { cards as seedCards } from "@/data/cards";
import { cardSets as seedSets } from "@/data/cardSets";
import { packs as seedPacks } from "@/data/packs";
import { quests as seedQuests } from "@/data/quests";
import { shopItems as seedShop } from "@/data/shop";
import { rarities as seedRarities } from "@/data/rarities";
import { cardTypes as seedTypes } from "@/data/cardTypes";
import { defaultEconomyConfig } from "@/data/adminConfig";
import {
  getAdminCards, getAdminCardSets, getAdminPacks, getAdminQuests,
  getAdminShopItems, getAdminRarities, getAdminCardTypes, getEconomyConfig,
} from "@/lib/localDb";
import type {
  Card, CardSet, Pack, Quest, ShopItem, RarityConfig, CardTypeConfig, EconomyConfig,
} from "@/types";

function mergeById<T extends { id: string }>(seed: T[], admin: T[] | null): T[] {
  if (!admin || admin.length === 0) return [...seed];
  const map = new Map<string, T>();
  for (const item of seed) map.set(item.id, item);
  for (const item of admin) map.set(item.id, item); // admin overrides / appends
  return Array.from(map.values());
}

export const resolveCards = (): Card[] => mergeById(seedCards, getAdminCards());
export const resolveCardSets = (): CardSet[] => mergeById(seedSets, getAdminCardSets());
export const resolvePacks = (): Pack[] => mergeById(seedPacks, getAdminPacks());
export const resolveQuests = (): Quest[] => mergeById(seedQuests, getAdminQuests());
export const resolveShopItems = (): ShopItem[] => mergeById(seedShop, getAdminShopItems());
export const resolveRarities = (): RarityConfig[] =>
  mergeById(seedRarities, getAdminRarities()).sort((a, b) => a.sortOrder - b.sortOrder);
export const resolveCardTypes = (): CardTypeConfig[] => mergeById(seedTypes, getAdminCardTypes());
export const resolveEconomyConfig = (): EconomyConfig => getEconomyConfig() ?? defaultEconomyConfig;

/** Rarity sort-order lookup built from the effective rarity list. */
export function rarityOrderMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of resolveRarities()) map[r.id] = r.sortOrder;
  return map;
}

export function rarityColorMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of resolveRarities()) map[r.id] = r.color;
  return map;
}
