import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Button, Text, View } from "react-native";

import {
  AccountPreferencesProvider,
  useAccountPreferences,
} from "../account-preferences-context";

function PreferencesProbe() {
  const { theme, units, setUnitSystem } = useAccountPreferences();

  return (
    <View>
      <Text>{theme + "/" + units}</Text>
      <Button title="Use imperial" onPress={() => setUnitSystem("imperial")} />
    </View>
  );
}

describe("account preferences context", () => {
  it("loads persisted theme and unit preferences", async () => {
    // Arrange
    const loadInitialPreferences = jest.fn().mockResolvedValue({
      theme: "dark" as const,
      units: "imperial" as const,
    });

    // Act
    render(
      <AccountPreferencesProvider
        loadInitialPreferences={loadInitialPreferences}
      >
        <PreferencesProbe />
      </AccountPreferencesProvider>,
    );

    // Assert
    await waitFor(() => expect(screen.getByText("dark/imperial")).toBeTruthy());
    expect(loadInitialPreferences).toHaveBeenCalledTimes(1);
  });

  it("updates the unit system without changing the theme", async () => {
    // Arrange
    render(
      <AccountPreferencesProvider
        loadInitialPreferences={async () => ({
          theme: "light",
          units: "metric",
        })}
      >
        <PreferencesProbe />
      </AccountPreferencesProvider>,
    );
    await waitFor(() => expect(screen.getByText("light/metric")).toBeTruthy());

    // Act
    fireEvent.press(screen.getByRole("button", { name: "Use imperial" }));

    // Assert
    expect(screen.getByText("light/imperial")).toBeTruthy();
  });

  it("keeps deterministic defaults when preference loading fails", async () => {
    // Arrange
    const loadInitialPreferences = jest
      .fn()
      .mockRejectedValue(new Error("storage unavailable"));

    // Act
    render(
      <AccountPreferencesProvider
        loadInitialPreferences={loadInitialPreferences}
      >
        <PreferencesProbe />
      </AccountPreferencesProvider>,
    );

    // Assert
    await waitFor(() =>
      expect(loadInitialPreferences).toHaveBeenCalledTimes(1),
    );
    expect(screen.getByText("system/metric")).toBeTruthy();
  });
});
