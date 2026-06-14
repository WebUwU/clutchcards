"use client";

import type { ThemeName } from "@/types";
import { Check } from "lucide-react";

const THEMES: { id: ThemeName; label: string; swatch: string[] }[] = [
  { id: "dark", label: "Dark", swatch: ["#0a0b0f", "#3ea6ff"] },
  { id: "dark-red", label: "Dark Red", swatch: ["#0a0b0f", "#ff4655"] },
  { id: "neon", label: "Neon", swatch: ["#0a0b0f", "#1ce5d4"] },
  { id: "minimal", label: "Minimal", swatch: ["#14171f", "#9aa4b2"] },
];

export function ThemePicker({ value, onChange }: { value: ThemeName; onChange: (v: ThemeName) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 px-3 py-2 sm:grid-cols-4">
      {THEMES.map((t) => {
        const active = value === t.id;
        return (
          <button key={t.id} type="button" onClick={() => onChange(t.id)}
            className={`relative overflow-hidden rounded-xl border p-3 text-left transition-colors ${active ? "border-ascend" : "border-white/10 hover:border-white/25"}`}>
            <div className="mb-2 flex gap-1">
              {t.swatch.map((c) => <span key={c} className="size-4 rounded-full" style={{ background: c }} />)}
            </div>
            <div className="text-xs font-medium text-slate-200">{t.label}</div>
            {active && <Check className="absolute right-2 top-2 size-4 text-ascend" />}
          </button>
        );
      })}
    </div>
  );
}
