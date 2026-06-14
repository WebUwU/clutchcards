import { ShieldCheck } from "lucide-react";

export function PackSafetyNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-tactical/15 bg-tactical/[0.05] px-4 py-3 text-xs leading-relaxed text-tactical">
      <ShieldCheck className="mt-0.5 size-4 shrink-0" />
      <p>
        Pack openings are for digital collectibles only. Items cannot be withdrawn,
        exchanged for cash, gift cards, crypto, or transferred outside the platform.
      </p>
    </div>
  );
}
