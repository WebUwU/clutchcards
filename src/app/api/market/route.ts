export const dynamic = "force-dynamic";
import { ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const listings = await prisma.marketListing.findMany({
    where: { status: "active" },
    include: { card: true, seller: { select: { profile: { select: { username: true } } } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return ok(listings.map((l) => ({
    id: l.id, price: l.price, createdAt: l.createdAt,
    sellerName: l.seller.profile?.username ?? "unknown",
    card: { ...l.card, tags: JSON.parse(l.card.tags) },
  })));
}
