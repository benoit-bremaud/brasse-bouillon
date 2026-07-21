import { listConsentDecisions } from "@/features/consent/application/consent.use-cases";
import { getAccountPreferences } from "./account-preferences.use-cases";
import { getPersonalDataExport } from "../data/personal-data-export.api";
import { writeAndSharePersonalDataExport } from "../data/personal-data-export.file";
import type { PersonalDataExportBundle } from "../domain/personal-data-export.types";

export async function buildPersonalDataExport(): Promise<PersonalDataExportBundle> {
  const [apiExport, localPreferences, consentHistory] = await Promise.all([
    getPersonalDataExport(),
    getAccountPreferences(),
    listConsentDecisions(),
  ]);

  return {
    ...apiExport,
    local_preferences: localPreferences,
    consent_history: consentHistory,
  };
}

export async function exportPersonalData(): Promise<string> {
  const exportBundle = await buildPersonalDataExport();
  return writeAndSharePersonalDataExport(exportBundle);
}
