import type { User, BattlepassReward, UserSettings } from "@/types";

export const currentUser: User = {
  id: "u-001",
  username: "Yuki",
  displayName: "Yuki",
  avatar: "/images/avatars/avatar-001.png",
  bio: "Tactical collector. Chasing the full Genesis set.",
  level: 18,
  xp: 1240,
  freeCoins: 6840,
  premiumCoins: 1520,
  dailyStreak: 7,
  rank: "Ascendant Collector",
  frame: "neon-pulse",
  badges: ["Early Access", "Fusion Adept", "7-Day Streak", "Market Trader"],
  titles: ["Ascendant Collector", "Founder"],
  favoriteCardIds: ["card-017", "card-001", "card-020"],
  showcaseCardIds: ["card-017", "card-001", "card-005"],
  region: "Europe",
  language: "English",
  timezone: "Europe/Vienna",
  favoriteRole: "duelist",
  favoriteCategory: "Agent",
};

export const defaultUserSettings: UserSettings = {
  privacy: {
    profilePublic: true,
    collectionPublic: true,
    showMarketStats: true,
    showOnlineStatus: true,
  },
  notifications: {
    questReminder: true,
    marketSale: true,
    packReward: true,
    weeklySummary: false,
    emailNotifications: false,
  },
  appearance: {
    theme: "dark-red",
    reduceMotion: false,
    compactCards: false,
    showRarityGlow: true,
    gridDensity: "comfortable",
  },
  safety: {
    spendingLimit: 0,
    purchaseCooldownMinutes: 0,
  },
};

export const battlepass: BattlepassReward[] = [
  { tier: 1, track: "free", label: "200 Free Coins", kind: "free_coins", unlocked: true, claimed: true },
  { tier: 1, track: "premium", label: "Basic Card Pack", kind: "card", unlocked: true, claimed: true },
  { tier: 2, track: "free", label: "Rare Card", kind: "card", unlocked: true, claimed: true },
  { tier: 2, track: "premium", label: "XP Booster 24h", kind: "booster", unlocked: true, claimed: false },
  { tier: 3, track: "free", label: "300 Free Coins", kind: "free_coins", unlocked: true, claimed: false },
  { tier: 3, track: "premium", label: "Animated Frame", kind: "frame", unlocked: true, claimed: false },
  { tier: 4, track: "free", label: "Epic Card", kind: "card", unlocked: false, claimed: false },
  { tier: 4, track: "premium", label: "Premium Card Pack", kind: "card", unlocked: false, claimed: false },
  { tier: 5, track: "free", label: "Profile Cosmetic", kind: "cosmetic", unlocked: false, claimed: false },
  { tier: 5, track: "premium", label: "Legendary Card", kind: "card", unlocked: false, claimed: false },
];
