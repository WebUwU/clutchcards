import { requireAdmin, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { logAudit } from "@/lib/server/economy.server";
import { z } from "zod";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const cards = await prisma.card.findMany({ orderBy: { createdAt: "desc" } });
  return ok(cards.map((c) => ({ ...c, tags: JSON.parse(c.tags) })));
}

const cardSchema = z.object({
  id: z.string().optional(),
  setId: z.string(), name: z.string().min(1), slug: z.string().min(1),
  rarityId: z.string(), typeId: z.string(), role: z.string().default("neutral"),
  description: z.string().default(""), image: z.string().default(""),
  tradable: z.boolean().default(true), fusionValue: z.number().int().default(100),
  isLimited: z.boolean().default(false), isAnimated: z.boolean().default(false),
  isFeatured: z.boolean().default(false), tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export async function POST(req: Request) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const parsed = cardSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid card data");
  const d = parsed.data;
  const id = d.id ?? `card-${Date.now().toString(36)}`;
  const data = { ...d, id, tags: JSON.stringify(d.tags) };
  const card = await prisma.card.upsert({ where: { id }, update: data, create: data });
  await logAudit(a.userId, "admin.card.upsert", id, { name: d.name });
  return ok({ ...card, tags: JSON.parse(card.tags) });
}

export async function DELETE(req: Request) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return fail("Missing id");
  await prisma.card.update({ where: { id }, data: { isActive: false } }); // soft delete
  await logAudit(a.userId, "admin.card.disable", id);
  return ok({ id, disabled: true });
}
