export const dynamic = "force-dynamic";
import { ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const [cards, sets, rarities, types] = await Promise.all([
    prisma.card.findMany({ where: { isActive: true } }),
    prisma.cardSet.findMany({ where: { isActive: true } }),
    prisma.rarity.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.cardType.findMany(),
  ]);
  return ok({
    cards: cards.map((c) => ({ ...c, tags: JSON.parse(c.tags) })),
    sets, rarities, types,
  });
}
