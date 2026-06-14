import { requireUser, ok, fail } from "@/lib/server/api";
import { exchangePremiumToFree } from "@/lib/server/economy.server";
import { z } from "zod";

const schema = z.object({ premiumAmount: z.number().int().positive().max(1_000_000) });

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request");
  try {
    const result = await exchangePremiumToFree(u.userId, parsed.data.premiumAmount);
    return ok(result);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Exchange failed");
  }
}
