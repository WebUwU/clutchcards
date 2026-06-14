"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "./AdminCardsSection";
import { JsonPreview } from "../JsonPreview";
import { ConfirmDialog } from "../ConfirmDialog";
import { exportLocalDbAsJson, importLocalDbFromJson, resetLocalDb, getStorageStatus } from "@/lib/localDb";
import { useToast } from "@/components/ui/Toast";
import { Download, Upload, RotateCcw, HardDrive } from "lucide-react";

export function AdminStorageSection({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [json, setJson] = useState("");
  const [status, setStatus] = useState({ available: false, keys: 0, bytes: 0 });
  const [confirmReset, setConfirmReset] = useState(false);

  const refresh = () => { setJson(exportLocalDbAsJson()); setStatus(getStorageStatus()); };
  useEffect(refresh, []);

  const download = () => {
    const blob = new Blob([exportLocalDbAsJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ascendant-cards-export-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast("Exported data", "success");
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importLocalDbFromJson(text);
    if (res.ok) { toast("Import successful", "success"); refresh(); onChanged(); }
    else toast(res.error ?? "Import failed", "error");
    if (fileRef.current) fileRef.current.value = "";
  };

  const doReset = () => {
    resetLocalDb();
    toast("Local data reset", "success");
    setConfirmReset(false); refresh(); onChanged();
  };

  return (
    <div className="max-w-2xl">
      <SectionHeader title="Storage / Import · Export" desc="Back up, restore or reset all locally stored data (user, collection, admin entities, economy)." />
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={download} className="btn-cyan px-4 py-2 text-sm"><Download className="size-4" /> Export JSON</button>
        <button onClick={() => fileRef.current?.click()} className="btn-ghost px-4 py-2 text-sm"><Upload className="size-4" /> Import JSON</button>
        <button onClick={() => setConfirmReset(true)} className="btn-primary px-4 py-2 text-sm"><RotateCcw className="size-4" /> Reset local DB</button>
        <input ref={fileRef} type="file" accept="application/json" onChange={onFile} className="hidden" />
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-ink-900/50 px-4 py-3 text-sm text-slate-400">
        <HardDrive className="size-4 text-slate-500" />
        {status.available
          ? <span>{status.keys} keys · ~{(status.bytes / 1024).toFixed(1)} KB stored in this browser.</span>
          : <span>Local storage is not available in this context.</span>}
      </div>
      <JsonPreview json={json} maxHeight={420} />
      <ConfirmDialog open={confirmReset} title="Reset local database" message="This permanently clears all locally stored data and restores the original seed content. This cannot be undone." confirmLabel="Reset everything" destructive onConfirm={doReset} onCancel={() => setConfirmReset(false)} />
    </div>
  );
}
