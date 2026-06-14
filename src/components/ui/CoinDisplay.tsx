import { Coins, Gem } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function CoinDisplay({
  type,
  amount,
  size = "md",
}: {
  type: "free" | "premium";
  amount: number;
  size?: "sm" | "md";
}) {
  const isPremium = type === "premium";
  const text = size === "sm" ? "text-xs" : "text-sm";
  const icon = size === "sm" ? "size-3.5" : "size-4";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold ${text} ${
        isPremium ? "text-rarity-legendary" : "text-tactical"
      }`}
      title={isPremium ? "Premium Coins" : "Free Coins"}
    >
      {isPremium ? <Gem className={icon} /> : <Coins className={icon} />}
      {formatNumber(amount)}
    </span>
  );
}
