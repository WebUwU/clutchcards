// ─── Local persistence layer ────────────────────────────────────────
// SSR-safe wrapper over localStorage. Every accessor guards on
// `typeof window` so it can be imported anywhere without breaking SSR or
// causing hydration errors. Consumers should read inside effects/handlers.

import type {
  User, UserSettings, CollectionState, QuestProgressState,
  PackOpeningHistoryEntry, MarketListing, ShopPurchase, ExchangeRecord,
  ActiveBooster, Card, CardSet, Pack, Quest, ShopItem, RarityConfig,
  CardTypeConfig, EconomyConfig, LocalDbSchema, StorageExport, QuestStatus,
} from "@/types";

export const DB_VERSION = 1;
const PREFIX = "ascendant:";

const KEYS = {
  user: PREFIX + "user",
  settings: PREFIX + "settings",
  collection: PREFIX + "collection",
  questProgress: PREFIX + "questProgress",
  packHistory: PREFIX + "packHistory",
  marketListings: PREFIX + "marketListings",
  shopPurchases: PREFIX + "shopPurchases",
  exchanges: PREFIX + "exchanges",
  activeBoosters: PREFIX + "activeBoosters",
  adminCards: PREFIX + "adminCards",
  adminCardSets: PREFIX + "adminCardSets",
  adminPacks: PREFIX + "adminPacks",
  adminQuests: PREFIX + "adminQuests",
  adminShopItems: PREFIX + "adminShopItems",
  adminRarities: PREFIX + "adminRarities",
  adminCardTypes: PREFIX + "adminCardTypes",
  economyConfig: PREFIX + "economyConfig",
} as const;

const hasWindow = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!hasWindow()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or serialization error — ignore in local demo */
  }
}

function remove(key: string): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// ─── User ───────────────────────────────────────────────────────────
export const getLocalUser = () => read<User | null>(KEYS.user, null);
export const saveLocalUser = (user: User) => write(KEYS.user, user);

// ─── Settings ───────────────────────────────────────────────────────
export const getLocalSettings = () => read<UserSettings | null>(KEYS.settings, null);
export const saveLocalSettings = (settings: UserSettings) => write(KEYS.settings, settings);

// ─── Collection ─────────────────────────────────────────────────────
export const getLocalCollection = () =>
  read<CollectionState | null>(KEYS.collection, null);
export const saveLocalCollection = (collection: CollectionState) =>
  write(KEYS.collection, collection);

function ensureCollection(): CollectionState {
  return (
    getLocalCollection() ?? { owned: {}, favoriteCardIds: [], showcaseCardIds: [] }
  );
}

export function addCardsToCollection(cards: { id: string }[]): CollectionState {
  const col = ensureCollection();
  for (const c of cards) col.owned[c.id] = (col.owned[c.id] ?? 0) + 1;
  saveLocalCollection(col);
  return col;
}

export function incrementCardAmount(cardId: string, amount: number): CollectionState {
  const col = ensureCollection();
  col.owned[cardId] = Math.max(0, (col.owned[cardId] ?? 0) + amount);
  saveLocalCollection(col);
  return col;
}

// ─── Quest progress ─────────────────────────────────────────────────
export const getQuestProgress = () =>
  read<QuestProgressState>(KEYS.questProgress, {});
export const saveQuestProgress = (progress: QuestProgressState) =>
  write(KEYS.questProgress, progress);

function setQuestStatus(questId: string, status: QuestStatus, progress?: number) {
  const all = getQuestProgress();
  const existing = all[questId] ?? { progress: 0, status: "not_started" as QuestStatus };
  all[questId] = { progress: progress ?? existing.progress, status };
  saveQuestProgress(all);
}
export const markQuestCompleted = (questId: string) => setQuestStatus(questId, "completed");
export const markQuestClaimed = (questId: string) => setQuestStatus(questId, "claimed");

// ─── Pack history ───────────────────────────────────────────────────
export const getPackOpeningHistory = () =>
  read<PackOpeningHistoryEntry[]>(KEYS.packHistory, []);
export function savePackOpeningResult(entry: PackOpeningHistoryEntry): PackOpeningHistoryEntry[] {
  const list = getPackOpeningHistory();
  list.unshift(entry);
  const trimmed = list.slice(0, 50);
  write(KEYS.packHistory, trimmed);
  return trimmed;
}

// ─── Market ─────────────────────────────────────────────────────────
export const getMarketListings = () => read<MarketListing[] | null>(KEYS.marketListings, null);
export const saveMarketListings = (listings: MarketListing[]) => write(KEYS.marketListings, listings);

// ─── Shop purchases / exchanges ─────────────────────────────────────
export const getShopPurchases = () => read<ShopPurchase[]>(KEYS.shopPurchases, []);
export function saveShopPurchase(purchase: ShopPurchase): ShopPurchase[] {
  const list = getShopPurchases();
  list.unshift(purchase);
  write(KEYS.shopPurchases, list);
  return list;
}
export const getExchanges = () => read<ExchangeRecord[]>(KEYS.exchanges, []);
export function saveExchange(record: ExchangeRecord): ExchangeRecord[] {
  const list = getExchanges();
  list.unshift(record);
  write(KEYS.exchanges, list);
  return list;
}

