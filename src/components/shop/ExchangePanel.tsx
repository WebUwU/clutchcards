"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Coins, Gem, Lock } from "lucide-react";
import { resolveEconomyConfig } from "@/lib/registry";
import { premiumCoinsToFreeCoins } from "@/lib/economy";

export function ExchangePanel({ premiumCoins, onExchange }: {
  premiumCoins: number;
  onExchange: (premiumSpent: number) => void;
}) {
  const cfg = useMemo(() => resolveEconomyConfig(), []);
  const [amount, setAmount] = useState(100);
  const free = premiumCoinsToFreeCoins(amount, cfg.premiumToFreeRate);
  const valid = amount > 0 && amount <= premiumCoins;

  return (
    <div className="panel p-5">
      <h3 className="font-display text-base font-bold text-white">Convert Premium → Free</h3>
      <p className="mt-0.5 text-sm text-slate-400">Rate: 1 Premium Coin = {cfg.premiumToFreeRate} Free Coins. One direction only.</p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 focus-within:border-rarity-legendary/50">
          <Gem className="size-4 text-rarity-legendary" />
          <input type="number" min={1} max={premiumCoins} value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            className="w-full bg-transparent font-mono text-sm text-white outline-none" />
        </div>
        <ArrowRight className="size-5 shrink-0 text-slate-500" />
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5">
          <Coins className="size-4 text-tactical" />
          <span className="font-mono text-sm text-tactical">{free}</span>
        </div>
      </div>

      <button onClick={() => valid && onExchange(amount)} disabled={!valid}
        className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">
        {valid ? `Convert ${amount} Premium Coins` : "Not enough Premium Coins"}
      </button>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink-900/60 px-3 py-2 text-[11px] text-slate-500">
        <Lock className="size-3.5 shrink-0" /> Free Coins cannot be converted back to Premium Coins.
      </div>
    </div>
  );
}
