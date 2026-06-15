"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SignInGate } from "@/components/layout/SignInGate";
import { SettingsSection, SettingsToggle, SettingsSelect, SettingsTextField } from "@/components/settings/primitives";
import { AvatarPicker } from "@/components/settings/AvatarPicker";
import { ThemePicker } from "@/components/settings/ThemePicker";
import { RiotLinkCard } from "@/components/valorant/RiotLinkCard";
import { useGameData } from "@/components/providers/GameDataProvider";
import { api } from "@/lib/apiClient";
import { useToast } from "@/components/ui/Toast";
import { defaultUserSettings } from "@/data/user";
import { ImageUploader } from "@/components/ui/ImageUploader";
import type { UserSettings, ThemeName, GridDensity, CardRole } from "@/types";
import { User as UserIcon, Shield, Bell, Palette, Lock, Link2, ShieldCheck, Save } from "lucide-react";

const ROLES: CardRole[] = ["duelist", "controller", "sentinel", "initiator", "neutral"];

export default function SettingsPage() {
  const toast = useToast();
  const { profile, setProfileLocal, refreshProfile } = useGameData();
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);
  const [saving, setSaving] = useState(false);

  // Load saved settings JSON from the server (merged onto defaults).
  useEffect(() => {
    api.getSettings().then((s) => {
      if (s && Object.keys(s).length) {
        const merged = { ...defaultUserSettings, ...(s as Partial<UserSettings>) } as UserSettings;
        setSettings(merged);
        if (merged.appearance) {
          const root = document.documentElement;
          root.setAttribute("data-theme", merged.appearance.theme);
          root.setAttribute("data-reduce-motion", merged.appearance.reduceMotion ? "true" : "false");
          root.setAttribute("data-density", merged.appearance.gridDensity);
          root.setAttribute("data-rarity-glow", merged.appearance.showRarityGlow ? "true" : "false");
        }
      }
    }).catch(() => {});
  }, []);

  const saveProfile = async (patch: Record<string, unknown>) => {
    setProfileLocal(patch as any); // optimistic
    try { await api.updateProfile(patch); } catch (e) { toast(e instanceof Error ? e.message : "Save failed", "error"); refreshProfile(); }
  };

  const persistSettings = async (next: UserSettings) => {
    setSettings(next);
    try { await api.saveSettings(next as unknown as Record<string, unknown>); } catch { /* non-fatal */ }
  };
  const setPrivacy = (p: Partial<UserSettings["privacy"]>) => persistSettings({ ...settings, privacy: { ...settings.privacy, ...p } });
  const setNotif = (p: Partial<UserSettings["notifications"]>) => persistSettings({ ...settings, notifications: { ...settings.notifications, ...p } });
  const applyAppearance = (a: UserSettings["appearance"]) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", a.theme);
    root.setAttribute("data-reduce-motion", a.reduceMotion ? "true" : "false");
    root.setAttribute("data-density", a.gridDensity);
    root.setAttribute("data-rarity-glow", a.showRarityGlow ? "true" : "false");
  };
  const setAppear = (p: Partial<UserSettings["appearance"]>) => {
    const nextAppearance = { ...settings.appearance, ...p };
    applyAppearance(nextAppearance); // live, instant feedback
    persistSettings({ ...settings, appearance: nextAppearance });
  };
  const setSafety = (p: Partial<UserSettings["safety"]>) => persistSettings({ ...settings, safety: { ...settings.safety, ...p } });

  return (
    <AppShell>
      <SignInGate>
      {profile && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
              <p className="text-sm text-slate-400">Personalize your profile, privacy and appearance. Saved to your account.</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SettingsSection title="Profile" icon={<UserIcon className="size-4" />} description="How you appear across the app.">
              <SettingsTextField label="Display name" value={profile.displayName} onChange={(v) => saveProfile({ displayName: v })} />
              <SettingsTextField label="Bio" value={profile.bio} onChange={(v) => saveProfile({ bio: v })} placeholder="A short tagline" />
              <SettingsSelect label="Favorite role" value={profile.favoriteRole} onChange={(v) => saveProfile({ favoriteRole: v })} options={ROLES.map((r) => ({ value: r, label: r }))} />
              <SettingsTextField label="Favorite category" value={profile.favoriteCategory} onChange={(v) => saveProfile({ favoriteCategory: v })} />
              <SettingsTextField label="Region" value={profile.region} onChange={(v) => saveProfile({ region: v })} />
              <SettingsTextField label="Language" value={profile.language} onChange={(v) => saveProfile({ language: v })} />
              <SettingsTextField label="Timezone" value={profile.timezone} onChange={(v) => saveProfile({ timezone: v })} />
              <div className="pt-1">
                <div className="px-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Avatar</div>
                <div className="px-3 pt-2">
                  <ImageUploader value={profile.avatar} shape="circle" label="Upload your own"
                    onUploaded={(url) => saveProfile({ avatar: url || "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=clutch" })} />
                </div>
                <div className="px-3 pt-3 font-mono text-[10px] uppercase tracking-wider text-slate-600">Or pick one</div>
                <AvatarPicker value={profile.avatar} onChange={(v) => saveProfile({ avatar: v })} />
              </div>
            </SettingsSection>

            <div className="space-y-5">
              <SettingsSection title="Valorant" icon={<Link2 className="size-4" />} description="Link your Riot account to sync matches and progress quests.">
                <div className="px-1"><RiotLinkCard /></div>
              </SettingsSection>

              <SettingsSection title="Privacy" icon={<Shield className="size-4" />}>
                <SettingsToggle label="Public profile" checked={settings.privacy.profilePublic} onChange={(v) => setPrivacy({ profilePublic: v })} />
                <SettingsToggle label="Public collection" checked={settings.privacy.collectionPublic} onChange={(v) => setPrivacy({ collectionPublic: v })} />
                <SettingsToggle label="Show market stats" checked={settings.privacy.showMarketStats} onChange={(v) => setPrivacy({ showMarketStats: v })} />
                <SettingsToggle label="Show online status" checked={settings.privacy.showOnlineStatus} onChange={(v) => setPrivacy({ showOnlineStatus: v })} />
              </SettingsSection>
            </div>

            <SettingsSection title="Notifications" icon={<Bell className="size-4" />}>
              <SettingsToggle label="Quest reminders" checked={settings.notifications.questReminder} onChange={(v) => setNotif({ questReminder: v })} />
              <SettingsToggle label="Market sale notifications" checked={settings.notifications.marketSale} onChange={(v) => setNotif({ marketSale: v })} />
              <SettingsToggle label="Pack reward notifications" checked={settings.notifications.packReward} onChange={(v) => setNotif({ packReward: v })} />
              <SettingsToggle label="Weekly summary" checked={settings.notifications.weeklySummary} onChange={(v) => setNotif({ weeklySummary: v })} />
              <SettingsToggle label="Email notifications" description="Mock toggle — no emails are sent" checked={settings.notifications.emailNotifications} onChange={(v) => setNotif({ emailNotifications: v })} />
            </SettingsSection>

            <SettingsSection title="Appearance" icon={<Palette className="size-4" />} description="Theme is previewed here; the app uses a dark-red default.">
              <div className="px-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">Theme</div>
              <ThemePicker value={settings.appearance.theme} onChange={(v: ThemeName) => setAppear({ theme: v })} />
              <SettingsSelect label="Card grid density" value={settings.appearance.gridDensity} onChange={(v) => setAppear({ gridDensity: v as GridDensity })}
                options={[{ value: "comfortable", label: "Comfortable" }, { value: "compact", label: "Compact" }, { value: "large", label: "Large" }]} />
              <SettingsToggle label="Reduce motion" checked={settings.appearance.reduceMotion} onChange={(v) => setAppear({ reduceMotion: v })} />
              <SettingsToggle label="Compact cards" checked={settings.appearance.compactCards} onChange={(v) => setAppear({ compactCards: v })} />
              <SettingsToggle label="Show rarity glow" checked={settings.appearance.showRarityGlow} onChange={(v) => setAppear({ showRarityGlow: v })} />
            </SettingsSection>

            <SettingsSection title="Safety" icon={<Lock className="size-4" />} description="This is a closed collectible economy.">
              <div className="mb-2 flex items-start gap-2 rounded-xl border border-tactical/15 bg-tactical/[0.05] px-3 py-2.5 text-xs leading-relaxed text-tactical">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                No cashout and no gambling. Premium Coins convert one-way into Free Coins, but nothing converts to real money, gift cards or crypto, or transfers off-platform.
              </div>
              <SettingsSelect label="Spending limit (mock)" value={String(settings.safety.spendingLimit)} onChange={(v) => setSafety({ spendingLimit: Number(v) })}
                options={[{ value: "0", label: "No limit" }, { value: "500", label: "500 PC / session" }, { value: "1000", label: "1000 PC / session" }]} />
              <SettingsSelect label="Purchase cooldown (mock)" value={String(settings.safety.purchaseCooldownMinutes)} onChange={(v) => setSafety({ purchaseCooldownMinutes: Number(v) })}
                options={[{ value: "0", label: "Off" }, { value: "5", label: "5 minutes" }, { value: "15", label: "15 minutes" }]} />
            </SettingsSection>
          </div>
        </>
      )}
      </SignInGate>
    </AppShell>
  );
}
