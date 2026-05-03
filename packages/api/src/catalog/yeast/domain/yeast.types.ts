import { YeastFlocculation } from './enums/yeast-flocculation.enum';
import { YeastForm } from './enums/yeast-form.enum';
import { YeastType } from './enums/yeast-type.enum';

/**
 * Domain shape for one yeast entry in the immutable reference
 * catalogue. Mirrors the database row shape one-to-one (see
 * `YeastOrmEntity`) — kept as a separate interface so the
 * application / presentation layers do not import the ORM entity
 * directly.
 *
 * `laboratory` and `product_id` are kept as direct varchar columns
 * (not normalised) because each catalogue row represents a SPECIFIC
 * lab product (1:1, not N:N). The future "normalize-producers" PR
 * may add an optional `laboratory_id` FK referencing a `producers`
 * table, but the textual fields stay as the brewer-recognisable
 * identifier (US-05, WLP002, 1056).
 */
export interface YeastCatalogEntry {
  id: string;
  name: string;
  type: YeastType;
  form: YeastForm;
  laboratory: string | null;
  product_id: string | null;
  min_temperature_c: number | null;
  max_temperature_c: number | null;
  flocculation: YeastFlocculation | null;
  attenuation_percent_typical: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
