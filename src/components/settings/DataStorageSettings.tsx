"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, RotateCcw, HardDrive, Info } from "lucide-react";
import { exportLocalDbAsJson, importLocalDbFromJson, resetLocalDb, getStorageStatus } from "@/lib/localDb";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function DataStorageSettings({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState({ available: false, keys: 0, bytes: 0 });
  const [confirmReset, setConfirmReset] = useState(false);

  const refresh = () => setStatus(getStorageStatus());
  useEffect(refresh, []);

  const download = () => {
    const blob = new Blob([exportLocalDbAsJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ascendant-cards-export-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast("Data exported", "success");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = importLocalDbFromJson(await file.text());
    if (res.ok) { toast("Import successful", "success"); refresh(); onChanged(); }
    else toast(res.error ?? "Import failed", "error");
    if (fileRef.current) fileRef.current.value = "";
  };

  const doReset = () => {
    resetLocalDb(); toast("Local data reset", "success");
    setConfirmReset(false); refresh(); onChanged();
  };

  return (
    <div className="space-y-3 px-3 py-2">
      <div className="flex flex-wrap gap-2">
        <button onClick={download} className="btn-cyan px-4 py-2 text-sm"><Download className="size-4" /> Export data</button>
        <button onClick={() => fileRef.current?.click()} className="btn-ghost px-4 py-2 text-sm"><Upload className="size-4" /> Import data</button>
        <button onClick={() => setConfirmReset(true)} className="btn-primary px-4 py-2 text-sm"><RotateCcw className="size-4" /> Reset local data</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={onFile} className="hidden" />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-ink-900/50 px-3 py-2.5 text-sm text-slate-400">
        <HardDrive className="size-4 text-slate-500" />
        {status.available ? <span>{status.keys} keys · ~{(status.bytes / 1024).toFixed(1)} KB stored locally.</span> : <span>Local storage unavailable.</span>}
      </div>
      <div className="flex items-start gap-2 rounded-xl border border-rarity-legendary/15 bg-rarity-legendary/[0.05] px-3 py-2.5 text-xs leading-relaxed text-rarity-legendary">
        <Info className="mt-0.5 size-4 shrink-0" />
        Your data is currently stored locally in this browser. If you clear browser data, progress may be lost.
      </div>
      <ConfirmDialog open={confirmReset} title="Reset local data" message="This permanently clears all locally stored data and restores the original seed content. This cannot be undone." confirmLabel="Reset" destructive onConfirm={doReset} onCancel={() => setConfirmReset(false)} />
    </div>
  );
}
