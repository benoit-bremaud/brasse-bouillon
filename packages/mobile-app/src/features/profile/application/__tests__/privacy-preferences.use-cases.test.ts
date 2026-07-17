import {
  getDefaultPrivacyPreferences,
  getPrivacySettings,
  savePrivacySettings,
} from "../privacy-preferences.use-cases";
import { privacyPreferencesGateway } from "@/features/profile/data/privacy-preferences.gateway";

jest.mock("@/features/profile/data/privacy-preferences.gateway", () => ({
  privacyPreferencesGateway: {
    getDefaultPreferences: jest.fn(),
    getSettings: jest.fn(),
    saveSettings: jest.fn(),
  },
}));

describe("privacy preference use-cases", () => {
  beforeEach(() => {
    jest.mocked(privacyPreferencesGateway.getDefaultPreferences).mockReset();
    jest.mocked(privacyPreferencesGateway.getSettings).mockReset();
    jest.mocked(privacyPreferencesGateway.saveSettings).mockReset();
  });

  it("delegates default preferences to the privacy gateway", () => {
    // Arrange
    const preferences = {
      storeBarcodeValue: true,
      storeBottlePhotos: false,
      storeScanMetadata: true,
      useDataForModelTraining: false,
    };
    jest
      .mocked(privacyPreferencesGateway.getDefaultPreferences)
      .mockReturnValue(preferences);

    // Act
    const result = getDefaultPrivacyPreferences();

    // Assert
    expect(result).toEqual(preferences);
    expect(
      privacyPreferencesGateway.getDefaultPreferences,
    ).toHaveBeenCalledTimes(1);
  });

  it("delegates loading saved settings to the privacy gateway", async () => {
    // Arrange
    const settings = {
      hasConsent: true,
      consentedAtIso: "2026-01-01T00:00:00.000Z",
      retentionDays: 30,
      preferences: {
        storeBarcodeValue: true,
        storeBottlePhotos: true,
        storeScanMetadata: true,
        useDataForModelTraining: true,
      },
    };
    jest
      .mocked(privacyPreferencesGateway.getSettings)
      .mockResolvedValue(settings);

    // Act
    const result = await getPrivacySettings();

    // Assert
    expect(result).toEqual(settings);
    expect(privacyPreferencesGateway.getSettings).toHaveBeenCalledTimes(1);
  });

  it("delegates saving settings without changing the input contract", async () => {
    // Arrange
    const input = {
      retentionDays: 30,
      preferences: {
        storeBarcodeValue: true,
        storeBottlePhotos: false,
        storeScanMetadata: true,
        useDataForModelTraining: false,
      },
    };
    const settings = {
      hasConsent: true,
      consentedAtIso: "2026-01-01T00:00:00.000Z",
      retentionDays: input.retentionDays,
      preferences: input.preferences,
    };
    jest
      .mocked(privacyPreferencesGateway.saveSettings)
      .mockResolvedValue(settings);

    // Act
    const result = await savePrivacySettings(input);

    // Assert
    expect(result).toEqual(settings);
    expect(privacyPreferencesGateway.saveSettings).toHaveBeenCalledWith(input);
  });

  it("propagates a gateway loading failure", async () => {
    // Arrange
    const error = new Error("Privacy unavailable");
    jest
      .mocked(privacyPreferencesGateway.getSettings)
      .mockRejectedValueOnce(error);

    // Act
    const settingsPromise = getPrivacySettings();

    // Assert
    await expect(settingsPromise).rejects.toBe(error);
  });
});
