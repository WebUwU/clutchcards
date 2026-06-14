import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cards } from "../src/data/cards";
import { cardSets } from "../src/data/cardSets";
import { rarities } from "../src/data/rarities";
import { cardTypes } from "../src/data/cardTypes";
import { packs } from "../src/data/packs";
import { quests } from "../src/data/quests";

const prisma = new PrismaClient();

async function main() {
  // Rarities, types, sets
  for (const r of rarities) {
    await prisma.rarity.upsert({ where: { id: r.id }, update: { ...r }, create: { ...r } });
  }
  for (const t of cardTypes) {
    await prisma.cardType.upsert({ where: { id: t.id }, update: { ...t }, create: { ...t } });
  }
  for (const s of cardSets) {
    const { releaseDate, ...rest } = s;
    await prisma.cardSet.upsert({
      where: { id: s.id },
      update: { ...rest, releaseDate: new Date(releaseDate) },
      create: { ...rest, releaseDate: new Date(releaseDate) },
    });
  }
  // Cards
  for (const c of cards) {
    const data = {
      id: c.id, setId: c.setId, name: c.name, slug: c.slug, rarityId: c.rarityId,
      typeId: c.typeId, role: c.role, description: c.description, image: c.image,
      tradable: c.tradable, fusionValue: c.fusionValue, isLimited: c.isLimited,
      isAnimated: c.isAnimated, isFeatured: c.isFeatured, tags: JSON.stringify(c.tags),
      isActive: c.isActive, createdAt: new Date(c.createdAt),
    };
    await prisma.card.upsert({ where: { id: c.id }, update: data, create: data });
  }
  // Packs
  for (const p of packs) {
    const data = {
      id: p.id, name: p.name, slug: p.slug, description: p.description, image: p.image,
      priceFreeCoins: p.priceFreeCoins, pricePremiumCoins: p.pricePremiumCoins,
      allowedSetIds: JSON.stringify(p.allowedSetIds), dropTable: JSON.stringify(p.dropTable),
      guaranteedRarity: p.guaranteedRarity ?? null, cardCount: p.cardCount,
      isPremium: p.isPremium, isActive: p.isActive, createdAt: new Date(p.createdAt),
    };
    await prisma.pack.upsert({ where: { id: p.id }, update: data, create: data });
  }
  // Quests — map the demo quest shape onto the server metric model.
  const metricFor = (title: string): { metric: string; goal: number } => {
    const t = title.toLowerCase();
    if (t.includes("win")) return { metric: "matches_won", goal: t.includes("3") ? 3 : 1 };
    if (t.includes("kill")) return { metric: "kills", goal: 30 };
    if (t.includes("login")) return { metric: "daily_login", goal: 1 };
    return { metric: "matches_played", goal: t.includes("3") ? 3 : 1 };
  };
  for (const q of quests) {
    const m = metricFor(q.title);
    const data = {
      id: q.id, title: q.title, description: q.description, period: q.period,
      difficulty: q.difficulty, metric: m.metric, goal: q.progressRequired || m.goal,
      rewardXp: q.rewardXp, rewardFreeCoins: q.rewardFreeCoins,
      rewardPackId: q.rewardPackId ?? null, isActive: q.isActive,
    };
    await prisma.quest.upsert({ where: { id: q.id }, update: data, create: data });
  }

  // Admin user (server-side credentials).
  const email = process.env.ADMIN_EMAIL ?? "admin@ascendant.local";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "admin", passwordHash },
    create: { email, name: "Admin", role: "admin", passwordHash },
  });
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id, username: "admin", displayName: "Admin",
      premiumCoins: 100000, freeCoins: 100000, level: 99,
    },
  });

  console.log("Seed complete:", {
    rarities: rarities.length, types: cardTypes.length, sets: cardSets.length,
    cards: cards.length, packs: packs.length, quests: quests.length, admin: email,
  });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
