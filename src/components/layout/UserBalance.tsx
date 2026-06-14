import { CoinDisplay } from "@/components/ui/CoinDisplay";

export function UserBalance({ free, premium }: { free: number; premium: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="glass flex items-center gap-1.5 rounded-lg px-3 py-1.5">
        <CoinDisplay type="free" amount={free} size="sm" />
      </div>
      <div className="glass flex items-center gap-1.5 rounded-lg px-3 py-1.5">
        <CoinDisplay type="premium" amount={premium} size="sm" />
      </div>
    </div>
  );
}
