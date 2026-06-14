import { ShieldCheck } from "lucide-react";

export function PurchaseSafetyNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-tactical/15 bg-tactical/[0.05] px-4 py-3 text-xs leading-relaxed text-tactical">
      <ShieldCheck className="mt-0.5 size-4 shrink-0" />
      <p>
        Premium Coins can be converted one-way into Free Coins. Free Coins can never be converted
        back to Premium Coins, and nothing can be cashed out or exchanged for real money, gift
        cards or crypto. Boosters only affect XP and collection progression.
      </p>
    </div>
  );
}
