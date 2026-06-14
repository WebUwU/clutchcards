"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsSection, SettingsToggle, SettingsSelect, SettingsTextField } from "@/components/settings/primitives";
import { AvatarPicker } from "@/components/settings/AvatarPicker";
import { ThemePicker } from "@/components/settings/ThemePicker";
import { DataStorageSettings } from "@/components/settings/DataStorageSettings";
import { useLocalDb } from "@/hooks/useLocalDb";
import { useToast } from "@/components/ui/Toast";
import type {
  PrivacySettings, NotificationSettings, AppearanceSettings, SafetySettings, ThemeName, GridDensity, CardRole,
} from "@/types";
import {
  User as UserIcon, Shield, Bell, Palette, Lock, Database, ShieldCheck,
} from "lucide-react";

const ROLES: CardRole[] = ["duelist", "controller", "sentinel", "initiator", "neutral"];

export default function SettingsPage() {
  const toast = useToast();
  const { loading, user, settings, updateUser, updateSettings, refresh } = useLocalDb();
  const [, setRev] = useState(0);

  if (loading || !user || !settings) {
    return (
      <AppShell>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-ink-800/60" />)}
        </div>
      </AppShell>
    );
  }

  const setPrivacy = (patch: Partial<PrivacySettings>) =>
    updateSettings({ privacy: { ...settings.privacy, ...patch } });
  const setNotif = (patch: Partial<NotificationSettings>) =>
    updateSettings({ notifications: { ...settings.notifications, ...patch } });
  const setAppear = (patch: Partial<AppearanceSettings>) =>
    updateSettings({ appearance: { ...settings.appearance, ...patch } });
  const setSafety = (patch: Partial<SafetySettings>) =>
    updateSettings({ safety: { ...settings.safety, ...patch } });

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Personalize your profile, privacy and appearance. Everything saves locally.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsSection title="Profile" icon={<UserIcon className="size-4" />} description="How you appear across the app.">
          <SettingsTextField label="Username" value={user.username} onChange={(v) => updateUser({ username: v })} />
          <SettingsTextField label="Display name" value={user.displayName} onChange={(v) => updateUser({ displayName: v })} />
          <SettingsTextField label="Bio" value={user.bio} onChange={(v) => updateUser({ bio: v })} placeholder="A short tagline" />
          <SettingsSelect label="Favorite role" value={user.favoriteRole} onChange={(v) => updateUser({ favoriteRole: v as CardRole })} options={ROLES.map((r) => ({ value: r, label: r }))} />
          <SettingsTextField label="Favorite category" value={user.favoriteCategory} onChange={(v) => updateUser({ favoriteCategory: v })} />
          <SettingsTextField label="Region" value={user.region} onChange={(v) => updateUser({ region: v })} />
          <SettingsTextField label="Language" value={user.language} onChange={(v) => updateUser({ language: v })} />
          <SettingsTextField label="Timezone" value={user.timezone} onChange={(v) => updateUser({ timezone: v })} />
          <div className="pt-1">
            <div className="px-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Avatar</div>
            <AvatarPicker value={user.avatar} onChange={(v) => updateUser({ avatar: v })} />
          </div>
        </SettingsSection>

        <div className="space-y-5">
          <SettingsSection title="Privacy" icon={<Shield className="size-4" />}>
            <SettingsToggle label="Public profile" checked={settings.privacy.profilePublic} onChange={(v) => setPrivacy({ profilePublic: v })} />
            <SettingsToggle label="Public collection" checked={settings.privacy.collectionPublic} onChange={(v) => setPrivacy({ collectionPublic: v })} />
            <SettingsToggle label="Show market stats" checked={settings.privacy.showMarketStats} onChange={(v) => setPrivacy({ showMarketStats: v })} />
            <SettingsToggle label="Show online status" checked={settings.privacy.showOnlineStatus} onChange={(v) => setPrivacy({ showOnlineStatus: v })} />
          </SettingsSection>

          <SettingsSection title="Notifications" icon={<Bell className="size-4" />}>
            <SettingsToggle label="Quest reminders" checked={settings.notifications.questReminder} onChange={(v) => setNotif({ questReminder: v })} />
            <SettingsToggle label="Market sale notifications" checked={settings.notifications.marketSale} onChange={(v) => setNotif({ marketSale: v })} />
            <SettingsToggle label="Pack reward notifications" checked={settings.notifications.packReward} onChange={(v) => setNotif({ packReward: v })} />
            <SettingsToggle label="Weekly summary" checked={settings.notifications.weeklySummary} onChange={(v) => setNotif({ weeklySummary: v })} />
            <SettingsToggle label="Email notifications" description="Mock toggle — no emails are sent" checked={settings.notifications.emailNotifications} onChange={(v) => setNotif({ emailNotifications: v })} />
          </SettingsSection>
        </div>

        <SettingsSection title="Appearance" icon={<Palette className="size-4" />} description="Themes are previewed here; the app uses a dark-red default.">
          <div className="px-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Theme</div>
          <ThemePicker value={settings.appearance.theme} onChange={(v: ThemeName) => setAppear({ theme: v })} />
          <SettingsSelect label="Card grid density" value={settings.appearance.gridDensity} onChange={(v) => setAppear({ gridDensity: v as GridDensity })}
            options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }, { value: "large", label: "Large" }]} />
          <SettingsToggle label="Reduce motion" description="Disables pack-opening and reveal animations" checked={settings.appearance.reduceMotion} onChange={(v) => setAppear({ reduceMotion: v })} />
          <SettingsToggle label="Compact cards" checked={settings.appearance.compactCards} onChange={(v) => setAppear({ compactCards: v })} />
          <SettingsToggle label="Show rarity glow" checked={settings.appearance.showRarityGlow} onChange={(v) => setAppear({ showRarityGlow: v })} />
        </SettingsSection>

        <SettingsSection title="Safety" icon={<Lock className="size-4" />} description="This is a closed collectible economy.">
          <div className="mb-2 flex items-start gap-2 rounded-xl border border-tactical/15 bg-tactical/[0.05] px-3 py-2.5 text-xs leading-relaxed text-tactical">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            No cashout and no gambling. Premium Coins can be converted one-way into Free Coins, but no currency or item can be exchanged for real money, gift cards or crypto, or transferred off-platform.
          </div>
          <SettingsSelect label="Spending limit (mock)" value={String(settings.safety.spendingLimit)} onChange={(v) => setSafety({ spendingLimit: Number(v) })}
            options={[{ value: "0", label: "No limit" }, { value: "500", label: "500 PC / session" }, { value: "1000", label: "1000 PC / session" }]} />
          <SettingsSelect label="Purchase cooldown (mock)" value={String(settings.safety.purchaseCooldownMinutes)} onChange={(v) => setSafety({ purchaseCooldownMinutes: Number(v) })}
            options={[{ value: "0", label: "Off" }, { value: "5", label: "5 minutes" }, { value: "15", label: "15 minutes" }]} />
        </SettingsSection>

        <SettingsSection title="Data & Storage" icon={<Database className="size-4" />} description="Back up or reset your local progress.">
          <DataStorageSettings onChanged={() => { refresh(); setRev((r) => r + 1); toast("Storage updated", "info"); }} />
        </SettingsSection>
      </div>
    </AppShell>
  );
}
