import { requireUser, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { grantCards, logAudit } from "@/lib/server/economy.server";
import { z } from "zod";

const schema = z.object({ listingId: z.string() });

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request");

  try {
    const cardId = await prisma.$transaction(async (tx) => {
      const listing = await tx.marketListing.findUnique({ where: { id: parsed.data.listingId } });
      if (!listing || listing.status !== "active") throw new Error("Listing not active.");
      if (listing.sellerId !== u.userId) throw new Error("Not your listing.");
      await tx.marketListing.update({ where: { id: listing.id }, data: { status: "cancelled" } });
      await grantCards(tx, u.userId, [listing.cardId]); // return escrowed card
      return listing.cardId;
    });
    await logAudit(u.userId, "market.cancel", parsed.data.listingId, { cardId });
    return ok({ cardId });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Cancel failed");
  }
}
