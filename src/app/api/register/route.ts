import { ok, fail, rateLimit } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { fetchAccount } from "@/lib/server/henrik";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  riotName: z.string().max(32).optional().or(z.literal("")),
  riotTag: z.string().max(8).optional().or(z.literal("")),
  region: z.enum(["eu", "na", "ap", "kr", "latam", "br"]).optional(),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const rl = rateLimit(`${ip}:register`, 5, 60_000);
  if (!rl.ok) return fail(`Too many attempts. Try again in ${rl.retryAfter}s`, 429);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const { email, password, username, riotName, riotTag, region } = parsed.data;

  // Uniqueness checks.
  if (await prisma.user.findUnique({ where: { email } })) return fail("An account with this email already exists.");
  if (await prisma.profile.findUnique({ where: { username } })) return fail("That username is taken.");

  const passwordHash = await bcrypt.hash(password, 10);

  // Optionally validate Riot account (only if provided and a key is set).
  let puuid: string | null = null;
  let verified = false;
  if (riotName && riotTag && region && process.env.HENRIK_API_KEY) {
    try { const acc = await fetchAccount(riotName, riotTag, null); puuid = acc.puuid; verified = true; }
    catch { /* store unverified rather than block sign-up */ }
  }

  const user = await prisma.user.create({
    data: {
      email, passwordHash, name: username, role: "user",
      profile: { create: { username, displayName: username, freeCoins: 1000, premiumCoins: 0 } },
      settings: { create: { json: "{}" } },
    },
  });

  if (riotName && riotTag && region) {
    await prisma.valorantAccount.create({
      data: { userId: user.id, riotName, riotTag, region, puuid, verified },
    });
    await prisma.linkedAccount.create({
      data: { userId: user.id, provider: "riot", externalId: puuid ?? `${riotName}#${riotTag}`, data: JSON.stringify({ region }) },
    });
  }

  return ok({ created: true });
}
