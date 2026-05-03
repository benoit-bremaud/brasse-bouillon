import { FermentableType } from './enums/fermentable-type.enum';

/**
 * Domain shape for one fermentable entry in the immutable reference
 * catalogue. Mirrors the database row shape one-to-one (see
 * `FermentableOrmEntity`) — kept as a separate interface so the
 * application / presentation layers do not import the ORM entity
 * directly.
 *
 * Producer / supplier relations are intentionally absent — they are
 * modelled as separate normalised tables in the follow-up
 * "normalize-producers" PR. Adding them here as denormalised
 * varchar would be tech debt to migrate later.
 */
export interface FermentableCatalogEntry {
  id: string;
  name: string;
  type: FermentableType;
  origin: string | null;
  color_ebc_typical: number | null;
  potential_gravity_typical: number | null;
  yield_percent_typical: number | null;
  diastatic_power_lintner: number | null;
  max_in_batch_percent: number | null;
  recommend_mash: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
