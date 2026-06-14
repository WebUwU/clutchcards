import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Rarity → tailwind text/border/glow helpers.
// Indexed by string (rarity id) with safe fallbacks so dynamic admin-created
// rarities don't break components that read these maps directly.
const RARITY_COLORS: Record<string, string> = {
  common: "#9aa4b2",
  uncommon: "#46d17a",
  rare: "#3ea6ff",
  epic: "#b15cff",
  legendary: "#ffb017",
  mythic: "#ff4655",
};
export const rarityColor: Record<string, string> = new Proxy(RARITY_COLORS, {
  get: (t, k: string) => t[k] ?? "#9aa4b2",
});

const RARITY_ORDER: Record<string, number> = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5,
};
export const rarityOrder: Record<string, number> = new Proxy(RARITY_ORDER, {
  get: (t, k: string) => t[k] ?? 0,
});

const RARITY_LABELS: Record<string, string> = {
  common: "Common", uncommon: "Uncommon", rare: "Rare",
  epic: "Epic", legendary: "Legendary", mythic: "Mythic",
};
export const rarityLabel: Record<string, string> = new Proxy(RARITY_LABELS, {
  get: (t, k: string) => t[k] ?? (typeof k === "string" ? k.charAt(0).toUpperCase() + k.slice(1) : "Unknown"),
});

// Deterministic gradient placeholder when an image asset is missing.
export function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const h2 = (h + 48) % 360;
  return `linear-gradient(135deg, hsl(${h} 55% 22%), hsl(${h2} 60% 12%))`;
}

// ─── Added in v2: dynamic helpers ───────────────────────────────────

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Look up a rarity color from a dynamic rarity list, with a safe fallback. */
export function rarityColorFrom(
  rarityId: string,
  list: { id: string; color: string }[],
): string {
  return list.find((r) => r.id === rarityId)?.color ?? "#9aa4b2";
}
