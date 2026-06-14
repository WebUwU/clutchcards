import { requireAdmin, ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return ok(logs.map((l) => ({ ...l, meta: JSON.parse(l.meta) })));
}
