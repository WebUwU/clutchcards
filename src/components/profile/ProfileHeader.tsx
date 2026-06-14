import { Shield } from "lucide-react";
import type { User } from "@/types";
import { XPBar } from "@/components/ui/XPBar";

export function ProfileHeader({ user }: { user: User }) {
  return (
    <div className="panel relative overflow-hidden p-6">
      <div className="absolute inset-0 bg-grid-faint bg-[size:32px_32px] opacity-40" />
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-ascend/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative">
          <div className="size-24 rounded-2xl bg-gradient-to-br from-ascend/50 to-tactical/40 ring-2 ring-white/10 shadow-glow" />
          <div className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-xl bg-ink-900 ring-1 ring-white/10">
            <span className="font-display text-sm font-bold text-ascend">{user.level}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-white">{user.username}</h1>
            <span className="flex items-center gap-1 rounded-md bg-ascend/10 px-2 py-0.5 font-mono text-[11px] text-ascend ring-1 ring-ascend/20">
              <Shield className="size-3" /> {user.rank}
            </span>
          </div>
          <div className="mt-3 max-w-md">
            <XPBar level={user.level} xp={user.xp} />
          </div>
        </div>
      </div>
    </div>
  );
}
