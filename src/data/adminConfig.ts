import type { EconomyConfig } from "@/types";

// Default economy configuration. Editable in the admin panel; persisted to
// local DB. The closed-economy invariants (no free→premium, no cashout) are
// hard-locked to false here and enforced in src/lib/economy.ts regardless.
export const defaultEconomyConfig: EconomyConfig = {
  marketFeeRate: 0.1,
  listingFeeFlat: 5,
  premiumToFreeRate: 10,
  fusionBaseCost: 250,
  fusionPerExtraCard: 100,
  allowFreeToPremium: false,
  allowCashout: false,
};

export const ADMIN_USERNAME_FALLBACK = "Schinken";
