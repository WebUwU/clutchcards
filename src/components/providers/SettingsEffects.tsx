"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/apiClient";

// Applies user appearance settings globally by setting data-attributes on
// <html>. CSS in globals.css reacts to these. Purely cosmetic — no economy.
export function SettingsEffects() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    api.getSettings().then((s: any) => {
      if (cancelled || !s) return;
      const a = s.appearance ?? {};
      const root = document.documentElement;
      if (a.theme) root.setAttribute("data-theme", a.theme);
      root.setAttribute("data-reduce-motion", a.reduceMotion ? "true" : "false");
      root.setAttribute("data-density", a.gridDensity ?? "comfortable");
      root.setAttribute("data-rarity-glow", a.showRarityGlow === false ? "false" : "true");
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [status]);

  return null;
}
