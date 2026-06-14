import type { NextAuthConfig } from "next-auth";

// ─── Edge-safe base config ──────────────────────────────────────────
// This config contains NO database / Node-only code (no Prisma, no bcrypt),
// so it stays small enough to run in the Edge middleware. Providers and the
// adapter that need Node are added in auth.ts, which runs in the Node runtime.
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [], // real providers are attached in auth.ts
  callbacks: {
    // Used by middleware to gate the /admin area.
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) {
        const role = (auth?.user as { role?: string } | undefined)?.role;
        return role === "admin";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.uid as string;
        (session.user as { role?: string }).role = (token.role as string) ?? "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
