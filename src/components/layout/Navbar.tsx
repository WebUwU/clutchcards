"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Flame, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { navItems } from "./nav-items";
import { UserBalance } from "./UserBalance";
import { useGameData } from "@/components/providers/GameDataProvider";
import { cn, formatNumber } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { status, profile } = useGameData();
  const loggedIn = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-ascend text-white shadow-glow">
              <span className="font-display text-base font-bold">A</span>
            </div>
            <span className="font-display text-sm font-bold tracking-tight text-white">ASCENDANT</span>
          </Link>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {loggedIn && profile && (
            <div className="flex items-center gap-1.5 rounded-lg bg-ascend/10 px-3 py-1.5 ring-1 ring-ascend/20">
              <Flame className="size-4 text-ascend" />
              <span className="font-mono text-xs font-semibold text-slate-200">{profile.dailyStreak}-day streak</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {loggedIn && profile ? (
            <>
              <UserBalance free={profile.freeCoins} premium={profile.premiumCoins} />
              <div className="relative hidden sm:block">
                <button onClick={() => setMenuOpen((o) => !o)} className="block">
                  <div className="size-9 overflow-hidden rounded-full bg-gradient-to-br from-ascend/40 to-tactical/30 ring-2 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.avatar} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} className="size-full object-cover" />
                  </div>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-card"
                    >
                      <div className="border-b border-white/[0.06] px-3 py-2.5">
                        <div className="truncate text-sm font-semibold text-white">{profile.displayName || profile.username}</div>
                        <div className="truncate text-[11px] text-slate-500">@{profile.username}</div>
                      </div>
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                        <UserIcon className="size-4" /> Profile
                      </Link>
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-ascend-bright hover:bg-white/5">
                        <LogOut className="size-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link href="/login" className="btn-primary px-4 py-2 text-sm">
              <LogIn className="size-4" /> Sign in
            </Link>
          )}
          <button onClick={() => setOpen((o) => !o)} className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-200 lg:hidden" aria-label="Toggle menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/[0.06] lg:hidden">
            <div className="grid grid-cols-2 gap-1 p-3">
              {navItems.filter((i) => !i.auth || loggedIn).map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium", active ? "bg-ascend/10 text-white ring-1 ring-ascend/20" : "text-slate-400")}>
                    <Icon className={cn("size-4.5", active && "text-ascend")} />
                    <span className="font-display tracking-wide">{label}</span>
                  </Link>
                );
              })}
              {loggedIn ? (
                <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ascend-bright">
                  <LogOut className="size-4.5" /> Sign out
                </button>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ascend-bright">
                  <LogIn className="size-4.5" /> Sign in
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
