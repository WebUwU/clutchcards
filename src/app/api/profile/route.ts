import { requireUser, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { z } from "zod";

const schema = z.object({
  displayName: z.string().max(40).optional(),
  bio: z.string().max(280).optional(),
  avatar: z.string().max(200).optional(),
  region: z.string().max(40).optional(),
  language: z.string().max(40).optional(),
  timezone: z.string().max(60).optional(),
  favoriteRole: z.string().max(20).optional(),
  favoriteCategory: z.string().max(40).optional(),
  isPublic: z.boolean().optional(),
  showcaseCardIds: z.array(z.string()).optional(),
});

export async function PUT(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid profile data");
  const d = parsed.data;
  const data: Record<string, unknown> = { ...d };
  if (d.showcaseCardIds) data.showcaseCardIds = JSON.stringify(d.showcaseCardIds);
  const profile = await prisma.profile.update({ where: { userId: u.userId }, data });
  return ok({ ...profile, showcaseCardIds: JSON.parse(profile.showcaseCardIds) });
}
