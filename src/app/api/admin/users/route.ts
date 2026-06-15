// ─── Admin: list all users with their profiles ─────────────────────
import { requireAdmin, ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { profile: true, valorantAccount: true, _count: { select: { inventory: true } } },
  });
  return ok(users.map((u) => ({
    id: u.id, email: u.email, role: u.role, createdAt: u.createdAt,
    username: u.profile?.username ?? "—",
    level: u.profile?.level ?? 1,
    freeCoins: u.profile?.freeCoins ?? 0,
    premiumCoins: u.profile?.premiumCoins ?? 0,
    cardsOwned: u._count.inventory,
    riot: u.valorantAccount ? `${u.valorantAccount.riotName}#${u.valorantAccount.riotTag}` : null,
  })));
}
