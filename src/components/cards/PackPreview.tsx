"use client";

import { motion } from "framer-motion";
import { Package, Sparkles } from "lucide-react";
import { gradientFor } from "@/lib/utils";

export function PackPreview({
  name,
  tier,
  subtitle,
}: {
  name: string;
  tier: "basic" | "premium";
  subtitle?: string;
}) {
  const premium = tier === "premium";
  return (
    <motion.div
      whileHover={{ y: -6, rotate: premium ? -1 : 1 }}
      className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 p-4 shadow-card"
      style={{ background: gradientFor(name) }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent" />
      {premium && (
        <Sparkles className="absolute right-3 top-3 size-5 animate-pulse-glow text-rarity-legendary" />
      )}
      <div className="relative flex h-full flex-col justify-end">
        <Package className={`mb-2 size-8 ${premium ? "text-tactical" : "text-slate-300"}`} />
        <h4 className="font-display text-base font-bold text-white">{name}</h4>
        {subtitle && <p className="mt-0.5 text-xs text-slate-300">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
