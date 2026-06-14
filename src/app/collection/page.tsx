"use client";

import { useMemo, useState } from "react";
import { Search, Library, FlaskConical, X, LayoutGrid, Rows3, List } from "lucide-react";
import type { Card, CardFilterState, CardSortKey, CardViewMode } from "@/types";
import { AppShell } from "@/components/layout/AppShell";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { FusionPanel } from "@/components/cards/FusionPanel";
import { CollectionStats } from "@/components/cards/CollectionStats";
import { SetProgressCard } from "@/components/cards/SetProgressCard";
import { CardDetailModal } from "@/components/cards/CardDetailModal";
import { useLocalDb } from "@/hooks/useLocalDb";
import { resolveCards, resolveCardSets, resolveRarities, resolveCardTypes } from "@/lib/registry";
import { withOwnedAmounts, filterCards } from "@/lib/cards";
import { cn } from "@/lib/utils";

const SORTS: { key: CardSortKey; label: string }[] = [
  { key: "rarity", label: "Rarity" },
  { key: "name", label: "Name" },
  { key: "owned", label: "Owned" },
  { key: "newest", label: "Newest" },
  { key: "set", label: "Set" },
];

const VIEWS: { key: CardViewMode; icon: typeof LayoutGrid }[] = [
  { key: "grid", icon: LayoutGrid },
  { key: "compact", icon: Rows3 },
  { key: "detail", icon: List },
];

