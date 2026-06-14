import { Lock, Check, Gift } from "lucide-react";
import type { BattlepassReward as BPReward } from "@/types";
import { cn } from "@/lib/utils";

export function BattlepassRewardCard({ reward, onClaim }: { reward: BPReward; onClaim: (r: BPReward) => void }) {
  const locked = !reward.unlocked;
  return (
    <div
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors",
        reward.track === "premium" ? "bg-tactical/[0.04] border-tactical/15" : "bg-ink-800/60 border-white/[0.06]",
        locked && "opacity-50"
      )}
    >
      {locked ? (
        <Lock className="size-5 text-slate-500" />
      ) : reward.claimed ? (
        <Check className="size-5 text-rarity-uncommon" />
      ) : (
        <Gift className={cn("size-5", reward.track === "premium" ? "text-tactical" : "text-rarity-legendary")} />
      )}
      <span className="line-clamp-2 text-[11px] font-medium leading-tight text-slate-300">{reward.label}</span>
      {reward.unlocked && !reward.claimed && (
        <button onClick={() => onClaim(reward)} className="mt-1 rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white hover:bg-white/10">
          Claim
        </button>
      )}
    </div>
  );
}
