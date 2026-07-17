export type PrivacyPreferences = {
  storeBarcodeValue: boolean;
  storeBottlePhotos: boolean;
  storeScanMetadata: boolean;
  useDataForModelTraining: boolean;
};

export type PrivacySettings = {
  hasConsent: boolean;
  consentedAtIso: string;
  retentionDays: number;
  preferences: PrivacyPreferences;
};

export type SavePrivacySettingsInput = {
  retentionDays: number;
  preferences: PrivacyPreferences;
};

export interface PrivacyPreferencesGateway {
  getDefaultPreferences(): PrivacyPreferences;
  getSettings(): Promise<PrivacySettings | null>;
  saveSettings(input: SavePrivacySettingsInput): Promise<PrivacySettings>;
}
