import { ShieldCheck } from "lucide-react";

export function ClosedEconomyNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-tactical/70" />
        Premium Coins are a closed platform currency. They cannot be withdrawn or
        exchanged for cash, gift cards, or crypto.
      </p>
    );
  }
  return (
    <div className="glass flex items-start gap-3 rounded-xl border-tactical/15 bg-tactical/[0.04] px-4 py-3">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-tactical" />
      <div>
        <p className="text-sm font-semibold text-slate-200">Closed platform economy</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
          Premium Coins stay inside the platform and cannot be withdrawn, exchanged for
          cash, gift cards, or crypto, or transferred outside the platform. There is no
          cashout and no gambling — only collecting, crafting, and trading.
        </p>
      </div>
    </div>
  );
}
