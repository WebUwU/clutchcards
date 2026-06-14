import { requireUser, ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { recomputeQuests } from "@/lib/server/quests.server";

export async function GET() {
  const u = await requireUser();
  if ("error" in u) return u.error;
  await recomputeQuests(u.userId); // derive fresh progress from matches
  const quests = await prisma.quest.findMany({ where: { isActive: true } });
  const progress = await prisma.questProgress.findMany({ where: { userId: u.userId } });
  const byId = Object.fromEntries(progress.map((p) => [p.questId, p]));
  return ok(quests.map((q) => ({
    ...q,
    progress: byId[q.id]?.progress ?? 0,
    status: byId[q.id]?.status ?? "active",
  })));
}
