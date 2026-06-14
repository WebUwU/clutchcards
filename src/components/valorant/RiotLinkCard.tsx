"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { useToast } from "@/components/ui/Toast";
import { Link2, RefreshCw, CheckCircle2 } from "lucide-react";

const REGIONS = [
  { value: "eu", label: "Europe" }, { value: "na", label: "North America" },
  { value: "ap", label: "Asia Pacific" }, { value: "kr", label: "Korea" },
  { value: "latam", label: "LATAM" }, { value: "br", label: "Brazil" },
];

export function RiotLinkCard() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [region, setRegion] = useState("eu");
  const [linked, setLinked] = useState<{ riotName: string; riotTag: string; region: string; verified: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.me().then((d) => {
      const v = d.valorant as typeof linked;
      if (v) { setLinked(v); setName(v.riotName); setTag(v.riotTag); setRegion(v.region); }
    }).catch(() => {});
  }, []);

  const link = async () => {
    setBusy(true);
    try {
      const res = await api.linkRiot(name.trim(), tag.trim().replace("#", ""), region) as typeof linked;
      setLinked(res);
      toast(res?.verified ? "Riot account verified & linked" : "Riot account linked (set HENRIK_API_KEY to verify)", "success");
    } catch (e) { toast(e instanceof Error ? e.message : "Link failed", "error"); }
    finally { setBusy(false); }
  };

  const sync = async () => {
    setBusy(true);
    try {
      const res = await api.syncMatches();
      toast(`Synced ${res.added} new match${res.added === 1 ? "" : "es"}`, "success");
    } catch (e) { toast(e instanceof Error ? e.message : "Sync failed", "error"); }
    finally { setBusy(false); }
  };

  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center gap-2">
        <Link2 className="size-4 text-tactical" />
        <h3 className="font-display text-base font-bold text-white">Valorant Account</h3>
        {linked?.verified && <span className="flex items-center gap-1 text-xs text-rarity-uncommon"><CheckCircle2 className="size-3.5" /> Verified</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Riot name"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-ascend/40" />
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="TAG"
          className="w-20 rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white outline-none focus:border-ascend/40" />
        <select value={region} onChange={(e) => setRegion(e.target.value)}
          className="rounded-xl border border-white/10 bg-ink-950 px-2 py-2 text-sm text-white outline-none">
          {REGIONS.map((r) => <option key={r.value} value={r.value} className="bg-ink-900">{r.label}</option>)}
        </select>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">Format: Name#TAG — validated server-side via HenrikDev.</p>

      <div className="mt-3 flex gap-2">
        <button onClick={link} disabled={busy || !name || !tag} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
          {linked ? "Update link" : "Link account"}
        </button>
        <button onClick={sync} disabled={busy || !linked} className="btn-cyan px-4 py-2 text-sm disabled:opacity-50">
          <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} /> Check Matches
        </button>
      </div>
    </div>
  );
}
