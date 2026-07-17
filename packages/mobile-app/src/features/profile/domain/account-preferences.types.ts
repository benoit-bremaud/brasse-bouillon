import type {
  ThemeMode,
  UnitSystem,
} from "@/core/preferences/account-preferences.types";

export type {
  ThemeMode,
  UnitSystem,
} from "@/core/preferences/account-preferences.types";

export type AccountPreferences = {
  theme: ThemeMode;
  units: UnitSystem;
  notificationsEnabled: boolean;
  brewingRemindersEnabled: boolean;
  productUpdatesEnabled: boolean;
};

export interface AccountPreferencesRepository {
  get(): Promise<AccountPreferences | null>;
  save(preferences: AccountPreferences): Promise<void>;
  purge(): Promise<void>;
}
