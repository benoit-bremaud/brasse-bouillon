import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import {
  getAccountPreferences,
  getDefaultAccountPreferences,
  saveAccountPreferences,
} from "@/features/profile/application/account-preferences.use-cases";
import { AccountPreferencesScreen } from "../AccountPreferencesScreen";

const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  usePathname: () => "/(app)/profile/preferences",
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
jest.mock(
  "@/features/profile/application/account-preferences.use-cases",
  () => ({
    getAccountPreferences: jest.fn(),
    getDefaultAccountPreferences: jest.fn(),
    saveAccountPreferences: jest.fn(),
  }),
);

const mockedGetDefaults = getDefaultAccountPreferences as jest.MockedFunction<
  typeof getDefaultAccountPreferences
>;
const mockedGetPreferences = getAccountPreferences as jest.MockedFunction<
  typeof getAccountPreferences
>;
const mockedSavePreferences = saveAccountPreferences as jest.MockedFunction<
  typeof saveAccountPreferences
>;

const DEFAULT_PREFERENCES = {
  theme: "system" as const,
  units: "metric" as const,
  notificationsEnabled: true,
  brewingRemindersEnabled: true,
  productUpdatesEnabled: false,
};

describe("AccountPreferencesScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockedGetDefaults.mockReset();
    mockedGetPreferences.mockReset();
    mockedSavePreferences.mockReset();
    mockedGetDefaults.mockReturnValue(DEFAULT_PREFERENCES);
    mockedGetPreferences.mockResolvedValue(DEFAULT_PREFERENCES);
  });

  it("loads the saved theme and unit choices", async () => {
    // Arrange
    mockedGetPreferences.mockResolvedValue({
      ...DEFAULT_PREFERENCES,
      theme: "dark",
      units: "imperial",
    });
    render(<AccountPreferencesScreen />);

    // Act
    await screen.findByText("Préférences de l'application");

    // Assert
    expect(
      screen.getByRole("radio", { name: "Sombre" }).props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      screen.getByRole("radio", { name: "Impérial" }).props.accessibilityState,
    ).toEqual({ selected: true });
  });

  it("saves changed preferences and returns to Profile", async () => {
    // Arrange
    mockedSavePreferences.mockResolvedValue({
      ...DEFAULT_PREFERENCES,
      theme: "light",
      productUpdatesEnabled: true,
    });
    render(<AccountPreferencesScreen />);
    await screen.findByText("Préférences de l'application");

    // Act
    fireEvent.press(screen.getByRole("radio", { name: "Clair" }));
    fireEvent(
      screen.getByLabelText("Actualités de l'application"),
      "valueChange",
      true,
    );
    fireEvent.press(
      screen.getByLabelText("Enregistrer mes préférences de l'application"),
    );

    // Assert
    await waitFor(() => {
      expect(mockedSavePreferences).toHaveBeenCalledWith({
        ...DEFAULT_PREFERENCES,
        theme: "light",
        productUpdatesEnabled: true,
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  it("shows a save error without leaving the screen", async () => {
    // Arrange
    mockedSavePreferences.mockRejectedValueOnce(
      new Error("Préférences indisponibles"),
    );
    render(<AccountPreferencesScreen />);
    await screen.findByText("Préférences de l'application");

    // Act
    fireEvent.press(
      screen.getByLabelText("Enregistrer mes préférences de l'application"),
    );

    // Assert
    expect(await screen.findByText("Préférences indisponibles")).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });
});
