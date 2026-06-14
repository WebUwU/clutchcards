// ─── HenrikDev API client (SERVER ONLY) ─────────────────────────────
// Docs: https://docs.henrikdev.xyz/
// The API key is read from HENRIK_API_KEY and never exposed to the client.
// All calls happen in server routes; results are cached in the DB.

import { prisma } from "./prisma";

const BASE = "https://api.henrikdev.xyz";

function key() {
  const k = process.env.HENRIK_API_KEY;
  return k && k.length > 0 ? k : null;
}

async function call<T>(path: string, userId: string | null): Promise<T> {
  const apiKey = key();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["Authorization"] = apiKey;
  const res = await fetch(`${BASE}${path}`, { headers, cache: "no-store" });
  await prisma.apiSyncLog.create({
    data: { userId: userId ?? undefined, endpoint: path, status: String(res.status), detail: res.ok ? "ok" : await res.clone().text().catch(() => "") },
  });
  if (res.status === 429) throw new Error("HenrikDev rate limit reached. Try again shortly.");
  if (!res.ok) throw new Error(`HenrikDev request failed (${res.status}).`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

export interface HenrikAccount { puuid: string; region: string; name: string; tag: string; }

/** Validate a Riot account by name#tag. */
export async function fetchAccount(name: string, tag: string, userId: string | null): Promise<HenrikAccount> {
  return call<HenrikAccount>(`/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, userId);
}

interface HenrikMatchPlayerStats { kills: number; deaths: number; assists: number; headshots?: number; }
interface HenrikMatch {
  metadata: { matchid: string; map: string; mode: string; game_start: number };
  players: { all_players: { puuid: string; character: string; team: string; stats: { kills: number; deaths: number; assists: number; headshots?: number } }[] };
  teams?: { red: { has_won: boolean }; blue: { has_won: boolean } };
}

/** Recent matches for a name#tag/region. */
export async function fetchRecentMatches(region: string, name: string, tag: string, userId: string | null): Promise<HenrikMatch[]> {
  return call<HenrikMatch[]>(`/valorant/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`, userId);
}

/** Extract the row relevant to a given puuid from a raw match. */
export function extractPlayerMatch(match: HenrikMatch, puuid: string) {
  const me = match.players.all_players.find((p) => p.puuid === puuid);
  if (!me) return null;
  const won = me.team === "Red" ? match.teams?.red.has_won : match.teams?.blue.has_won;
  return {
    matchId: match.metadata.matchid,
    map: match.metadata.map,
    agent: me.character,
    won: !!won,
    kills: me.stats.kills,
    deaths: me.stats.deaths,
    assists: me.stats.assists,
    headshots: me.stats.headshots ?? 0,
    playedAt: new Date(match.metadata.game_start * 1000),
  };
}
