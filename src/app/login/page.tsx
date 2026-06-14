"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, ShieldAlert, Gamepad2 } from "lucide-react";

const REGIONS = [
  { value: "eu", label: "Europe" }, { value: "na", label: "North America" },
  { value: "ap", label: "Asia Pacific" }, { value: "kr", label: "Korea" },
  { value: "latam", label: "LATAM" }, { value: "br", label: "Brazil" },
];

function AuthInner() {
  const params = useSearchParams();
  const rawNext = params.get("next") ?? params.get("callbackUrl") ?? "/dashboard";
  // Never bounce a normal user into an admin URL after login.
  let safeNext = rawNext;
  try { const u = new URL(rawNext, "http://x"); safeNext = u.pathname + u.search; } catch { safeNext = "/dashboard"; }
  const next = safeNext.startsWith("/admin") ? "/dashboard" : safeNext;
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [riotName, setRiotName] = useState("");
  const [riotTag, setRiotTag] = useState("");
  const [region, setRegion] = useState("eu");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signin = async () => {
    setError(null); setBusy(true);
    const res = await signIn("user-credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) setError("Wrong email or password.");
    else window.location.href = next;
  };

  const register = async () => {
    setError(null); setBusy(true);
    try {
      const r = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, riotName, riotTag, region }),
      });
      const json = await r.json();
      if (!r.ok || json.ok === false) throw new Error(json.error ?? "Registration failed");
      // Auto sign-in after register.
      const res = await signIn("user-credentials", { email, password, redirect: false });
      if (res?.error) { setMode("signin"); setError("Account created — please sign in."); }
      else window.location.href = next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally { setBusy(false); }
  };

  const field = "w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-white outline-none focus:border-ascend/50 placeholder:text-slate-600";

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-ascend text-white shadow-glow">
            <span className="font-display text-xl font-bold">C</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">ClutchCards</h1>
          <p className="mt-1 text-sm text-slate-400">{mode === "signin" ? "Welcome back" : "Create your account"}</p>
        </div>

        {/* Tab switch */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.06] bg-ink-900/60 p-1">
          <button onClick={() => { setMode("signin"); setError(null); }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "signin" ? "bg-ascend text-white" : "text-slate-400"}`}>
            <LogIn className="mr-1 inline size-4" /> Sign in
          </button>
          <button onClick={() => { setMode("register"); setError(null); }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "register" ? "bg-ascend text-white" : "text-slate-400"}`}>
            <UserPlus className="mr-1 inline size-4" /> Register
          </button>
        </div>

        <div className="panel space-y-3 p-5">
          {mode === "register" && (
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className={field} autoComplete="username" />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className={field} autoComplete="email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className={field}
            onKeyDown={(e) => e.key === "Enter" && (mode === "signin" ? signin() : register())} autoComplete={mode === "signin" ? "current-password" : "new-password"} />

          {mode === "register" && (
            <div className="rounded-xl border border-white/[0.06] bg-ink-900/40 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Gamepad2 className="size-3.5" /> Valorant (optional)
              </div>
              <div className="flex gap-2">
                <input value={riotName} onChange={(e) => setRiotName(e.target.value)} placeholder="Riot name" className={field} />
                <input value={riotTag} onChange={(e) => setRiotTag(e.target.value.replace("#", ""))} placeholder="TAG" className="w-20 rounded-xl border border-white/10 bg-ink-950 px-2 py-2.5 text-sm text-white outline-none focus:border-ascend/50" />
              </div>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className={`${field} mt-2`}>
                {REGIONS.map((r) => <option key={r.value} value={r.value} className="bg-ink-900">{r.label}</option>)}
              </select>
              <p className="mt-1.5 text-[11px] text-slate-500">Format: Name#TAG. You can also link this later in Settings.</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-ascend/10 px-3 py-2.5 text-xs text-ascend-bright ring-1 ring-ascend/20">
              <ShieldAlert className="size-4 shrink-0" /> {error}
            </div>
          )}

          <button onClick={mode === "signin" ? signin : register} disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><AuthInner /></Suspense>;
}
