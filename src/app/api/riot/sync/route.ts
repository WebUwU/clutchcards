import { requireUser, ok, fail, cooldownRemaining, rateLimit } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { syncMatchesForUser } from "@/lib/server/matchSync.server";
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

  try {
    // Manual sync pulls the latest 10 and DOES count toward quests.
    const { added, total } = await syncMatchesForUser(account, { size: 10, countsForQuests: true });
    await logAudit(u.userId, "riot.sync", account.id, { added });
    return ok({ added, total });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Sync failed");
  }
}
