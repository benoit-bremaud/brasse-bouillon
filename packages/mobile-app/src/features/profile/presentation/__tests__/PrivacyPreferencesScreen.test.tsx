import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import {
  getDefaultPrivacyPreferences,
  getPrivacySettings,
  savePrivacySettings,
} from "@/features/profile/application/privacy-preferences.use-cases";
import { PrivacyPreferencesScreen } from "../PrivacyPreferencesScreen";

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  usePathname: () => "/(app)/profile/privacy",
}));
jest.mock(
  "@/features/profile/application/privacy-preferences.use-cases",
  () => ({
    getDefaultPrivacyPreferences: jest.fn(),
    getPrivacySettings: jest.fn(),
    savePrivacySettings: jest.fn(),
  }),
);

const mockedGetDefaults = getDefaultPrivacyPreferences as jest.MockedFunction<
  typeof getDefaultPrivacyPreferences
>;
const mockedGetSettings = getPrivacySettings as jest.MockedFunction<
  typeof getPrivacySettings
>;
const mockedSaveSettings = savePrivacySettings as jest.MockedFunction<
  typeof savePrivacySettings
>;

function createDefaultPreferences() {
  return {
    storeBarcodeValue: true,
    storeBottlePhotos: true,
    storeScanMetadata: true,
    useDataForModelTraining: true,
  };
}

describe("PrivacyPreferencesScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockPush.mockReset();
    mockedGetDefaults.mockReset();
    mockedGetSettings.mockReset();
    mockedSaveSettings.mockReset();
    mockedGetDefaults.mockReturnValue(createDefaultPreferences());
    mockedGetSettings.mockResolvedValue({
      hasConsent: true,
      consentedAtIso: "2026-01-01T00:00:00.000Z",
      retentionDays: 30,
      preferences: createDefaultPreferences(),
    });
  });

  it("loads the saved consent preferences", async () => {
    // Arrange
    render(<PrivacyPreferencesScreen />);

    // Act
    expect(await screen.findByText("Préférences enregistrées")).toBeTruthy();

    // Assert
    expect(
      screen.getByLabelText("Conserver les photos de bouteille").props.value,
    ).toBe(true);
  });

  it("persists a changed consent preference and returns to Profile", async () => {
    // Arrange
    const defaultPreferences = createDefaultPreferences();
    mockedSaveSettings.mockResolvedValue({
      hasConsent: true,
      consentedAtIso: "2026-01-02T00:00:00.000Z",
      retentionDays: 30,
      preferences: { ...defaultPreferences, storeBottlePhotos: false },
    });
    render(<PrivacyPreferencesScreen />);

    const photoSwitch = await screen.findByLabelText(
      "Conserver les photos de bouteille",
    );
    fireEvent(photoSwitch, "valueChange", false);
    fireEvent.press(
      screen.getByLabelText("Enregistrer mes préférences de confidentialité"),
    );

    // Act
    await waitFor(() => {
      // Assert
      expect(mockedSaveSettings).toHaveBeenCalledWith({
        retentionDays: 30,
        preferences: { ...defaultPreferences, storeBottlePhotos: false },
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  it("uses default preferences when no saved consent exists", async () => {
    // Arrange
    mockedGetSettings.mockResolvedValueOnce(null);
    render(<PrivacyPreferencesScreen />);

    // Act
    expect(await screen.findByText("À configurer")).toBeTruthy();

    // Assert
    expect(
      screen.getByLabelText("Conserver les photos de bouteille").props.value,
    ).toBe(true);
  });

  it("shows the loading error and keeps the default form available", async () => {
    // Arrange
    mockedGetSettings.mockRejectedValueOnce(
      new Error("Préférences indisponibles"),
    );
    render(<PrivacyPreferencesScreen />);

    // Act
    const error = await screen.findByText("Préférences indisponibles");

    // Assert
    expect(error).toBeTruthy();
    expect(screen.getByText("À configurer")).toBeTruthy();
  });

  it("opens the consent decision history", async () => {
    // Arrange
    render(<PrivacyPreferencesScreen />);
    await screen.findByText("Préférences enregistrées");

    // Act
    fireEvent.press(screen.getByLabelText("Voir l'historique des décisions"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/(app)/profile/privacy-history");
  });

  it("shows the save error and stays on the privacy screen", async () => {
    // Arrange
    mockedSaveSettings.mockRejectedValueOnce(
      new Error("Consentement non enregistré"),
    );
    render(<PrivacyPreferencesScreen />);
    await screen.findByText("Préférences enregistrées");

    // Act
    fireEvent.press(
      screen.getByLabelText("Enregistrer mes préférences de confidentialité"),
    );

    // Assert
    expect(await screen.findByText("Consentement non enregistré")).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("ignores a second privacy save while the first request is pending", async () => {
    // Arrange
    let resolveSave: () => void = () => undefined;
    const pendingSave = new Promise<{
      hasConsent: boolean;
      consentedAtIso: string;
      retentionDays: number;
      preferences: ReturnType<typeof createDefaultPreferences>;
    }>((resolve) => {
      resolveSave = () =>
        resolve({
          hasConsent: true,
          consentedAtIso: "2026-01-02T00:00:00.000Z",
          retentionDays: 30,
          preferences: createDefaultPreferences(),
        });
    });
    mockedSaveSettings.mockReturnValue(pendingSave);
    render(<PrivacyPreferencesScreen />);
    await screen.findByText("Préférences enregistrées");

    // Act
    const saveButton = screen.getByLabelText(
      "Enregistrer mes préférences de confidentialité",
    );
    fireEvent.press(saveButton);
    fireEvent.press(saveButton);

    // Assert
    expect(mockedSaveSettings).toHaveBeenCalledTimes(1);

    resolveSave();
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });
});
