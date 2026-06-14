"use client";

import { motion } from "framer-motion";
import { getXpForNextLevel, calculateLevelProgress } from "@/lib/economy";
import { formatNumber } from "@/lib/utils";

export function XPBar({
  level,
  xp,
  showLabels = true,
}: {
  level: number;
  xp: number;
  showLabels?: boolean;
}) {
  const needed = getXpForNextLevel(level);
  const progress = calculateLevelProgress(xp, level);
  return (
    <div className="w-full">
      {showLabels && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400">LVL {level}</span>
          <span className="font-mono text-slate-500">
            {formatNumber(xp)} / {formatNumber(needed)} XP
          </span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-700">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-ascend-deep via-ascend to-ascend-bright"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function ProgressBar({ value, goal, accent = "#ff4655" }: { value: number; goal: number; accent?: string }) {
  const pct = Math.min(100, (value / goal) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <motion.div
        className="h-full rounded-full"
        style={{ background: accent }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
