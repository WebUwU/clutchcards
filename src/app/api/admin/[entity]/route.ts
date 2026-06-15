// ─── Generic admin CRUD for catalog entities (DB-backed) ────────────
// Handles cards, sets, rarities, types, packs, quests via one route.
import { requireAdmin, ok, fail } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";
import { logAudit } from "@/lib/server/economy.server";

type Entity = "cards" | "sets" | "rarities" | "types" | "packs" | "quests";

// JSON string columns per entity (stored as String in Prisma).
const JSON_FIELDS: Record<string, string[]> = {
  cards: ["tags"],
  packs: ["allowedSetIds", "dropTable"],
};

function model(entity: string) {
  switch (entity) {
    case "cards": return prisma.card;
    case "sets": return prisma.cardSet;
    case "rarities": return prisma.rarity;
    case "types": return prisma.cardType;
    case "packs": return prisma.pack;
    case "quests": return prisma.quest;
    case "shop": return prisma.shopItem;
    default: return null;
  }
}

// Encode JSON-array fields to strings before writing.
function encode(entity: string, data: Record<string, any>) {
  const out = { ...data };
  for (const f of JSON_FIELDS[entity] ?? []) {
    if (Array.isArray(out[f])) out[f] = JSON.stringify(out[f]);
  }
  return out;
}
// Decode JSON-array fields back to arrays on read.
function decode(entity: string, row: Record<string, any>) {
  const out = { ...row };
  for (const f of JSON_FIELDS[entity] ?? []) {
    if (typeof out[f] === "string") { try { out[f] = JSON.parse(out[f]); } catch { out[f] = []; } }
  }
  return out;
}

export async function GET(_req: Request, { params }: { params: { entity: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const m = model(params.entity);
  if (!m) return fail("Unknown entity", 404);
  const rows = await (m as any).findMany({ orderBy: { id: "asc" } });
  return ok(rows.map((r: any) => decode(params.entity, r)));
}

export async function POST(req: Request, { params }: { params: { entity: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const m = model(params.entity);
  if (!m) return fail("Unknown entity", 404);

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid data");

  // Generate an id if missing.
  const id = body.id && String(body.id).length ? String(body.id) : `${params.entity.slice(0, 4)}-${Date.now().toString(36)}`;
  const data = encode(params.entity, { ...body, id });

  // Strip fields that aren't real columns (defensive).
  delete (data as any).ownedAmount;
  delete (data as any).rarity;
  delete (data as any).type;

  try {
    const row = await (m as any).upsert({ where: { id }, update: data, create: data });
    await logAudit(a.userId, `admin.${params.entity}.upsert`, id);
    return ok(decode(params.entity, row));
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Save failed");
  }
}

export async function DELETE(req: Request, { params }: { params: { entity: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const m = model(params.entity);
  if (!m) return fail("Unknown entity", 404);
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return fail("Missing id");

  try {
    // Soft-delete where an isActive flag exists; hard-delete otherwise.
    if (["cards", "sets", "packs", "quests"].includes(params.entity)) {
      await (m as any).update({ where: { id }, data: { isActive: false } });
    } else {
      await (m as any).delete({ where: { id } });
    }
    await logAudit(a.userId, `admin.${params.entity}.delete`, id);
    return ok({ id, deleted: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Delete failed");
  }
}
