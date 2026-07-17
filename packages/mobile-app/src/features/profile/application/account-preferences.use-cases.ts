import { accountPreferencesRepository } from "@/features/profile/data/account-preferences.storage";
import type {
  AccountPreferences,
  ThemeMode,
  UnitSystem,
} from "@/features/profile/domain/account-preferences.types";

const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  theme: "system",
  units: "metric",
  notificationsEnabled: true,
  brewingRemindersEnabled: true,
  productUpdatesEnabled: false,
};

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function isUnitSystem(value: unknown): value is UnitSystem {
  return value === "metric" || value === "imperial";
}

function normalizePreferences(
  preferences: Partial<AccountPreferences> | null | undefined,
): AccountPreferences {
  return {
    theme: isThemeMode(preferences?.theme)
      ? preferences.theme
      : DEFAULT_ACCOUNT_PREFERENCES.theme,
    units: isUnitSystem(preferences?.units)
      ? preferences.units
      : DEFAULT_ACCOUNT_PREFERENCES.units,
    notificationsEnabled:
      typeof preferences?.notificationsEnabled === "boolean"
        ? preferences.notificationsEnabled
        : DEFAULT_ACCOUNT_PREFERENCES.notificationsEnabled,
    brewingRemindersEnabled:
      typeof preferences?.brewingRemindersEnabled === "boolean"
        ? preferences.brewingRemindersEnabled
        : DEFAULT_ACCOUNT_PREFERENCES.brewingRemindersEnabled,
    productUpdatesEnabled:
      typeof preferences?.productUpdatesEnabled === "boolean"
        ? preferences.productUpdatesEnabled
        : DEFAULT_ACCOUNT_PREFERENCES.productUpdatesEnabled,
  };
}

export type { AccountPreferences } from "@/features/profile/domain/account-preferences.types";

export function getDefaultAccountPreferences(): AccountPreferences {
  return { ...DEFAULT_ACCOUNT_PREFERENCES };
}

export async function getAccountPreferences(): Promise<AccountPreferences> {
  return normalizePreferences(await accountPreferencesRepository.get());
}

export async function saveAccountPreferences(
  preferences: AccountPreferences,
): Promise<AccountPreferences> {
  const normalizedPreferences = normalizePreferences(preferences);
  await accountPreferencesRepository.save(normalizedPreferences);
  return normalizedPreferences;
}

export async function purgeAccountPreferences(): Promise<void> {
  await accountPreferencesRepository.purge();
}
