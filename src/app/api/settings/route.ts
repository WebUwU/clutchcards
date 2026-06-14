import { requireUser, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const s = await prisma.settings.findUnique({ where: { userId: u.userId } });
  return ok(s ? JSON.parse(s.json) : {});
}

export async function PUT(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid settings");
  await prisma.settings.upsert({
    where: { userId: u.userId },
    update: { json: JSON.stringify(body) },
    create: { userId: u.userId, json: JSON.stringify(body) },
  });
  return ok({ saved: true });
}
