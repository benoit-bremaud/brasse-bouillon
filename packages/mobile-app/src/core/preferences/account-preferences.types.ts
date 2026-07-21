export type ThemeMode = "system" | "light" | "dark";
export type UnitSystem = "metric" | "imperial";

export type AccountPreferencesSnapshot = {
  theme: ThemeMode;
  units: UnitSystem;
};
