"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

export function AdminFormDrawer({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-ink-950/70 backdrop-blur"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-ink-900"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="font-display text-lg font-bold text-white">{title}</h3>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
            <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
              <button onClick={onClose} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
              <button onClick={onSubmit} className="btn-primary px-4 py-2 text-sm">{submitLabel}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
