import { Lock } from "lucide-react";

export function MarketSafetyNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-rarity-legendary/15 bg-rarity-legendary/[0.05] px-4 py-3 text-xs leading-relaxed text-rarity-legendary">
      <Lock className="mt-0.5 size-4 shrink-0" />
      <p>
        Premium Coins stay inside the platform. Sellers receive Premium Coins, but these can
        never be withdrawn, cashed out, or exchanged for real money, gift cards or crypto.
        There is no withdrawal here by design.
      </p>
    </div>
  );
}
