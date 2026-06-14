import { requireUser, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { adjustBalance, grantCards, marketFee, sellerNet, logAudit, ECONOMY } from "@/lib/server/economy.server";
import { z } from "zod";

const schema = z.object({ listingId: z.string() });

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request");

  try {
    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.marketListing.findUnique({ where: { id: parsed.data.listingId } });
      if (!listing || listing.status !== "active") throw new Error("Listing no longer available.");
      // Anti self-trading.
      if (listing.sellerId === u.userId) throw new Error("You cannot buy your own listing.");

      const fee = marketFee(listing.price);
      const net = sellerNet(listing.price);
      // Buyer pays premium coins; seller receives net premium coins. Closed loop.
      await adjustBalance(tx, u.userId, 0, -listing.price);
      await adjustBalance(tx, listing.sellerId, 0, net);
      await grantCards(tx, u.userId, [listing.cardId]);
      await tx.marketListing.update({ where: { id: listing.id }, data: { status: "sold" } });
      await tx.transaction.create({
        data: { listingId: listing.id, cardId: listing.cardId, buyerId: u.userId, sellerId: listing.sellerId, price: listing.price, fee, sellerNet: net, type: "market" },
      });
      return { cardId: listing.cardId, price: listing.price, fee };
    });
    await logAudit(u.userId, "market.buy", parsed.data.listingId, result);
    return ok(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Purchase failed");
  }
}
