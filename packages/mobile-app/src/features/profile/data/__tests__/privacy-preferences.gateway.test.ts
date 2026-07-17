import {
  getDefaultScanConsentPreferences,
  getScanConsentSettings,
  giveScanConsent,
} from "@/features/scan/application/scan.use-cases";
import { privacyPreferencesGateway } from "../privacy-preferences.gateway";

jest.mock("@/features/scan/application/scan.use-cases", () => ({
  getDefaultScanConsentPreferences: jest.fn(),
  getScanConsentSettings: jest.fn(),
  giveScanConsent: jest.fn(),
}));

describe("privacy preferences gateway", () => {
  beforeEach(() => {
    jest.mocked(getDefaultScanConsentPreferences).mockReset();
    jest.mocked(getScanConsentSettings).mockReset();
    jest.mocked(giveScanConsent).mockReset();
  });

  it("maps default Scan preferences to the Profile contract", () => {
    // Arrange
    const scanPreferences = {
      storeBarcodeValue: true,
      storeBottlePhotos: false,
      storeScanMetadata: true,
      useDataForModelTraining: false,
    };
    jest
      .mocked(getDefaultScanConsentPreferences)
      .mockReturnValue(scanPreferences);

    // Act
    const preferences = privacyPreferencesGateway.getDefaultPreferences();

    // Assert
    expect(preferences).toEqual(scanPreferences);
  });

  it("maps saved Scan settings to the Profile contract", async () => {
    // Arrange
    const scanSettings = {
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
    jest.mocked(getScanConsentSettings).mockResolvedValue(scanSettings);

    // Act
    const settings = await privacyPreferencesGateway.getSettings();

    // Assert
    expect(settings).toEqual(scanSettings);
  });

  it("maps Profile settings before delegating persistence to Scan", async () => {
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
    const scanSettings = {
      hasConsent: true,
      consentedAtIso: "2026-01-01T00:00:00.000Z",
      retentionDays: input.retentionDays,
      preferences: input.preferences,
    };
    jest.mocked(giveScanConsent).mockResolvedValue(scanSettings);

    // Act
    const settings = await privacyPreferencesGateway.saveSettings(input);

    // Assert
    expect(settings).toEqual(scanSettings);
    expect(giveScanConsent).toHaveBeenCalledWith(input);
  });

  it("returns null when Scan has no saved settings", async () => {
    // Arrange
    jest.mocked(getScanConsentSettings).mockResolvedValueOnce(null);

    // Act
    const settings = await privacyPreferencesGateway.getSettings();

    // Assert
    expect(settings).toBeNull();
  });

  it("propagates Scan persistence failures", async () => {
    // Arrange
    const error = new Error("Consent unavailable");
    jest.mocked(giveScanConsent).mockRejectedValueOnce(error);
    const input = {
      retentionDays: 30,
      preferences: {
        storeBarcodeValue: true,
        storeBottlePhotos: false,
        storeScanMetadata: true,
        useDataForModelTraining: false,
      },
    };

    // Act
    const savePromise = privacyPreferencesGateway.saveSettings(input);

    // Assert
    await expect(savePromise).rejects.toBe(error);
  });
});
