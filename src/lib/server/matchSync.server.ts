import { prisma } from "@/lib/server/prisma";
import { fetchRecentMatches, extractPlayerMatch, fetchAccount } from "@/lib/server/henrik";
import { recomputeQuests } from "@/lib/server/quests.server";

type Account = { userId: string; riotName: string; riotTag: string; region: string; puuid: string | null };

/**
 * Pulls recent matches and stores new ones.
 * - `countsForQuests=false` is used for the baseline pull at link time, so
 *   matches played BEFORE signup never grant quest progress (anti-cheese).
 * - Returns how many new matches were added.
 */
export async function syncMatchesForUser(
  account: Account,
  opts: { size?: number; countsForQuests?: boolean } = {},
): Promise<{ added: number; total: number; puuid: string }> {
  const { size = 5, countsForQuests = true } = opts;

  // Backfill PUUID if missing (account linked before a key existed).
  let puuid = account.puuid;
  if (!puuid) {
    const acc = await fetchAccount(account.riotName, account.riotTag, account.userId);
    puuid = acc.puuid;
    await prisma.valorantAccount.update({ where: { userId: account.userId }, data: { puuid, verified: true } });
  }

  const matches = await fetchRecentMatches(account.region, account.riotName, account.riotTag, account.userId, size);
  let added = 0;
  for (const m of matches) {
    const row = extractPlayerMatch(m, puuid);
    if (!row) continue;
    const exists = await prisma.syncedMatch.findUnique({
      where: { userId_matchId: { userId: account.userId, matchId: row.matchId } },
    });
    if (exists) continue;
    await prisma.syncedMatch.create({
      data: { userId: account.userId, ...row, countsForQuests, raw: JSON.stringify({ map: row.map, agent: row.agent }) },
    });
    added += 1;
  }

  await prisma.valorantAccount.update({ where: { userId: account.userId }, data: { lastSync: new Date() } });
  // Only recompute quests when these matches should count.
  if (countsForQuests) await recomputeQuests(account.userId);
  return { added, total: matches.length, puuid };
}
