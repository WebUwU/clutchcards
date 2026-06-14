"use client";

import { motion } from "framer-motion";
import { Check, Gift, Zap, Package } from "lucide-react";
import type { Quest } from "@/types";
import { ProgressBar } from "@/components/ui/XPBar";
import { CoinDisplay } from "@/components/ui/CoinDisplay";
import { cn, formatNumber } from "@/lib/utils";

const difficultyStyle: Record<Quest["difficulty"], string> = {
  easy: "text-rarity-uncommon bg-rarity-uncommon/10",
  medium: "text-rarity-legendary bg-rarity-legendary/10",
  hard: "text-ascend bg-ascend/10",
};

export function QuestCard({ quest, onClaim }: { quest: Quest; onClaim: (q: Quest) => void }) {
  const pct = Math.round((quest.progress / quest.goal) * 100);
  const completed = quest.status === "completed";
  const claimed = quest.status === "claimed";
  const accent = completed ? "#1ce5d4" : claimed ? "#46d17a" : "#ff4655";

  return (
    <motion.div
      layout
      className={cn(
        "card-surface flex flex-col gap-3 p-4 pl-5 transition-opacity",
        claimed && "opacity-60"
      )}
      style={{ ["--rc" as string]: accent }}
    >
      {/* mission accent rail */}
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider", difficultyStyle[quest.difficulty])}>
              {quest.difficulty}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">MSN-{quest.id.slice(-4)}</span>
          </div>
          <h3 className="truncate font-display text-sm font-bold text-white">{quest.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{quest.description}</p>
        </div>
        {completed && <span className="chip shrink-0 bg-tactical/10 text-tactical ring-1 ring-tactical/30">READY</span>}
      </div>

      <div>
        <div className="mb-1 flex justify-between font-mono text-[11px] text-slate-400">
          <span>{quest.progress} / {quest.goal}</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar value={quest.progress} goal={quest.goal} accent={completed || claimed ? "#46d17a" : "#ff4655"} />
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-mono text-rarity-rare">
            <Zap className="size-3.5" /> {formatNumber(quest.reward.xp)}
          </span>
          <CoinDisplay type="free" amount={quest.reward.freeCoins} size="sm" />
          {quest.reward.pack && (
            <span className="flex items-center gap-1 font-mono text-tactical">
              <Package className="size-3.5" /> {quest.reward.pack}
            </span>
          )}
        </div>

        {claimed ? (
          <span className="flex items-center gap-1 font-mono text-xs text-rarity-uncommon">
            <Check className="size-4" /> Claimed
          </span>
        ) : completed ? (
          <button onClick={() => onClaim(quest)} className="btn-cyan px-3 py-1.5 text-xs">
            <Gift className="size-3.5" /> Claim
          </button>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
            {quest.status === "active" ? "In progress" : "Not started"}
          </span>
        )}
      </div>
    </motion.div>
  );
}
