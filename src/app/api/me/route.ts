export const dynamic = "force-dynamic";
import { requireUser, ok } from "@/lib/server/api";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const u = await requireUser();
  if ("error" in u) return u.error;

  // Auto-provision a profile/settings row for fresh accounts (e.g. first
  // Discord login) so the rest of the app always has data to read.
  let profile = await prisma.profile.findUnique({ where: { userId: u.userId } });
  if (!profile) {
    const user = await prisma.user.findUnique({ where: { id: u.userId } });
    const base = (user?.name || `player_${u.userId.slice(0, 6)}`).replace(/\s+/g, "_");
    profile = await prisma.profile.create({
      data: {
        userId: u.userId,
        username: `${base}_${u.userId.slice(0, 4)}`.toLowerCase(),
        displayName: user?.name ?? "",
        avatar: user?.image ?? "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=clutch",
      },
    });
    await prisma.settings.upsert({ where: { userId: u.userId }, update: {}, create: { userId: u.userId, json: "{}" } });
  }

  // Daily login streak + lastLogin (also drives the daily_login quest).
  const now = new Date();
  const last = profile.lastLogin;
  if (!last || now.getTime() - last.getTime() > 12 * 60 * 60 * 1000) {
    const yesterday = last && now.getTime() - last.getTime() < 48 * 60 * 60 * 1000;
    profile = await prisma.profile.update({
      where: { userId: u.userId },
      data: { lastLogin: now, dailyStreak: yesterday ? { increment: 1 } : 1 },
    });
  }

  // Keep the stored level in sync with cumulative XP (single source of truth),
  // so the displayed level can never drift from XP.
  const { levelStateFromTotalXp } = await import("@/lib/economy");
  const derived = levelStateFromTotalXp(profile.xp);
  if (derived.level !== profile.level) {
    profile = await prisma.profile.update({ where: { userId: u.userId }, data: { level: derived.level } });
  }

  const valorant = await prisma.valorantAccount.findUnique({ where: { userId: u.userId } });
  return ok({
    profile: { ...profile, showcaseCardIds: profile.showcaseCardIds },
    valorant,
  });
}
