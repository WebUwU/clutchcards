import { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-ink-900/40 px-6 py-16 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-ink-700/60 text-slate-400">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>}
    </div>
  );
}
