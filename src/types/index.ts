// ─── Core domain types ──────────────────────────────────────────────
// NOTE: rarity / card type are now string IDs that reference admin-managed
// RarityConfig / CardTypeConfig records. The legacy string unions are kept
// as defaults so existing mock data and seeds remain valid.

export type Rarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export type CardType = "agent" | "weapon" | "ability" | "map" | "event";

export type CardRole =
  | "duelist"
  | "controller"
  | "sentinel"
  | "initiator"
  | "neutral";

export type AdminEntityStatus = "active" | "disabled";

// ─── Card sets / rarities / types (admin-managed) ───────────────────

export interface CardSet {
  id: string;
  name: string;
  slug: string;
  description: string;
  season: string;
  releaseDate: string; // ISO
  coverImage: string;
  isActive: boolean;
  totalCards: number;
  accentColor: string;
  backgroundStyle: string;
}

export interface RarityConfig {
  id: string; // e.g. "rare"
  name: string;
  sortOrder: number;
  color: string; // hex
  glowClass: string; // tailwind/utility class hint
  dropWeight: number; // relative weight in pack roll
  minFusionRequired: number; // duplicates needed to fuse up into this
  borderStyle: string;
}

export interface CardTypeConfig {
  id: string; // e.g. "agent"
  name: string;
  description: string;
  icon: string; // lucide icon name hint
  color: string; // hex
}

// ─── Cards ──────────────────────────────────────────────────────────
// `rarity` and `type` are kept (string) for backward-compat with existing
// components; the richer model adds rarityId / typeId / setId.

export interface Card {
  id: string;
  setId: string;
  name: string;
  slug: string;
  rarity: string; // rarityId
  rarityId: string; // explicit alias
  type: string; // typeId
  typeId: string; // explicit alias
  role: CardRole;
  description: string;
  image: string;
  ownedAmount: number; // 0 = locked / not owned
  tradable: boolean;
  fusionValue: number;
  isLimited: boolean;
  isAnimated: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string; // ISO
  isActive: boolean;
}

// ─── Quests ─────────────────────────────────────────────────────────

export type QuestPeriod = "daily" | "weekly" | "seasonal";
export type QuestDifficulty = "easy" | "medium" | "hard";
export type QuestStatus = "not_started" | "active" | "completed" | "claimed";

export interface QuestReward {
  xp: number;
  freeCoins: number;
  pack?: "basic" | "premium";
  packId?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  period: QuestPeriod; // legacy alias of `type`
  type: QuestPeriod;
  difficulty: QuestDifficulty;
  progress: number;
  goal: number; // legacy alias of progressRequired
  progressRequired: number;
  status: QuestStatus;
  reward: QuestReward;
  rewardXp: number;
  rewardFreeCoins: number;
  rewardPackId?: string;
  isActive: boolean;
}

// ─── Market ─────────────────────────────────────────────────────────

export interface MarketListing {
  id: string;
  card: Card;
  price: number; // premium coins
  sellerName: string;
  listedAt: string; // ISO
  ownListing?: boolean;
}

// ─── Shop ───────────────────────────────────────────────────────────

export type ShopCategory =
  | "premium_bundle"
  | "cosmetic"
  | "frame"
  | "showcase"
  | "booster"
  | "season_pass"
  | "exchange"
  | "pack";

export interface ShopItemEffect {
  kind: "xp_boost" | "showcase_slot" | "frame" | "cosmetic" | "pack" | "none";
  magnitude?: number; // e.g. 1.5 = +50%
  durationHours?: number;
  packId?: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  priceReal?: number; // EUR (premium bundles / season pass only)
  pricePremium?: number; // premium coins
  priceFreeCoins?: number; // free coins
  grantsPremium?: number;
  grantsFree?: number;
  image: string;
  badge?: string;
  isActive: boolean;
  effects?: ShopItemEffect[];
}

// ─── User / profile / settings ──────────────────────────────────────

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  freeCoins: number;
  premiumCoins: number;
  dailyStreak: number;
  rank: string;
  frame: string;
  badges: string[];
  titles: string[];
  favoriteCardIds: string[];
  showcaseCardIds: string[];
  region: string;
  language: string;
  timezone: string;
  favoriteRole: CardRole;
  favoriteCategory: string;
}

export interface PrivacySettings {
  profilePublic: boolean;
  collectionPublic: boolean;
  showMarketStats: boolean;
  showOnlineStatus: boolean;
}

export interface NotificationSettings {
  questReminder: boolean;
  marketSale: boolean;
  packReward: boolean;
  weeklySummary: boolean;
  emailNotifications: boolean;
}

export type ThemeName = "dark" | "dark-red" | "neon" | "minimal";
export type GridDensity = "comfortable" | "compact" | "large";

