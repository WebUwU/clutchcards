"use client";

import { useState, ReactNode } from "react";
import { Search, Plus, Pencil, Copy, Power, Trash2 } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface RowAction<T> {
  icon: "edit" | "duplicate" | "disable" | "delete";
  label: string;
  onClick: (row: T) => void;
}

const icons = {
  edit: Pencil,
  duplicate: Copy,
  disable: Power,
  delete: Trash2,
};

export function AdminTable<T extends { id: string }>({
  rows,
  columns,
  actions,
  searchKeys,
  onAdd,
  addLabel = "Add new",
  emptyLabel = "Nothing here yet.",
}: {
  rows: T[];
  columns: Column<T>[];
  actions?: RowAction<T>[];
  searchKeys?: (keyof T)[];
  onAdd?: () => void;
  addLabel?: string;
  emptyLabel?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = query && searchKeys
    ? rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(query.toLowerCase())),
      )
    : rows;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {searchKeys && (
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 focus-within:border-ascend/40">
            <Search className="size-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>
        )}
        {onAdd && (
          <button onClick={onAdd} className="btn-primary px-4 py-2 text-sm">
            <Plus className="size-4" /> {addLabel}
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-ink-900/40 px-6 py-12 text-center text-sm text-slate-500">
          {emptyLabel}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-ink-900/60">
                {columns.map((c) => (
                  <th key={c.key} className={`px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-slate-400 ${c.className ?? ""}`}>
                    {c.header}
                  </th>
                ))}
                {actions && <th className="px-4 py-3 text-right font-mono text-[11px] uppercase tracking-wider text-slate-400">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 text-slate-200 ${c.className ?? ""}`}>{c.render(row)}</td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {actions.map((a) => {
                          const Icon = icons[a.icon];
                          return (
                            <button
                              key={a.icon}
                              onClick={() => a.onClick(row)}
                              title={a.label}
                              className="grid size-7 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                            >
                              <Icon className="size-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${active ? "bg-rarity-uncommon/10 text-rarity-uncommon" : "bg-slate-500/10 text-slate-500"}`}>
      {active ? "Active" : "Disabled"}
    </span>
  );
}
