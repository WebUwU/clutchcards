import { requireUser, ok, fail } from "@/lib/server/api";
import { claimQuest } from "@/lib/server/quests.server";
import { z } from "zod";

const schema = z.object({ questId: z.string() });

export async function POST(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request");
  try {
    const reward = await claimQuest(u.userId, parsed.data.questId);
    return ok(reward);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Claim failed");
  }
}