export interface AppearanceSettings {
  theme: ThemeName;
  reduceMotion: boolean;
  compactCards: boolean;
  showRarityGlow: boolean;
  gridDensity: GridDensity;
}

export interface SafetySettings {
  spendingLimit: number; // mock, premium coins per session
  purchaseCooldownMinutes: number; // mock
}

export interface UserSettings {
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  safety: SafetySettings;
}

// ─── Packs ──────────────────────────────────────────────────────────

export interface PackDropTableEntry {
  rarityId: string;
  weight: number; // relative chance
}

export type PackDropTable = PackDropTableEntry[];

export interface Pack {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  priceFreeCoins: number;
  pricePremiumCoins: number;
  allowedSetIds: string[];
  dropTable: PackDropTable;
  guaranteedRarity?: string; // rarityId
  cardCount: number;
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PackOpeningResult {
  packId: string;
  cards: Card[];
  highestRarityId: string;
  openedAt: string; // ISO
}

export interface PackOpeningHistoryEntry {
  id: string;
  packId: string;
  packName: string;
  cardIds: string[];
  highestRarityId: string;
  openedAt: string;
}

// ─── Battlepass ─────────────────────────────────────────────────────

export interface BattlepassReward {
  tier: number;
  track: "free" | "premium";
  label: string;
  kind: "card" | "cosmetic" | "booster" | "frame" | "free_coins";
  unlocked: boolean;
  claimed: boolean;
}

// ─── Economy / admin config ─────────────────────────────────────────

export interface EconomyConfig {
  marketFeeRate: number; // 0..1
  listingFeeFlat: number; // premium coins flat fee to list
  premiumToFreeRate: number; // 1 premium → N free
  fusionBaseCost: number; // free coins
  fusionPerExtraCard: number; // free coins
  allowFreeToPremium: false; // hard-locked false, kept for clarity
  allowCashout: false; // hard-locked false
}

export interface AdminConfig {
  economy: EconomyConfig;
  updatedAt: string;
}

export interface AdminSession {
  loggedIn: boolean;
  username: string;
  since: string; // ISO
}

// ─── Active boosters ────────────────────────────────────────────────

export interface ActiveBooster {
  id: string;
  shopItemId: string;
  kind: ShopItemEffect["kind"];
  magnitude: number;
  expiresAt: string; // ISO
}

// ─── Filters ────────────────────────────────────────────────────────

export type CardSortKey = "rarity" | "name" | "owned" | "newest" | "set";
export type CardViewMode = "grid" | "compact" | "detail";

export interface CardFilterState {
  query: string;
  setId: string | "all";
  rarityId: string | "all";
  typeId: string | "all";
  tradableOnly: boolean;
  ownedFilter: "all" | "owned" | "missing";
  duplicatesOnly: boolean;
  limitedOnly: boolean;
  animatedOnly: boolean;
  sort: CardSortKey;
  view: CardViewMode;
}

export type MarketSortKey = "cheapest" | "newest" | "rarity";

export interface MarketFilterState {
  query: string;
  setId: string | "all";
  rarityId: string | "all";
  tradableOnly: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  sort: MarketSortKey;
}

// ─── Shop purchases ─────────────────────────────────────────────────

export interface ShopPurchase {
  id: string;
  shopItemId: string;
  name: string;
  paidWith: "real" | "premium" | "free";
  amount: number;
  purchasedAt: string;
}

export interface ExchangeRecord {
  id: string;
  premiumSpent: number;
  freeReceived: number;
  at: string;
}

// ─── Local DB schema + storage export ───────────────────────────────

export interface CollectionState {
  // cardId -> owned amount
  owned: Record<string, number>;
  favoriteCardIds: string[];
  showcaseCardIds: string[];
}

export interface QuestProgressState {
  // questId -> { progress, status }
  [questId: string]: { progress: number; status: QuestStatus };
}

export interface LocalDbSchema {
  version: number;
  user: User | null;
  settings: UserSettings | null;
  collection: CollectionState | null;
  questProgress: QuestProgressState | null;
  packHistory: PackOpeningHistoryEntry[];
  marketListings: MarketListing[];
  shopPurchases: ShopPurchase[];
  exchanges: ExchangeRecord[];
  activeBoosters: ActiveBooster[];
  adminCards: Card[] | null;
  adminCardSets: CardSet[] | null;
  adminPacks: Pack[] | null;
  adminQuests: Quest[] | null;
  adminShopItems: ShopItem[] | null;
  adminRarities: RarityConfig[] | null;
  adminCardTypes: CardTypeConfig[] | null;
  economyConfig: EconomyConfig | null;
}

export interface StorageExport {
  app: "ascendant-cards";
  exportedAt: string;
  version: number;
  data: LocalDbSchema;
}
