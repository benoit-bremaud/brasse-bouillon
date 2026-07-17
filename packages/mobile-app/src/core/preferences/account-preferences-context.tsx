import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  AccountPreferencesSnapshot,
  ThemeMode,
  UnitSystem,
} from "./account-preferences.types";

type AccountPreferencesContextValue = AccountPreferencesSnapshot & {
  setThemeMode: (mode: ThemeMode) => void;
  setUnitSystem: (units: UnitSystem) => void;
};

type AccountPreferencesProviderProps = {
  children: React.ReactNode;
  loadInitialPreferences?: () => Promise<AccountPreferencesSnapshot>;
};

const DEFAULT_PREFERENCES: AccountPreferencesContextValue = {
  theme: "system",
  units: "metric",
  setThemeMode: () => undefined,
  setUnitSystem: () => undefined,
};

const AccountPreferencesContext =
  createContext<AccountPreferencesContextValue>(DEFAULT_PREFERENCES);

export function AccountPreferencesProvider({
  children,
  loadInitialPreferences,
}: AccountPreferencesProviderProps) {
  const [preferences, setPreferences] =
    useState<AccountPreferencesSnapshot>(DEFAULT_PREFERENCES);

  useEffect(() => {
    let isMounted = true;

    const loadPreferences = async () => {
      if (!loadInitialPreferences) {
        return;
      }

      try {
        const initialPreferences = await loadInitialPreferences();
        if (isMounted) {
          setPreferences(initialPreferences);
        }
      } catch {
        // Keep deterministic defaults when local preference storage is
        // unavailable during app bootstrap.
      }
    };

    void loadPreferences();
    return () => {
      isMounted = false;
    };
  }, [loadInitialPreferences]);

  const setThemeMode = useCallback((theme: ThemeMode) => {
    setPreferences((current) => ({ ...current, theme }));
  }, []);

  const setUnitSystem = useCallback((units: UnitSystem) => {
    setPreferences((current) => ({ ...current, units }));
  }, []);

  const value = useMemo(
    () => ({
      ...preferences,
      setThemeMode,
      setUnitSystem,
    }),
    [preferences, setThemeMode, setUnitSystem],
  );

  return (
    <AccountPreferencesContext.Provider value={value}>
      {children}
    </AccountPreferencesContext.Provider>
  );
}

export function useAccountPreferences(): AccountPreferencesContextValue {
  return useContext(AccountPreferencesContext);
}
