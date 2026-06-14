// ─── Server pack opening (authoritative) ────────────────────────────
import { prisma } from "./prisma";
import { adjustBalance, grantCards, logAudit } from "./economy.server";

interface DropEntry { rarityId: string; weight: number; }

async function rarityOrder(): Promise<Record<string, number>> {
  const rs = await prisma.rarity.findMany();
  return Object.fromEntries(rs.map((r) => [r.id, r.sortOrder]));
}

function pickRarity(table: DropEntry[]): string {
  const total = table.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const e of table) { roll -= e.weight; if (roll <= 0) return e.rarityId; }
  return table[table.length - 1]?.rarityId ?? "common";
}

export async function openPackServer(userId: string, packId: string) {
  const pack = await prisma.pack.findUnique({ where: { id: packId } });
  if (!pack || !pack.isActive) throw new Error("Pack not available.");

  const allowedSetIds: string[] = JSON.parse(pack.allowedSetIds);
  const dropTable: DropEntry[] = JSON.parse(pack.dropTable);
  const pool = await prisma.card.findMany({
    where: { isActive: true, setId: { in: allowedSetIds } },
  });
  if (pool.length === 0) throw new Error("This pack has no cards to award.");

  const order = await rarityOrder();

  // Roll cards.
  const rolled: typeof pool = [];
  for (let i = 0; i < pack.cardCount; i++) {
    const rarityId = pickRarity(dropTable);
    let candidates = pool.filter((c) => c.rarityId === rarityId);
    if (candidates.length === 0) candidates = pool;
    rolled.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  // Guarantee.
  if (pack.guaranteedRarity) {
    const minO = order[pack.guaranteedRarity] ?? 0;
    if (!rolled.some((c) => (order[c.rarityId] ?? 0) >= minO)) {
      const upgrades = pool.filter((c) => (order[c.rarityId] ?? 0) >= minO);
      if (upgrades.length) rolled[rolled.length - 1] = upgrades[Math.floor(Math.random() * upgrades.length)];
    }
  }

  const highest = rolled.reduce((a, c) => ((order[c.rarityId] ?? 0) > (order[a] ?? 0) ? c.rarityId : a), "common");
  const cardIds = rolled.map((c) => c.id);

  // Charge + grant atomically.
  await prisma.$transaction(async (tx) => {
    await adjustBalance(tx, userId, -pack.priceFreeCoins, -pack.pricePremiumCoins);
    await grantCards(tx, userId, cardIds);
    await tx.packOpening.create({ data: { userId, packId, cardIds: JSON.stringify(cardIds), highestRarity: highest } });
    await tx.transaction.create({
      data: { cardId: cardIds[0], buyerId: userId, sellerId: userId, price: pack.pricePremiumCoins || pack.priceFreeCoins, type: "pack" },
    });
  });
  await logAudit(userId, "pack.open", packId, { cardIds, highest });

  return { cards: rolled, highestRarity: highest };
}
