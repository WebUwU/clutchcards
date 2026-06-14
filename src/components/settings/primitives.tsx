"use client";

import { ReactNode } from "react";

export function SettingsSection({ title, description, icon, children }: {
  title: string; description?: string; icon?: ReactNode; children: ReactNode;
}) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-start gap-3">
        {icon && <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-300">{icon}</div>}
        <div>
          <h2 className="font-display text-base font-bold text-white">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-400">{description}</p>}
        </div>
      </div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export function SettingsToggle({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]">
      <div className="min-w-0">
        <div className="text-sm text-slate-200">{label}</div>
        {description && <div className="text-xs text-slate-500">{description}</div>}
      </div>
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-tactical" : "bg-ink-600"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

export function SettingsSelect({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5">
      <span className="text-sm text-slate-200">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-ink-950 px-2.5 py-1.5 text-sm text-white outline-none focus:border-ascend/40">
        {options.map((o) => <option key={o.value} value={o.value} className="bg-ink-900">{o.label}</option>)}
      </select>
    </div>
  );
}

export function SettingsTextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5">
      <span className="shrink-0 text-sm text-slate-200">{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-44 rounded-lg border border-white/10 bg-ink-950 px-2.5 py-1.5 text-sm text-white outline-none focus:border-ascend/40 sm:w-56" />
    </div>
  );
}
