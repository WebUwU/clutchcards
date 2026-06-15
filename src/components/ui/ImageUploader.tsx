"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// Reusable drag & drop image uploader. Uploads to /api/upload (ImgBB) and
// returns the permanent URL via onUploaded.
export function ImageUploader({
  value,
  onUploaded,
  label = "Upload image",
  shape = "square",
}: {
  value?: string;
  onUploaded: (url: string) => void;
  label?: string;
  shape?: "square" | "circle" | "wide";
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast("Please choose an image file.", "error"); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) throw new Error(json.error ?? "Upload failed");
      onUploaded(json.data.url);
      toast("Image uploaded!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally { setBusy(false); }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  const aspect = shape === "wide" ? "aspect-[3/2]" : "aspect-square";
  const sizeClass = shape === "wide" ? "w-full" : "size-28";

  return (
    <div className="flex items-start gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`group relative ${sizeClass} ${aspect} ${radius} cursor-pointer overflow-hidden border-2 border-dashed transition-colors ${
          drag ? "border-ascend bg-ascend/10" : "border-white/15 bg-ink-900/60 hover:border-white/30"
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 grid place-items-center bg-ink-950/0 opacity-0 transition-opacity group-hover:bg-ink-950/60 group-hover:opacity-100">
              <Upload className="size-5 text-white" />
            </div>
          </>
        ) : (
          <div className="grid size-full place-items-center text-slate-500">
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImageIcon className="size-6" />}
          </div>
        )}
        {busy && value && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/60"><Loader2 className="size-5 animate-spin text-white" /></div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">
          <Upload className="size-3.5" /> {busy ? "Uploading…" : label}
        </button>
        {value && (
          <button type="button" onClick={() => onUploaded("")} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-ascend-bright">
            <X className="size-3" /> Remove
          </button>
        )}
        <p className="text-[10px] text-slate-600">Drag & drop or click · max 8MB</p>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
    </div>
  );
}
