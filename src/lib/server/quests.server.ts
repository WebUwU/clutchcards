// ─── Server quest engine ────────────────────────────────────────────
// Progress is derived ONLY from synced match data in the DB. The client
// cannot push progress. Rewards are granted once (idempotent via the
// QuestRewardClaim unique constraint).

import { prisma } from "./prisma";
import { adjustBalance, grantCards, logAudit } from "./economy.server";

// Compute a metric value for a user from their synced matches.
async function metricValue(userId: string, quest: { metric: string; metricAgent: string | null; metricMap: string | null }): Promise<number> {
  const matches = await prisma.syncedMatch.findMany({ where: { userId, countsForQuests: true } });
  switch (quest.metric) {
    case "matches_played": return matches.length;
    case "matches_won": return matches.filter((m) => m.won).length;
    case "kills": return matches.reduce((s, m) => s + m.kills, 0);
    case "headshots": return matches.reduce((s, m) => s + m.headshots, 0);
    case "play_agent": return matches.filter((m) => quest.metricAgent && m.agent.toLowerCase() === quest.metricAgent.toLowerCase()).length;
    case "play_map": return matches.filter((m) => quest.metricMap && m.map.toLowerCase() === quest.metricMap.toLowerCase()).length;
    case "daily_login": {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      return profile?.lastLogin ? 1 : 0;
    }
    default: return 0;
  }
}

/** Recompute progress for all active quests for a user. */
export async function recomputeQuests(userId: string) {
  const quests = await prisma.quest.findMany({ where: { isActive: true } });
  for (const q of quests) {
    const value = await metricValue(userId, q);
    const progress = Math.min(value, q.goal);
    const status = progress >= q.goal ? "completed" : "active";
    const existing = await prisma.questProgress.findUnique({ where: { userId_questId: { userId, questId: q.id } } });
    // Don't downgrade a claimed quest.
    if (existing?.status === "claimed") continue;
    await prisma.questProgress.upsert({
      where: { userId_questId: { userId, questId: q.id } },
      update: { progress, status },
      create: { userId, questId: q.id, progress, status },
    });
  }
}

/** Claim a completed quest's reward exactly once. */
export async function claimQuest(userId: string, questId: string) {
  return prisma.$transaction(async (tx) => {
    const quest = await tx.quest.findUnique({ where: { id: questId } });
    if (!quest) throw new Error("Quest not found.");
    const progress = await tx.questProgress.findUnique({ where: { userId_questId: { userId, questId } } });
    if (!progress || progress.status === "active") throw new Error("Quest not completed yet.");
    if (progress.status === "claimed") throw new Error("Reward already claimed.");

    // Idempotency guard: unique claim row.
    await tx.questRewardClaim.create({ data: { userId, questId } });

    if (quest.rewardFreeCoins > 0) await adjustBalance(tx, userId, quest.rewardFreeCoins, 0);
    if (quest.rewardXp > 0) await tx.profile.update({ where: { userId }, data: { xp: { increment: quest.rewardXp } } });
    if (quest.rewardCardId) await grantCards(tx, userId, [quest.rewardCardId]);
    // Note: rewardPackId would trigger a server pack-open; left as a follow-up.

    await tx.questProgress.update({ where: { userId_questId: { userId, questId } }, data: { status: "claimed" } });
    return { rewardXp: quest.rewardXp, rewardFreeCoins: quest.rewardFreeCoins, rewardCardId: quest.rewardCardId };
  });
}