export default function CollectionPage() {
  const { loading, collection } = useLocalDb();
  const [fusionOpen, setFusionOpen] = useState(false);
  const [detail, setDetail] = useState<Card | null>(null);

  const rarities = useMemo(() => resolveRarities(), []);
  const types = useMemo(() => resolveCardTypes(), []);
  const sets = useMemo(() => resolveCardSets().filter((s) => s.isActive), []);

  const [filters, setFilters] = useState<CardFilterState>({
    query: "", setId: "all", rarityId: "all", typeId: "all",
    tradableOnly: false, ownedFilter: "all", duplicatesOnly: false,
    limitedOnly: false, animatedOnly: false, sort: "rarity", view: "grid",
  });
  const patch = (p: Partial<CardFilterState>) => setFilters((f) => ({ ...f, ...p }));

  const liveCards = useMemo(
    () => withOwnedAmounts(resolveCards().filter((c) => c.isActive), collection),
    [collection],
  );
  const filtered = useMemo(() => filterCards(liveCards, filters), [liveCards, filters]);

  const ownedCount = liveCards.filter((c) => c.ownedAmount > 0).length;
  const total = liveCards.length;
  const completion = total > 0 ? Math.round((ownedCount / total) * 100) : 0;
  const duplicates = liveCards.reduce((s, c) => s + Math.max(0, c.ownedAmount - 1), 0);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Your cards</span>
          <h1 className="mt-1 font-display text-3xl font-bold text-white">Collection</h1>
          <p className="mt-1 text-sm text-slate-400">{ownedCount} / {total} owned · <span className="text-tactical">{completion}% complete</span></p>
        </div>
        <button onClick={() => setFusionOpen(true)} className="btn-cyan"><FlaskConical className="size-4" /> Fusion Forge</button>
      </div>

      <div className="mb-5"><CollectionStats owned={ownedCount} total={total} duplicates={duplicates} completion={completion} /></div>

      {sets.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sets.map((s) => {
            const setCards = liveCards.filter((c) => c.setId === s.id);
            const setOwned = setCards.filter((c) => c.ownedAmount > 0).length;
            return <SetProgressCard key={s.id} set={s} owned={setOwned} total={setCards.length} />;
          })}
        </div>
      )}

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 focus-within:border-ascend/40">
          <Search className="size-4 text-slate-500" />
          <input value={filters.query} onChange={(e) => patch({ query: e.target.value })} placeholder="Search cards, tags…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
          {filters.query && <button onClick={() => patch({ query: "" })}><X className="size-4 text-slate-500 hover:text-white" /></button>}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip active={filters.rarityId === "all"} onClick={() => patch({ rarityId: "all" })}>All rarities</Chip>
          {rarities.map((r) => <Chip key={r.id} active={filters.rarityId === r.id} onClick={() => patch({ rarityId: r.id })}>{r.name}</Chip>)}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip active={filters.setId === "all"} onClick={() => patch({ setId: "all" })}>All sets</Chip>
          {sets.map((s) => <Chip key={s.id} active={filters.setId === s.id} onClick={() => patch({ setId: s.id })}>{s.name}</Chip>)}
          <span className="mx-1 w-px self-stretch bg-white/10" />
          {types.map((t) => <Chip key={t.id} active={filters.typeId === t.id} onClick={() => patch({ typeId: filters.typeId === t.id ? "all" : t.id })}>{t.name}</Chip>)}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip active={filters.ownedFilter === "owned"} onClick={() => patch({ ownedFilter: filters.ownedFilter === "owned" ? "all" : "owned" })}>Owned</Chip>
          <Chip active={filters.ownedFilter === "missing"} onClick={() => patch({ ownedFilter: filters.ownedFilter === "missing" ? "all" : "missing" })}>Missing</Chip>
          <Chip active={filters.duplicatesOnly} onClick={() => patch({ duplicatesOnly: !filters.duplicatesOnly })}>Duplicates</Chip>
          <Chip active={filters.tradableOnly} onClick={() => patch({ tradableOnly: !filters.tradableOnly })}>Tradable</Chip>
          <Chip active={filters.limitedOnly} onClick={() => patch({ limitedOnly: !filters.limitedOnly })}>Limited</Chip>
          <Chip active={filters.animatedOnly} onClick={() => patch({ animatedOnly: !filters.animatedOnly })}>Animated</Chip>

          <div className="ml-auto flex items-center gap-2">
            <select value={filters.sort} onChange={(e) => patch({ sort: e.target.value as CardSortKey })}
              className="rounded-lg border border-white/10 bg-ink-900 px-2.5 py-1.5 text-xs text-white outline-none">
              {SORTS.map((s) => <option key={s.key} value={s.key} className="bg-ink-900">Sort: {s.label}</option>)}
            </select>
            <div className="flex rounded-lg border border-white/10 bg-ink-900 p-0.5">
              {VIEWS.map((v) => (
                <button key={v.key} onClick={() => patch({ view: v.key })}
                  className={cn("grid size-7 place-items-center rounded-md", filters.view === v.key ? "bg-ascend/20 text-ascend" : "text-slate-500 hover:text-white")}>
                  <v.icon className="size-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-ink-800/60" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No cards match your filters" hint="Try clearing search or adjusting filters." icon={<Library className="size-6" />} />
      ) : filters.view === "detail" ? (
        <div className="space-y-2">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setDetail(c)} className="panel flex w-full items-center gap-3 p-2.5 text-left hover:border-white/15">
              <div className="size-12 shrink-0 rounded-lg bg-ink-700 bg-cover" style={{ backgroundImage: `url(${c.image})` }} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">{c.name}</div>
                <div className="truncate text-xs text-slate-500">{c.description}</div>
              </div>
              <span className="shrink-0 font-mono text-xs text-slate-400">×{c.ownedAmount}</span>
            </button>
          ))}
        </div>
      ) : (
        <CardGrid cards={filtered} onCardClick={setDetail} />
      )}

      <FusionPanel open={fusionOpen} onClose={() => setFusionOpen(false)} />
      <CardDetailModal card={detail} onClose={() => setDetail(null)} />
    </AppShell>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn(
      "rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-colors",
      active ? "bg-ascend/15 text-ascend ring-1 ring-ascend/30" : "bg-ink-800/60 text-slate-400 hover:text-white ring-1 ring-white/[0.06]",
    )}>{children}</button>
  );
}
