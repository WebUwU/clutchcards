"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LogIn, ShieldAlert } from "lucide-react";

function LoginInner() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const adminLogin = async () => {
    const res = await signIn("admin-credentials", { email, password, redirect: false });
    if (res?.error) setError("Invalid admin credentials.");
    else window.location.href = next;
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-ascend text-white shadow-glow">
            <LogIn className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-slate-400">Ascendant Cards</p>
        </div>

        <button onClick={() => signIn("discord", { callbackUrl: next })}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 font-display text-sm font-semibold text-white hover:opacity-90">
          Continue with Discord
        </button>

        <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-slate-600">
          <span className="h-px flex-1 bg-white/10" /> Admin <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="panel space-y-3 p-5">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@ascendant.local"
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white outline-none focus:border-ascend/50" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            onKeyDown={(e) => e.key === "Enter" && adminLogin()}
            className="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white outline-none focus:border-ascend/50" />
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-ascend/10 px-3 py-2 text-xs text-ascend-bright ring-1 ring-ascend/20">
              <ShieldAlert className="size-4" /> {error}
            </div>
          )}
          <button onClick={adminLogin} className="btn-primary w-full">Sign in as admin</button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>;
}
