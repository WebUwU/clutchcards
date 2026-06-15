import { requireUser, ok, fail, cooldownRemaining, rateLimit } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { fetchRecentMatches, extractPlayerMatch } from "@/lib/server/henrik";
import { recomputeQuests } from "@/lib/server/quests.server";
import { logAudit } from "@/lib/server/economy.server";

const SYNC_COOLDOWN_MS = 60_000; // don't hammer the API

export async function POST() {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const rl = rateLimit(`${u.userId}:match-sync`, 5, 60_000);
  if (!rl.ok) return fail(`Too many syncs. Try again in ${rl.retryAfter}s`, 429);

  const account = await prisma.valorantAccount.findUnique({ where: { userId: u.userId } });
  if (!account) return fail("Link your Riot account first.", 400);

  const remaining = cooldownRemaining(account.lastSync, SYNC_COOLDOWN_MS);
  if (remaining > 0) return fail(`On cooldown. Try again in ${remaining}s`, 429);

  if (!process.env.HENRIK_API_KEY) {
    await prisma.valorantAccount.update({ where: { userId: u.userId }, data: { lastSync: new Date() } });
    return fail("Match sync isn't available yet — the server needs a Valorant API key.", 503);
  }

  // Backfill the PUUID if the account was linked before a key was configured.
  let puuid = account.puuid;
  if (!puuid) {
    try {
      const { fetchAccount } = await import("@/lib/server/henrik");
      const acc = await fetchAccount(account.riotName, account.riotTag, u.userId);
      puuid = acc.puuid;
      await prisma.valorantAccount.update({ where: { userId: u.userId }, data: { puuid, verified: true } });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Could not verify your Riot account. Check the name, tag and region.", 502);
    }
  }

  try {
    const matches = await fetchRecentMatches(account.region, account.riotName, account.riotTag, u.userId);
    let added = 0;
    for (const m of matches) {
      const row = extractPlayerMatch(m, puuid);
      if (!row) continue;
      // De-dupe via unique (userId, matchId).
      const exists = await prisma.syncedMatch.findUnique({ where: { userId_matchId: { userId: u.userId, matchId: row.matchId } } });
      if (exists) continue;
      await prisma.syncedMatch.create({
        data: { userId: u.userId, ...row, raw: JSON.stringify({ map: row.map, agent: row.agent }) },
      });
      added += 1;
    }
    await prisma.valorantAccount.update({ where: { userId: u.userId }, data: { lastSync: new Date() } });
    await recomputeQuests(u.userId);
    await logAudit(u.userId, "riot.sync", account.id, { added });
    return ok({ added, total: matches.length });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Sync failed");
  }
}
