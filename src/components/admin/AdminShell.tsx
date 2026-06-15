"use client";

import { useState } from "react";
import { AdminTabKey } from "./admin-tabs";
import { AdminSidebar, AdminMobileTabs } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminOverviewSection } from "./sections/AdminOverviewSection";
import { AdminCardsSection } from "./sections/AdminCardsSection";
import { AdminSetsSection } from "./sections/AdminSetsSection";
import { AdminPacksSection } from "./sections/AdminPacksSection";
import { AdminRaritiesSection } from "./sections/AdminRaritiesSection";
import { AdminTypesSection } from "./sections/AdminTypesSection";
import { AdminQuestsSection } from "./sections/AdminQuestsSection";
import { AdminShopSection } from "./sections/AdminShopSection";
import { AdminMarketSection } from "./sections/AdminMarketSection";
import { AdminEconomySection } from "./sections/AdminEconomySection";
import { AdminUsersSection } from "./sections/AdminUsersSection";
import { AdminSettingsSection } from "./sections/AdminSettingsSection";

export function AdminShell() {
  const [tab, setTab] = useState<AdminTabKey>("overview");
  // Bump to force sections to re-resolve after cross-section changes.
  const [, setRev] = useState(0);
  const onChanged = () => setRev((r) => r + 1);

  return (
    <div className="min-h-screen bg-ink-950">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar active={tab} onSelect={setTab} />
        <main className="min-w-0 flex-1">
          <AdminMobileTabs active={tab} onSelect={setTab} />
          <div className="p-4 lg:p-8">
            {tab === "overview" && <AdminOverviewSection go={setTab} />}
            {tab === "cards" && <AdminCardsSection onChanged={onChanged} />}
            {tab === "sets" && <AdminSetsSection onChanged={onChanged} />}
            {tab === "packs" && <AdminPacksSection onChanged={onChanged} />}
            {tab === "rarities" && <AdminRaritiesSection onChanged={onChanged} />}
            {tab === "types" && <AdminTypesSection onChanged={onChanged} />}
            {tab === "quests" && <AdminQuestsSection onChanged={onChanged} />}
            {tab === "shop" && <AdminShopSection onChanged={onChanged} />}
            {tab === "market" && <AdminMarketSection onChanged={onChanged} />}
            {tab === "economy" && <AdminEconomySection />}
            {tab === "users" && <AdminUsersSection />}
            {tab === "settings" && <AdminSettingsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
