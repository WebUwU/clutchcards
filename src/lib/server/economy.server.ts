// ─── Server-authoritative economy ───────────────────────────────────
// Every coin/card/reward mutation goes through here, inside a DB
// transaction. The client can NEVER set balances, mint cards, or grant
// rewards directly — it can only call API routes that invoke these.

import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export const ECONOMY = {
  marketFeeRate: 0.1,
  listingFeeFlat: 5,
  premiumToFreeRate: 10,
  // HARD INVARIANTS — never overridden:
  allowFreeToPremium: false,
  allowCashout: false,
};

type Tx = Prisma.TransactionClient;

export function marketFee(price: number) {
  return Math.round(price * ECONOMY.marketFeeRate);
}
export function sellerNet(price: number) {
  return Math.max(0, price - marketFee(price) - ECONOMY.listingFeeFlat);
}

/** Add cards to a user's inventory (increments duplicates). Idempotent-safe within a tx. */
export async function grantCards(tx: Tx, userId: string, cardIds: string[]) {
  for (const cardId of cardIds) {
    await tx.inventoryItem.upsert({
      where: { userId_cardId: { userId, cardId } },
      update: { amount: { increment: 1 } },
      create: { userId, cardId, amount: 1 },
    });
  }
}

/** Remove one copy of a card; throws if the user doesn't own it. */
export async function consumeCard(tx: Tx, userId: string, cardId: string) {
  const item = await tx.inventoryItem.findUnique({ where: { userId_cardId: { userId, cardId } } });
  if (!item || item.amount < 1) throw new Error("You do not own this card.");
  if (item.amount === 1) await tx.inventoryItem.delete({ where: { id: item.id } });
  else await tx.inventoryItem.update({ where: { id: item.id }, data: { amount: { decrement: 1 } } });
}

/** Adjust balances with floor checks. Premium can go to free; never the reverse. */
export async function adjustBalance(
  tx: Tx, userId: string, deltaFree: number, deltaPremium: number,
) {
  const profile = await tx.profile.findUnique({ where: { userId } });
  if (!profile) throw new Error("Profile not found.");
  const nextFree = profile.freeCoins + deltaFree;
  const nextPremium = profile.premiumCoins + deltaPremium;
  if (nextFree < 0) throw new Error("Not enough Free Coins.");
  if (nextPremium < 0) throw new Error("Not enough Premium Coins.");
  await tx.profile.update({
    where: { userId }, data: { freeCoins: nextFree, premiumCoins: nextPremium },
  });
  return { freeCoins: nextFree, premiumCoins: nextPremium };
}

/** Premium → Free conversion. The ONLY allowed direction. */
export async function exchangePremiumToFree(userId: string, premiumAmount: number) {
  if (premiumAmount <= 0) throw new Error("Enter a positive amount.");
  return prisma.$transaction(async (tx) => {
    const freeReceived = premiumAmount * ECONOMY.premiumToFreeRate;
    const balances = await adjustBalance(tx, userId, freeReceived, -premiumAmount);
    await tx.exchange.create({ data: { userId, premiumSpent: premiumAmount, freeReceived } });
    await tx.auditLog.create({ data: { userId, action: "exchange.premium_to_free", meta: JSON.stringify({ premiumAmount, freeReceived }) } });
    return { ...balances, freeReceived };
  });
}

/** Free → Premium is structurally impossible. Exposed only to assert the rule. */
export function exchangeFreeToPremium(): never {
  throw new Error("Free Coins can never be converted to Premium Coins.");
}

export async function logAudit(userId: string | null, action: string, target = "", meta: Record<string, unknown> = {}) {
  await prisma.auditLog.create({ data: { userId: userId ?? undefined, action, target, meta: JSON.stringify(meta) } });
}
