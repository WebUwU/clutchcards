"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Flame } from "lucide-react";
import { navItems } from "./nav-items";
import { UserBalance } from "./UserBalance";
import { currentUser } from "@/data/user";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
          <div className="flex items-center gap-1.5 rounded-lg bg-ascend/10 px-3 py-1.5 ring-1 ring-ascend/20">
            <Flame className="size-4 text-ascend" />
            <span className="font-mono text-xs font-semibold text-slate-200">
              {currentUser.dailyStreak}-day streak
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <UserBalance free={currentUser.freeCoins} premium={currentUser.premiumCoins} />
          <Link href="/profile" className="hidden sm:block">
            <div className="size-9 rounded-full bg-gradient-to-br from-ascend/40 to-tactical/30 ring-2 ring-white/10" />
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-200 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/[0.06] lg:hidden"
          >
            <div className="grid grid-cols-2 gap-1 p-3">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active ? "bg-ascend/10 text-white ring-1 ring-ascend/20" : "text-slate-400"
                    )}
                  >
                    <Icon className={cn("size-4.5", active && "text-ascend")} />
                    <span className="font-display tracking-wide">{label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
