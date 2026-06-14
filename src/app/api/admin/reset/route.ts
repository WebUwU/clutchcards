import { requireAdmin, ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { logAudit } from "@/lib/server/economy.server";

export async function POST() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  // Clears gameplay state but preserves catalog + users.
  await prisma.$transaction([
    prisma.packOpening.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.marketListing.deleteMany(),
    prisma.exchange.deleteMany(),
    prisma.questProgress.deleteMany(),
    prisma.questRewardClaim.deleteMany(),
    prisma.inventoryItem.deleteMany(),
    prisma.syncedMatch.deleteMany(),
  ]);
  await logAudit(a.userId, "admin.reset", "gameplay-state");
  return ok({ reset: true });
}
