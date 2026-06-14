"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useGameData } from "@/components/providers/GameDataProvider";

// Wrap page content that needs a logged-in user. Shows a friendly prompt
// when signed out instead of empty/zero data.
export function SignInGate({ children }: { children: React.ReactNode }) {
  const { status } = useGameData();
  if (status === "loading") {
    return (
      <div className="grid place-items-center py-24">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-ascend" />
      </div>
    );
  }
  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-ascend/15 text-ascend">
          <LogIn className="size-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-white">Sign in to continue</h2>
        <p className="mt-1 text-sm text-slate-400">This page needs an account so your progress can be saved.</p>
        <Link href="/login" className="btn-primary mt-5 inline-flex px-5 py-2.5">Sign in</Link>
      </div>
    );
  }
  return <>{children}</>;
}
