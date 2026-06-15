// ─── One-time admin bootstrap ───────────────────────────────────────
// Creates (or promotes) the admin user from ADMIN_EMAIL / ADMIN_PASSWORD
// directly in the production DB — useful when the seed never ran on Neon.
// Protected by a secret you pass as ?secret=… which must equal ADMIN_PASSWORD.
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/prisma";
import { ok, fail } from "@/lib/server/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return fail("ADMIN_EMAIL / ADMIN_PASSWORD are not set in the environment.", 503);

  // Require the caller to know the admin password (passed as ?secret=).
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== password) {
    return fail("Unauthorized. Append ?secret=YOUR_ADMIN_PASSWORD to the URL.", 401);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "admin", passwordHash },
    create: { email, name: "Admin", role: "admin", passwordHash },
  });

  // Ensure the admin has a profile + settings so the app works for them too.
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, username: "admin", displayName: "Admin", freeCoins: 1000, premiumCoins: 0 },
  });
  await prisma.settings.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, json: "{}" },
  });

  return ok({ ready: true, email, message: "Admin user is ready. You can now sign in at /admin/login." });
}
