export const dynamic = "force-dynamic";
import { ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const packs = await prisma.pack.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  return ok(packs.map((p) => ({
    ...p,
    allowedSetIds: JSON.parse(p.allowedSetIds),
    dropTable: JSON.parse(p.dropTable),
  })));
}
