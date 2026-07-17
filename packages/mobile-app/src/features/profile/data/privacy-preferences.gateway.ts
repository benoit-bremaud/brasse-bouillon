import {
  getDefaultScanConsentPreferences,
  getScanConsentSettings,
  giveScanConsent,
} from "@/features/scan/application/scan.use-cases";
import type {
  ScanConsentPreferences,
  ScanConsentSettings,
} from "@/features/scan/domain/scan.types";
import type {
  PrivacyPreferences,
  PrivacyPreferencesGateway,
  PrivacySettings,
  SavePrivacySettingsInput,
} from "@/features/profile/domain/privacy.types";

function toPrivacyPreferences(
  preferences: ScanConsentPreferences,
): PrivacyPreferences {
  return {
    storeBarcodeValue: preferences.storeBarcodeValue,
    storeBottlePhotos: preferences.storeBottlePhotos,
    storeScanMetadata: preferences.storeScanMetadata,
    useDataForModelTraining: preferences.useDataForModelTraining,
  };
}

function toPrivacySettings(settings: ScanConsentSettings): PrivacySettings {
  return {
    hasConsent: settings.hasConsent,
    consentedAtIso: settings.consentedAtIso,
    retentionDays: settings.retentionDays,
    preferences: toPrivacyPreferences(settings.preferences),
  };
}

function toScanConsentPreferences(
  preferences: PrivacyPreferences,
): ScanConsentPreferences {
  return {
    storeBarcodeValue: preferences.storeBarcodeValue,
    storeBottlePhotos: preferences.storeBottlePhotos,
    storeScanMetadata: preferences.storeScanMetadata,
    useDataForModelTraining: preferences.useDataForModelTraining,
  };
}

export const privacyPreferencesGateway: PrivacyPreferencesGateway = {
  getDefaultPreferences() {
    return toPrivacyPreferences(getDefaultScanConsentPreferences());
  },

  async getSettings() {
    const settings = await getScanConsentSettings();
    return settings ? toPrivacySettings(settings) : null;
  },

  async saveSettings(input: SavePrivacySettingsInput) {
    const settings = await giveScanConsent({
      retentionDays: input.retentionDays,
      preferences: toScanConsentPreferences(input.preferences),
    });
    return toPrivacySettings(settings);
  },
};
