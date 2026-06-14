"use client";

import { gradientFor } from "@/lib/utils";
import { Check } from "lucide-react";

const AVATARS = [
  "/images/avatars/avatar-001.png",
  "/images/avatars/avatar-002.png",
  "/images/avatars/avatar-003.png",
  "/images/avatars/avatar-004.png",
  "/images/avatars/avatar-005.png",
  "/images/avatars/avatar-006.png",
];

export function AvatarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3 px-3 py-2">
      {AVATARS.map((src) => {
        const active = value === src;
        return (
          <button key={src} type="button" onClick={() => onChange(src)}
            className={`relative size-14 overflow-hidden rounded-xl border-2 transition-colors ${active ? "border-ascend" : "border-white/10 hover:border-white/25"}`}
            style={{ background: gradientFor(src) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="avatar" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} className="size-full object-cover" />
            {active && <span className="absolute inset-0 grid place-items-center bg-ascend/30"><Check className="size-5 text-white" /></span>}
          </button>
        );
      })}
    </div>
  );
}
