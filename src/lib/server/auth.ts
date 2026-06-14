import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Full config (Node runtime): base config + Prisma adapter + providers.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = adminSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.role !== "admin") return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    Credentials({
      id: "user-credentials",
      name: "Email",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = adminSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Override jwt to also refresh role from DB (Node-only).
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
        token.uid = user.id;
      } else if (token.uid) {
        const db = await prisma.user.findUnique({ where: { id: token.uid as string } });
        if (db) token.role = db.role;
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const username = (user.name || `player_${user.id.slice(0, 6)}`).replace(/\s+/g, "_");
      await prisma.profile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, username: `${username}_${user.id.slice(0, 4)}`, displayName: user.name ?? "" },
      });
      await prisma.settings.upsert({
        where: { userId: user.id }, update: {}, create: { userId: user.id, json: "{}" },
      });
    },
  },
});
