import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { AccountPreferencesProvider } from "@/core/preferences/account-preferences-context";
import { ThemeProvider, resolveThemeForTest, useTheme } from "../theme-context";

function ThemeProbe() {
  const { mode, resolvedMode } = useTheme();
  return <Text>{mode + "/" + resolvedMode}</Text>;
}

describe("theme context", () => {
  it("resolves system mode to dark when the device uses dark appearance", () => {
    // Arrange
    const mode = "system" as const;

    // Act
    const resolvedMode = resolveThemeForTest(mode, "dark");

    // Assert
    expect(resolvedMode).toBe("dark");
  });

  it("resolves system mode to light when the device has no dark preference", () => {
    // Arrange
    const mode = "system" as const;

    // Act
    const resolvedMode = resolveThemeForTest(mode, null);

    // Assert
    expect(resolvedMode).toBe("light");
  });

  it("keeps an explicit light preference over the system appearance", () => {
    // Arrange

    // Act
    const resolvedMode = resolveThemeForTest("light", "dark");

    // Assert
    expect(resolvedMode).toBe("light");
  });

  it("keeps an explicit dark preference over the system appearance", () => {
    // Arrange

    // Act
    const resolvedMode = resolveThemeForTest("dark", "light");

    // Assert
    expect(resolvedMode).toBe("dark");
  });

  it("uses light mode for an unavailable system scheme", () => {
    // Arrange

    // Act
    const resolvedMode = resolveThemeForTest("system", undefined);

    // Assert
    expect(resolvedMode).toBe("light");
  });

  it("loads the persisted mode but renders light while dark mode is gated off", async () => {
    // Dark mode is gated off in ThemeProvider until every screen is theme-aware.
    // The persisted preference is still surfaced as `mode` (so the control can
    // return later), but the RESOLVED mode is pinned to light — a stored "dark"
    // preference loads as mode=dark yet renders resolvedMode=light, never leaking
    // a half-dark app.
    const loadInitialPreferences = jest
      .fn()
      .mockResolvedValue({ theme: "dark" as const, units: "metric" as const });
    render(
      <AccountPreferencesProvider
        loadInitialPreferences={loadInitialPreferences}
      >
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>
      </AccountPreferencesProvider>,
    );

    // Act
    await waitFor(() => expect(screen.getByText("dark/light")).toBeTruthy());

    // Assert
    expect(loadInitialPreferences).toHaveBeenCalledTimes(1);
  });

  it("keeps the system fallback when preference loading fails", async () => {
    // Arrange
    const loadInitialPreferences = jest
      .fn()
      .mockRejectedValue(new Error("storage unavailable"));
    render(
      <AccountPreferencesProvider
        loadInitialPreferences={loadInitialPreferences}
      >
        <ThemeProvider>
          <ThemeProbe />
        </ThemeProvider>
      </AccountPreferencesProvider>,
    );

    // Act
    await waitFor(() =>
      expect(loadInitialPreferences).toHaveBeenCalledTimes(1),
    );

    // Assert
    expect(screen.getByText("system/light")).toBeTruthy();
  });
});
