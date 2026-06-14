import { requireUser, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { consumeCard, logAudit } from "@/lib/server/economy.server";
import { z } from "zod";

const schema = z.object({ cardId: z.string(), price: z.number().int().positive().max(1_000_000) });

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request");
  const { cardId, price } = parsed.data;

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card) return fail("Card not found", 404);
  if (!card.tradable) return fail("This card is not tradable.");

  try {
    const listing = await prisma.$transaction(async (tx) => {
      await consumeCard(tx, u.userId, cardId); // escrow: remove from inventory while listed
      return tx.marketListing.create({ data: { cardId, sellerId: u.userId, price } });
    });
    await logAudit(u.userId, "market.list", listing.id, { cardId, price });
    return ok({ listingId: listing.id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to list");
  }
}
