"use client";

import Link from "next/link";
import { ADMIN_TABS, AdminTabKey } from "./admin-tabs";
import { cn } from "@/lib/utils";

export function AdminSidebar({
  active,
  onSelect,
}: {
  active: AdminTabKey;
  onSelect: (key: AdminTabKey) => void;
}) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/[0.06] bg-ink-900/50 p-3 lg:block">
      <Link href="/admin" className="mb-6 flex items-center gap-2 px-2 pt-2">
        <div className="grid size-8 place-items-center rounded-lg bg-ascend text-white shadow-glow">
          <span className="font-display text-base font-bold">A</span>
        </div>
        <div className="font-display text-sm font-bold text-white">Admin</div>
      </Link>
      <nav className="flex flex-col gap-0.5">
        {ADMIN_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
              active === key
                ? "bg-ascend/10 text-white ring-1 ring-ascend/20"
                : "text-slate-400 hover:text-white hover:bg-white/5",
            )}
          >
            <Icon className={cn("size-4", active === key && "text-ascend")} />
            <span className="font-display tracking-wide">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function AdminMobileTabs({
  active,
  onSelect,
}: {
  active: AdminTabKey;
  onSelect: (key: AdminTabKey) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-white/[0.06] px-3 py-2 lg:hidden">
      {ADMIN_TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors",
            active === key ? "bg-ascend/15 text-ascend ring-1 ring-ascend/30" : "bg-ink-800/60 text-slate-400",
          )}
        >
          <Icon className="size-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}
