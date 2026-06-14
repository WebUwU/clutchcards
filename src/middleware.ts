import NextAuth from "next-auth";
import { authConfig } from "@/lib/server/auth.config";

// Edge-safe: this NextAuth instance uses ONLY the base config (no Prisma),
// so the middleware bundle stays under the Edge size limit. The `authorized`
// callback in auth.config.ts gates the /admin area.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  // The `authorized` callback already decides access; if it returned false
  // for /admin, NextAuth redirects to the signIn page automatically.
  return;
});

export const config = {
  matcher: ["/admin/:path*"],
};
