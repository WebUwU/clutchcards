"use client";

import type { Pack } from "@/types";
import { PackCard } from "./PackCard";

export function PackGrid({ packs, onOpen, onDetails }: { packs: Pack[]; onOpen: (p: Pack) => void; onDetails: (p: Pack) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {packs.map((p) => (
        <PackCard key={p.id} pack={p} onOpen={onOpen} onDetails={onDetails} />
      ))}
    </div>
  );
}
