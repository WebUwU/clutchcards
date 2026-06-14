"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navItems } from "./nav-items";
import { cn } from "@/lib/utils";
import { ShieldHalf } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/50 px-3 py-5 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
        <div className="grid size-9 place-items-center rounded-lg bg-ascend text-white shadow-glow">
          <span className="font-display text-lg font-bold">A</span>
        </div>
        <div className="leading-none">
          <div className="font-display text-base font-bold tracking-tight text-white">ASCENDANT</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Cards</div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-white" : "text-slate-400 hover:text-slate-100"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-ascend/10 ring-1 ring-ascend/20"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className={cn("relative size-4.5 transition-colors", active && "text-ascend")} />
              <span className="relative font-display tracking-wide">{label}</span>
              {active && <span className="absolute right-2 size-1.5 rounded-full bg-ascend shadow-glow" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 px-2 pt-4">
        <Link href="/admin" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300">
          <ShieldHalf className="size-3.5" /> Admin
        </Link>
        <p className="font-mono text-[10px] leading-relaxed text-slate-600">
          ASCENDANT CARDS · v2.0
          <br />
          Closed-economy demo build
        </p>
      </div>
    </aside>
  );
}
