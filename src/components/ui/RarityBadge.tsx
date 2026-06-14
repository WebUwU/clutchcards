import { rarityColor, rarityLabel } from "@/lib/utils";

export function RarityBadge({ rarity, className = "" }: { rarity: string; className?: string }) {
  const color = rarityColor[rarity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${className}`}
      style={{ color, backgroundColor: `${color}1a`, boxShadow: `inset 0 0 0 1px ${color}33` }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {rarityLabel[rarity]}
    </span>
  );
}
