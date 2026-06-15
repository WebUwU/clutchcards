import { requireAdmin, ok } from "@/lib/server/api";
import { ECONOMY } from "@/lib/server/economy.server";

// Returns the live, code-enforced economy values (read-only).
export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  return ok({
    marketFeeRate: ECONOMY.marketFeeRate,
    listingFeeFlat: ECONOMY.listingFeeFlat,
    premiumToFreeRate: ECONOMY.premiumToFreeRate,
    allowFreeToPremium: ECONOMY.allowFreeToPremium,
    allowCashout: ECONOMY.allowCashout,
  });
}
