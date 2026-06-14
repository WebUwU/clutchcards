import type { ShopItem } from "@/types";

export const shopItems: ShopItem[] = [
  // Premium coin bundles (real money → premium coins)
  { id: "s-001", name: "Starter Cache", description: "A handful of Premium Coins to get you trading.", category: "premium_bundle", priceReal: 4.99, grantsPremium: 500, image: "/images/packs/basic-pack.png", badge: "Popular", isActive: true },
  { id: "s-002", name: "Operative Cache", description: "Best value for regular collectors.", category: "premium_bundle", priceReal: 9.99, grantsPremium: 1200, image: "/images/packs/premium-pack.png", badge: "+20% Bonus", isActive: true },
  { id: "s-003", name: "Ascendant Cache", description: "Stock up for the big-ticket market listings.", category: "premium_bundle", priceReal: 19.99, grantsPremium: 2500, image: "/images/packs/premium-pack.png", badge: "Best Value", isActive: true },

  // Spend premium coins
  { id: "s-004", name: "XP Booster — 24h", description: "Earn 50% more XP from quests for 24 hours.", category: "booster", pricePremium: 150, image: "/images/icons/premium-coin.png", isActive: true },
  { id: "s-005", name: "Animated Profile Frame", description: "A reactive neon frame that pulses on your profile.", category: "frame", pricePremium: 400, image: "/images/icons/premium-coin.png", badge: "Cosmetic", isActive: true },
  { id: "s-006", name: "Extra Showcase Slot", description: "Display one more favorite card on your profile.", category: "showcase", pricePremium: 250, image: "/images/icons/premium-coin.png", isActive: true },
  { id: "s-007", name: "Season Pass — Act IV", description: "Unlock the full premium battlepass track.", category: "season_pass", pricePremium: 1000, image: "/images/market/market-banner.png", badge: "Season", isActive: true },

  // The only conversion: premium → free
  { id: "s-008", name: "Premium → Free Exchange", description: "Convert 100 Premium Coins into 1,000 Free Coins. One-way only.", category: "exchange", pricePremium: 100, grantsFree: 1000, image: "/images/icons/free-coin.png", badge: "1 : 10", isActive: true },
];
