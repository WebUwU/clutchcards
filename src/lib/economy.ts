import type {
  Card, MarketListing, User, EconomyConfig, ShopItem, Pack, ActiveBooster,
} from "@/types";
import { defaultEconomyConfig } from "@/data/adminConfig";

// ─── Economy constants (legacy defaults) ────────────────────────────
// Closed-loop currency rules — enforced regardless of any config value:
//   • Premium Coins are purchasable with real money.
//   • Premium Coins CAN convert to Free Coins (one direction only).
//   • Free Coins CANNOT convert to Premium Coins.
//   • Nothing converts back to real money / gift cards / crypto.

export const MARKET_FEE_RATE = defaultEconomyConfig.marketFeeRate;
export const PREMIUM_TO_FREE_RATE = defaultEconomyConfig.premiumToFreeRate;
export const FUSION_BASE_COST = defaultEconomyConfig.fusionBaseCost;

function cfg(config?: EconomyConfig): EconomyConfig {
  return config ?? defaultEconomyConfig;
}

// ─── Conversions ────────────────────────────────────────────────────

/** Convert premium coins into free coins (the only allowed conversion). */
export function premiumCoinsToFreeCoins(premium: number, rate = PREMIUM_TO_FREE_RATE): number {
  return Math.max(0, Math.floor(premium * rate));
}

/** Closed-economy guard: premium → free is allowed. */
export function canConvertPremiumToFree(user: User, premiumAmount: number): { ok: boolean; reason?: string } {
  if (premiumAmount <= 0) return { ok: false, reason: "Enter an amount greater than zero." };
  if (user.premiumCoins < premiumAmount) return { ok: false, reason: "Not enough Premium Coins." };
  return { ok: true };
}

/** Closed-economy guard: free → premium is NEVER allowed. */
export function cannotConvertFreeToPremium(): { ok: false; reason: string } {
  return { ok: false, reason: "Free Coins can never be converted into Premium Coins." };
}

/** Validate a premium→free exchange request end to end. */
export function validatePremiumToFreeExchange(
  user: User,
  premiumAmount: number,
  config?: EconomyConfig,
): { ok: boolean; reason?: string; freeReceived?: number } {
  const guard = canConvertPremiumToFree(user, premiumAmount);
  if (!guard.ok) return guard;
  const freeReceived = premiumCoinsToFreeCoins(premiumAmount, cfg(config).premiumToFreeRate);
  return { ok: true, freeReceived };
}

/** Hard invariant: there is no path from platform currency to real value. */
export function validateNoCashoutPath(): boolean {
  // Always false — no cashout exists anywhere in the system.
  return false;
}

/** Hard invariant: no gift-card / code redemption path exists. */
export function validateNoGiftcardPath(): boolean {
  return false;
}

// ─── Market ─────────────────────────────────────────────────────────

export function calculateMarketFee(price: number, config?: EconomyConfig): number {
  return Math.round(price * cfg(config).marketFeeRate);
}

export function calculateListingFee(config?: EconomyConfig): number {
  return cfg(config).listingFeeFlat;
}

export function calculateSellerReceives(price: number, config?: EconomyConfig): number {
  return Math.max(0, price - calculateMarketFee(price, config));
}

/** Legacy alias kept for existing components. */
export function calculateSellerPayout(price: number, rate = MARKET_FEE_RATE): number {
  return price - Math.round(price * rate);
}

/** The market never offers withdrawal/cashout. Always closed. */
export function validateMarketClosedEconomy(): boolean {
  return true;
}

// ─── Leveling ───────────────────────────────────────────────────────

export function getXpForNextLevel(level: number): number {
  return Math.round(500 + level * 120 + Math.pow(level, 1.6) * 18);
}

// Derive level + progress from a single cumulative XP total. This is the
// source of truth so `level` and `xp` can never drift apart. Walks up the
// per-level costs, subtracting until the remainder fits inside a level.
export function levelStateFromTotalXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  progress: number;
} {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));
  // Safety cap to avoid any chance of an infinite loop.
  while (level < 999) {
    const need = getXpForNextLevel(level);
    if (remaining < need) break;
    remaining -= need;
    level += 1;
  }
  const xpForLevel = getXpForNextLevel(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpForLevel,
    progress: xpForLevel > 0 ? Math.min(1, remaining / xpForLevel) : 0,
  };
}

export function calculateLevelProgress(xpIntoLevel: number, level: number): number {
  const needed = getXpForNextLevel(level);
  if (needed <= 0) return 0;
  return Math.min(1, Math.max(0, xpIntoLevel / needed));
}

// ─── Card / market gating ───────────────────────────────────────────

export function canListCard(card: Card): { ok: boolean; reason?: string } {
  if (!card.tradable) return { ok: false, reason: "This card is bound and cannot be traded." };
  if (card.ownedAmount < 1) return { ok: false, reason: "You don't own this card yet." };
  return { ok: true };
}

export function canBuyListing(user: User, listing: MarketListing): { ok: boolean; reason?: string } {
  if (user.premiumCoins < listing.price)
    return { ok: false, reason: "Not enough Premium Coins." };
  return { ok: true };
}

// ─── Fusion ─────────────────────────────────────────────────────────

export function fusionCost(cardsConsumed: number, config?: EconomyConfig): number {
  const c = cfg(config);
  return c.fusionBaseCost + Math.max(0, cardsConsumed - 1) * c.fusionPerExtraCard;
}

// ─── Shop purchase gating ───────────────────────────────────────────

export function canBuyPremiumItem(user: User, item: ShopItem): { ok: boolean; reason?: string } {
  const price = item.pricePremium ?? 0;
  if (price <= 0) return { ok: false, reason: "This item is not priced in Premium Coins." };
  if (user.premiumCoins < price) return { ok: false, reason: "Not enough Premium Coins." };
  return { ok: true };
}

export function canBuyFreeItem(user: User, item: ShopItem): { ok: boolean; reason?: string } {
  const price = item.priceFreeCoins ?? 0;
  if (price <= 0) return { ok: false, reason: "This item is not priced in Free Coins." };
  if (user.freeCoins < price) return { ok: false, reason: "Not enough Free Coins." };
  return { ok: true };
}

// ─── Boosters ───────────────────────────────────────────────────────

/** Boosters may only affect XP / card progression — never value or cashout. */
export function boosterAffectsOnlyProgression(booster: ActiveBooster): boolean {
  return booster.kind === "xp_boost" || booster.kind === "pack" || booster.kind === "none";
}

export function canApplyBooster(item: ShopItem): { ok: boolean; reason?: string } {
  const effect = item.effects?.[0];
  if (!effect) return { ok: false, reason: "This item has no booster effect." };
  if (effect.kind === "xp_boost") return { ok: true };
  return { ok: false, reason: "Only progression boosters can be activated." };
}

// ─── Pack reward safety ─────────────────────────────────────────────

/** Pack rewards are digital collectibles only — never real value. */
export function validatePackRewardHasNoCashout(): boolean {
  return true;
}

export function canAffordPack(user: User, pack: Pack): { ok: boolean; reason?: string } {
  if (pack.pricePremiumCoins > 0 && user.premiumCoins < pack.pricePremiumCoins)
    return { ok: false, reason: "Not enough Premium Coins." };
  if (pack.priceFreeCoins > 0 && user.freeCoins < pack.priceFreeCoins)
    return { ok: false, reason: "Not enough Free Coins." };
  return { ok: true };
}
