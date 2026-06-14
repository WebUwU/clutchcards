// ─── Shared API helpers: auth gates, rate limiting, responses ────────
import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function requireUser() {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { userId: id, role: (session!.user as { role?: string }).role ?? "user" };
}

export async function requireAdmin() {
  const res = await requireUser();
  if ("error" in res) return res;
  if (res.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return res;
}

export function ok<T>(data: T) {
  return NextResponse.json({ ok: true, data });
}
export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// Simple in-memory rate limiter (per-process). For multi-instance production,
// back this with Redis. Keyed by `${userId}:${bucket}`.
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (entry.count >= max) return { ok: false, retryAfter: Math.ceil((entry.reset - now) / 1000) };
  entry.count += 1;
  return { ok: true };
}

// Cooldown helper backed by a timestamp column (returns remaining seconds).
export function cooldownRemaining(last: Date | null, cooldownMs: number): number {
  if (!last) return 0;
  const elapsed = Date.now() - last.getTime();
  return elapsed >= cooldownMs ? 0 : Math.ceil((cooldownMs - elapsed) / 1000);
}
