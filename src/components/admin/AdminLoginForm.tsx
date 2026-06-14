"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, ShieldAlert } from "lucide-react";
import { loginAdmin } from "@/lib/adminAuth";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const res = loginAdmin(username.trim(), password);
    if (!res.ok) {
      setError(res.error ?? "Login failed.");
      return;
    }
    router.push("/admin");
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-ascend text-white shadow-glow">
            <Lock className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-slate-400">Ascendant Cards — local control panel</p>
        </div>

        <div className="panel space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Username</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 focus-within:border-ascend/50">
              <User className="size-4 text-slate-500" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full bg-transparent text-sm text-white outline-none"
                placeholder="Username"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-slate-400">Password</span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 focus-within:border-ascend/50">
              <Lock className="size-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full bg-transparent text-sm text-white outline-none"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-ascend/10 px-3 py-2.5 text-xs text-ascend-bright ring-1 ring-ascend/20">
              <ShieldAlert className="size-4 shrink-0" /> {error}
            </div>
          )}

          <button onClick={submit} className="btn-primary w-full">Sign in</button>
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-500">
          Local demo login only — not production secure. Add server-side auth,
          hashed passwords and role checks before deployment.
        </p>
      </motion.div>
    </div>
  );
}