// ─── Active boosters ────────────────────────────────────────────────
export const getActiveBoosters = () => read<ActiveBooster[]>(KEYS.activeBoosters, []);
export const saveActiveBoosters = (boosters: ActiveBooster[]) => write(KEYS.activeBoosters, boosters);

// ─── Admin-created entities ─────────────────────────────────────────
export const getAdminCards = () => read<Card[] | null>(KEYS.adminCards, null);
export const saveAdminCards = (cards: Card[]) => write(KEYS.adminCards, cards);

export const getAdminCardSets = () => read<CardSet[] | null>(KEYS.adminCardSets, null);
export const saveAdminCardSets = (sets: CardSet[]) => write(KEYS.adminCardSets, sets);

export const getAdminPacks = () => read<Pack[] | null>(KEYS.adminPacks, null);
export const saveAdminPacks = (packs: Pack[]) => write(KEYS.adminPacks, packs);

export const getAdminQuests = () => read<Quest[] | null>(KEYS.adminQuests, null);
export const saveAdminQuests = (quests: Quest[]) => write(KEYS.adminQuests, quests);

export const getAdminShopItems = () => read<ShopItem[] | null>(KEYS.adminShopItems, null);
export const saveAdminShopItems = (items: ShopItem[]) => write(KEYS.adminShopItems, items);

export const getAdminRarities = () => read<RarityConfig[] | null>(KEYS.adminRarities, null);
export const saveAdminRarities = (rarities: RarityConfig[]) => write(KEYS.adminRarities, rarities);

export const getAdminCardTypes = () => read<CardTypeConfig[] | null>(KEYS.adminCardTypes, null);
export const saveAdminCardTypes = (types: CardTypeConfig[]) => write(KEYS.adminCardTypes, types);

// ─── Economy config ─────────────────────────────────────────────────
export const getEconomyConfig = () => read<EconomyConfig | null>(KEYS.economyConfig, null);
export const saveEconomyConfig = (config: EconomyConfig) => write(KEYS.economyConfig, config);

// ─── Whole-DB operations ────────────────────────────────────────────
export function resetLocalDb(): void {
  if (!hasWindow()) return;
  for (const key of Object.values(KEYS)) remove(key);
}

export function snapshotLocalDb(): LocalDbSchema {
  return {
    version: DB_VERSION,
    user: getLocalUser(),
    settings: getLocalSettings(),
    collection: getLocalCollection(),
    questProgress: getQuestProgress(),
    packHistory: getPackOpeningHistory(),
    marketListings: getMarketListings() ?? [],
    shopPurchases: getShopPurchases(),
    exchanges: getExchanges(),
    activeBoosters: getActiveBoosters(),
    adminCards: getAdminCards(),
    adminCardSets: getAdminCardSets(),
    adminPacks: getAdminPacks(),
    adminQuests: getAdminQuests(),
    adminShopItems: getAdminShopItems(),
    adminRarities: getAdminRarities(),
    adminCardTypes: getAdminCardTypes(),
    economyConfig: getEconomyConfig(),
  };
}

export function exportLocalDbAsJson(): string {
  const payload: StorageExport = {
    app: "ascendant-cards",
    exportedAt: new Date().toISOString(),
    version: DB_VERSION,
    data: snapshotLocalDb(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importLocalDbFromJson(json: string): { ok: boolean; error?: string } {
  if (!hasWindow()) return { ok: false, error: "No browser storage available." };
  let parsed: StorageExport;
  try {
    parsed = JSON.parse(json) as StorageExport;
  } catch {
    return { ok: false, error: "Invalid JSON." };
  }
  if (parsed.app !== "ascendant-cards" || !parsed.data) {
    return { ok: false, error: "This file is not an Ascendant Cards export." };
  }
  const d = parsed.data;
  if (d.user) saveLocalUser(d.user);
  if (d.settings) saveLocalSettings(d.settings);
  if (d.collection) saveLocalCollection(d.collection);
  if (d.questProgress) saveQuestProgress(d.questProgress);
  if (d.packHistory) write(KEYS.packHistory, d.packHistory);
  if (d.marketListings) saveMarketListings(d.marketListings);
  if (d.shopPurchases) write(KEYS.shopPurchases, d.shopPurchases);
  if (d.exchanges) write(KEYS.exchanges, d.exchanges);
  if (d.activeBoosters) saveActiveBoosters(d.activeBoosters);
  if (d.adminCards) saveAdminCards(d.adminCards);
  if (d.adminCardSets) saveAdminCardSets(d.adminCardSets);
  if (d.adminPacks) saveAdminPacks(d.adminPacks);
  if (d.adminQuests) saveAdminQuests(d.adminQuests);
  if (d.adminShopItems) saveAdminShopItems(d.adminShopItems);
  if (d.adminRarities) saveAdminRarities(d.adminRarities);
  if (d.adminCardTypes) saveAdminCardTypes(d.adminCardTypes);
  if (d.economyConfig) saveEconomyConfig(d.economyConfig);
  return { ok: true };
}

export function getStorageStatus(): { available: boolean; keys: number; bytes: number } {
  if (!hasWindow()) return { available: false, keys: 0, bytes: 0 };
  let keys = 0;
  let bytes = 0;
  for (const key of Object.values(KEYS)) {
    const raw = window.localStorage.getItem(key);
    if (raw != null) {
      keys += 1;
      bytes += raw.length;
    }
  }
  return { available: true, keys, bytes };
}
