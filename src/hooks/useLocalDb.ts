"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getLocalUser, saveLocalUser,
  getLocalSettings, saveLocalSettings,
  getLocalCollection, saveLocalCollection,
} from "@/lib/localDb";
import { currentUser as seedUser, defaultUserSettings } from "@/data/user";
import type { User, UserSettings, CollectionState } from "@/types";
import { cards as seedCards } from "@/data/cards";

// Builds the initial collection from seed `ownedAmount` values the first time
// the app runs (so the demo isn't empty), then persists it locally.
function seedCollection(): CollectionState {
  const owned: Record<string, number> = {};
  for (const c of seedCards) if (c.ownedAmount > 0) owned[c.id] = c.ownedAmount;
  return {
    owned,
    favoriteCardIds: seedUser.favoriteCardIds,
    showcaseCardIds: seedUser.showcaseCardIds,
  };
}

interface UseLocalDb {
  loading: boolean;
  error: string | null;
  user: User | null;
  settings: UserSettings | null;
  collection: CollectionState | null;
  updateUser: (patch: Partial<User>) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setCollection: (next: CollectionState) => void;
  refresh: () => void;
}

export function useLocalDb(): UseLocalDb {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [collection, setCollectionState] = useState<CollectionState | null>(null);

  const load = useCallback(() => {
    try {
      setLoading(true);
      // User
      let u = getLocalUser();
      if (!u) {
        u = seedUser;
        saveLocalUser(u);
      }
      setUser(u);
      // Settings
      let s = getLocalSettings();
      if (!s) {
        s = defaultUserSettings;
        saveLocalSettings(s);
      }
      setSettings(s);
      // Collection
      let c = getLocalCollection();
      if (!c) {
        c = seedCollection();
        saveLocalCollection(c);
      }
      setCollectionState(c);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load local data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev ?? seedUser), ...patch };
      saveLocalUser(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...(prev ?? defaultUserSettings), ...patch } as UserSettings;
      saveLocalSettings(next);
      return next;
    });
  }, []);

  const setCollection = useCallback((next: CollectionState) => {
    saveLocalCollection(next);
    setCollectionState(next);
  }, []);

  return {
    loading, error, user, settings, collection,
    updateUser, updateSettings, setCollection, refresh: load,
  };
}
