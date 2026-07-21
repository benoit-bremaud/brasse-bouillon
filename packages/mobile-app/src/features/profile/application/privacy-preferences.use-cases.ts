import { privacyPreferencesGateway } from "@/features/profile/data/privacy-preferences.gateway";
import type {
  PrivacyPreferences,
  PrivacySettings,
  SavePrivacySettingsInput,
} from "@/features/profile/domain/privacy.types";

export type {
  PrivacyPreferences,
  PrivacySettings,
  SavePrivacySettingsInput,
} from "@/features/profile/domain/privacy.types";

export function getDefaultPrivacyPreferences(): PrivacyPreferences {
  return privacyPreferencesGateway.getDefaultPreferences();
}

export async function getPrivacySettings(): Promise<PrivacySettings | null> {
  return privacyPreferencesGateway.getSettings();
}

export async function savePrivacySettings(
  input: SavePrivacySettingsInput,
): Promise<PrivacySettings> {
  return privacyPreferencesGateway.saveSettings(input);
}
