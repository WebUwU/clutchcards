"use client";

import { motion } from "framer-motion";
import { gradientFor } from "@/lib/utils";
import type { Pack } from "@/types";

// The animated pack object: idle float → shake → burst. `phase` drives it.
export function PackOpeningAnimation({
  pack, phase, eliteColor,
}: {
  pack: Pack;
  phase: "idle" | "shaking" | "burst";
  eliteColor: string;
}) {
  return (
    <div className="relative grid place-items-center py-6">
      {/* Glow halo */}
      <motion.div
        className="absolute size-48 rounded-full blur-3xl"
        style={{ background: eliteColor }}
        animate={{ opacity: phase === "burst" ? 0.7 : phase === "shaking" ? 0.4 : 0.2, scale: phase === "burst" ? 1.6 : 1 }}
        transition={{ duration: 0.5 }}
      />
      {/* Particles on burst */}
      {phase === "burst" &&
        Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              className="absolute size-1.5 rounded-full"
              style={{ background: eliteColor }}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: Math.cos(angle) * 140, y: Math.sin(angle) * 140, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          );
        })}
      {/* Pack art */}
      <motion.div
        className="relative z-10 h-56 w-40 overflow-hidden rounded-2xl border border-white/15 shadow-card"
        style={{ background: gradientFor(pack.id) }}
        animate={
          phase === "shaking"
            ? { rotate: [0, -4, 4, -4, 4, 0], y: [0, -2, 2, -2, 0] }
            : phase === "burst"
            ? { scale: [1, 1.1, 0], opacity: [1, 1, 0] }
            : { y: [0, -8, 0] }
        }
        transition={
          phase === "shaking"
            ? { duration: 0.5, repeat: Infinity }
            : phase === "burst"
            ? { duration: 0.6 }
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pack.image}
          alt={pack.name}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          className="size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-3">
          <div className="font-display text-sm font-bold text-white">{pack.name}</div>
        </div>
      </motion.div>
    </div>
  );
}
