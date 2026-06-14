"use client";

import { Check } from "lucide-react";

// Avatars are rendered from a remote avatar service so they always display
// (no local image files required). The stored value is the full URL.
const SEEDS = ["clutch", "vortex", "echo", "nova", "raze", "cipher", "omen", "sage", "jett", "viper", "phoenix", "reyna"];
const avatarUrl = (seed: string) => `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}`;

export function AvatarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3 px-3 py-2">
      {SEEDS.map((seed) => {
        const url = avatarUrl(seed);
        const active = value === url;
        return (
          <button key={seed} type="button" onClick={() => onChange(url)}
            className={`relative size-14 overflow-hidden rounded-xl border-2 bg-ink-800 transition-colors ${active ? "border-ascend" : "border-white/10 hover:border-white/25"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={seed} className="size-full object-cover" />
            {active && <span className="absolute inset-0 grid place-items-center bg-ascend/40"><Check className="size-5 text-white" /></span>}
          </button>
        );
      })}
    </div>
  );
}
