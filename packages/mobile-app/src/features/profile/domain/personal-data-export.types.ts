import type { AccountPreferences } from "./account-preferences.types";
import type { ConsentDecision } from "@/features/consent/domain/consent.types";

export type PersonalDataExportRecord = Record<string, unknown>;

export type PersonalDataExportAccount = {
  id: string;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiPersonalDataExport = {
  schema_version: string;
  exported_at: string;
  account: PersonalDataExportAccount;
  recipes: PersonalDataExportRecord[];
  recipe_components: PersonalDataExportRecord[];
  batches: PersonalDataExportRecord[];
  batch_records: PersonalDataExportRecord[];
  equipment_profiles: PersonalDataExportRecord[];
  label_drafts: PersonalDataExportRecord[];
  scans: PersonalDataExportRecord[];
  scan_images: PersonalDataExportRecord[];
};

export type PersonalDataExportBundle = ApiPersonalDataExport & {
  local_preferences: AccountPreferences;
  consent_history: ConsentDecision[];
};
