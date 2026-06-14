"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Lock, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const login = async () => {
    setError(null); setBusy(true);
    const res = await signIn("admin-credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) setError("Invalid admin credentials.");
    else window.location.href = "/admin";
  };

  const field = "w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white outline-none focus:border-ascend/50 placeholder:text-slate-600";

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-ascend text-white shadow-glow">
            <Lock className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-400">Secure server-side authentication</p>
        </div>
        <div className="panel space-y-3 p-5">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" type="email" className={field} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className={field}
            onKeyDown={(e) => e.key === "Enter" && login()} />
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-ascend/10 px-3 py-2.5 text-xs text-ascend-bright ring-1 ring-ascend/20">
              <ShieldAlert className="size-4" /> {error}
            </div>
          )}
          <button onClick={login} disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? "…" : "Sign in"}</button>
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-500">Admin access is restricted to accounts with the admin role.</p>
      </div>
    </div>
  );
}
