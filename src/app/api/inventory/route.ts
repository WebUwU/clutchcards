import { requireUser, ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const items = await prisma.inventoryItem.findMany({
    where: { userId: u.userId }, include: { card: true }, orderBy: { acquiredAt: "desc" },
  });
  return ok(items.map((i) => ({
    id: i.id, amount: i.amount, favorite: i.favorite,
    card: { ...i.card, tags: JSON.parse(i.card.tags) },
  })));
}
