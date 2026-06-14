import { requireUser, ok, fail, rateLimit } from "@/lib/server/api";
import { openPackServer } from "@/lib/server/packs.server";
import { z } from "zod";

const schema = z.object({ packId: z.string().min(1) });

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const rl = rateLimit(`${u.userId}:pack-open`, 10, 10_000);
  if (!rl.ok) return fail(`Slow down — try again in ${rl.retryAfter}s`, 429);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("Invalid request");

  try {
    const result = await openPackServer(u.userId, parsed.data.packId);
    return ok({
      cards: result.cards.map((c) => ({ ...c, tags: JSON.parse(c.tags) })),
      highestRarity: result.highestRarity,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to open pack");
  }
}
