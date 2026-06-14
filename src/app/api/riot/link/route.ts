import { requireUser, ok, fail, rateLimit } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { fetchAccount } from "@/lib/server/henrik";
import { logAudit } from "@/lib/server/economy.server";
import { z } from "zod";

const schema = z.object({
  riotName: z.string().min(1).max(32),
  riotTag: z.string().min(1).max(8),
  region: z.enum(["eu", "na", "ap", "kr", "latam", "br"]),
});

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const rl = rateLimit(`${u.userId}:riot-link`, 5, 60_000);
  if (!rl.ok) return fail(`Too many attempts. Try again in ${rl.retryAfter}s`, 429);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Provide riotName, riotTag and a valid region.");
  const { riotName, riotTag, region } = parsed.data;

  let puuid: string | null = null;
  let verified = false;
  try {
    // If no API key is configured, store unverified (key is optional locally).
    if (process.env.HENRIK_API_KEY) {
      const acc = await fetchAccount(riotName, riotTag, u.userId);
      puuid = acc.puuid;
      verified = true;
    }
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not validate Riot account.");
  }

  const account = await prisma.valorantAccount.upsert({
    where: { userId: u.userId },
    update: { riotName, riotTag, region, puuid, verified },
    create: { userId: u.userId, riotName, riotTag, region, puuid, verified },
  });
  await prisma.linkedAccount.upsert({
    where: { userId_provider: { userId: u.userId, provider: "riot" } },
    update: { externalId: puuid ?? `${riotName}#${riotTag}`, data: JSON.stringify({ region }) },
    create: { userId: u.userId, provider: "riot", externalId: puuid ?? `${riotName}#${riotTag}`, data: JSON.stringify({ region }) },
  });
  await logAudit(u.userId, "riot.link", account.id, { riotName, riotTag, region, verified });
  return ok({ riotName, riotTag, region, verified, puuid });
}
