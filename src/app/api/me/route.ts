import { requireUser, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const profile = await prisma.profile.findUnique({ where: { userId: u.userId } });
  if (!profile) return fail("Profile not found", 404);
  const valorant = await prisma.valorantAccount.findUnique({ where: { userId: u.userId } });
  return ok({ profile, valorant });
}
