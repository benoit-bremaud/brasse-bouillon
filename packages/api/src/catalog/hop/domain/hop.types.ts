import { HopForm } from './enums/hop-form.enum';
import { HopUsageType } from './enums/hop-usage-type.enum';

/**
 * Domain shape for a single hop variety entry in the immutable
 * reference catalogue. Mirrors the database row shape one-to-one
 * (see `HopOrmEntity`) — kept as a separate interface so the
 * application / presentation layers do not import the ORM entity
 * directly.
 *
 * `producer` and `substitutes` are intentionally absent — they are
 * modelled as separate normalised tables in the follow-up
 * "normalize-producers" PR. Adding them here as denormalised
 * varchar / text fields would be tech debt to migrate later.
 */
export interface HopCatalogEntry {
  id: string;
  name: string;
  origin: string | null;
  alpha_acid_typical: number | null;
  beta_acid_typical: number | null;
  hop_stability_index: number | null;
  usage_type: HopUsageType;
  form: HopForm;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
