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

  const resolvedMode = resolveThemeMode(mode, systemScheme);
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
