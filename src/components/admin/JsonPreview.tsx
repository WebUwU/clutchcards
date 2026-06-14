"use client";

export function JsonPreview({ json, maxHeight = 320 }: { json: string; maxHeight?: number }) {
  return (
    <pre
      className="overflow-auto rounded-xl border border-white/10 bg-ink-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300"
      style={{ maxHeight }}
    >
      {json}
    </pre>
  );
}
