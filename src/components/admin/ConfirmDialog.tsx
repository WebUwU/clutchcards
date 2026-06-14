"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/80 p-4 backdrop-blur"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-sm rounded-2xl p-5 shadow-card"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {destructive && <AlertTriangle className="size-5 text-ascend" />}
                <h3 className="font-display text-base font-bold text-white">{title}</h3>
              </div>
              <button onClick={onCancel} className="grid size-7 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onCancel} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
              <button
                onClick={onConfirm}
                className={destructive ? "btn-primary px-4 py-2 text-sm" : "btn-cyan px-4 py-2 text-sm"}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
