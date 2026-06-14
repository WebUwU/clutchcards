// ─── Local admin auth (DEMO ONLY) ───────────────────────────────────
// This is a client-side gate for local prototyping. It is NOT secure and
// MUST be replaced with real server-side auth (hashed passwords, sessions,
// role checks) before any deployment. See README "Production security".

import type { AdminSession } from "@/types";

const SESSION_KEY = "ascendant:admin_session";

// Credentials come from env when provided, with a local dev fallback so the
// demo works out of the box. Never rely on this in production.
const ADMIN_USERNAME =
  process.env.NEXT_PUBLIC_ADMIN_USERNAME ?? "Schinken";
const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "jsa(=)/sSSkijsdu8@@iksis**+w";

const hasWindow = () => typeof window !== "undefined";

export function loginAdmin(username: string, password: string): { ok: boolean; error?: string } {
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return { ok: false, error: "Invalid username or password." };
  }
  if (hasWindow()) {
    const session: AdminSession = {
      loggedIn: true,
      username,
      since: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
  }
  return { ok: true };
}

export function logoutAdmin(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getAdminSession(): AdminSession | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession()?.loggedIn === true;
}

/** Returns true if access is allowed; intended to be called in a client effect. */
export function requireAdminClientSide(): boolean {
  return isAdminLoggedIn();
}
