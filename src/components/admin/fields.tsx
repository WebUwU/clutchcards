"use client";

import { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white outline-none focus:border-ascend/50 placeholder:text-slate-600";

export function TextInput({
  value, onChange, placeholder, type = "text",
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)} className={inputCls} />
  );
}

export function NumberInput({
  value, onChange, min, step,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <input type="number" value={value} min={min} step={step}
      onChange={(e) => onChange(Number(e.target.value))} className={inputCls} />
  );
}

export function TextArea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea value={value} placeholder={placeholder} rows={3}
      onChange={(e) => onChange(e.target.value)} className={inputCls + " resize-y"} />
  );
}

export function Select({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-ink-900">{o.label}</option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="mb-3 flex w-full items-center justify-between rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-tactical" : "bg-ink-600"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
