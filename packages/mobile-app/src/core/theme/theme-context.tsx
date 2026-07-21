import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import { useAccountPreferences } from "@/core/preferences/account-preferences-context";
import { getThemeColors, type ThemeColors } from "./colors";
import type { ThemeMode } from "./theme.types";

type ResolvedThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
};

const defaultTheme: ThemeContextValue = {
  mode: "system",
  resolvedMode: "light",
  colors: getThemeColors("light"),
  setThemeMode: () => undefined,
};

const ThemeContext = createContext<ThemeContextValue>(defaultTheme);

// Dark mode is not shipped yet: only ~15 of ~120 screens read `useTheme()`, the
// rest still import the static `colors`, so resolving to "dark" would render the
// app half-dark. Until every screen is migrated (a dedicated epic), the provider
// pins the resolved mode to light. The preference, dark palette, and useTheme()
// plumbing all stay in place as the groundwork — flip this to true to enable.
const DARK_MODE_ENABLED = false;

function resolveThemeMode(
  mode: ThemeMode,
  systemScheme: "light" | "dark" | null | undefined,
): ResolvedThemeMode {
  if (mode === "dark") {
    return "dark";
  }

  if (mode === "light") {
    return "light";
  }

  return systemScheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const { theme: mode, setThemeMode } = useAccountPreferences();

  const resolvedMode = DARK_MODE_ENABLED
    ? resolveThemeMode(mode, systemScheme)
    : "light";
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode,
      colors: getThemeColors(resolvedMode),
      setThemeMode,
    }),
    [mode, resolvedMode, setThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export function resolveThemeForTest(
  mode: ThemeMode,
  systemScheme: "light" | "dark" | null | undefined,
): ResolvedThemeMode {
  return resolveThemeMode(mode, systemScheme);
}
