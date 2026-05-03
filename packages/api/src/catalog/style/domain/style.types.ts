import { StyleType } from './enums/style-type.enum';

/**
 * Domain shape for one BJCP style entry in the immutable reference
 * catalogue. Mirrors the database row shape one-to-one (see
 * `StyleOrmEntity`) — kept as a separate interface so the
 * application / presentation layers do not import the ORM entity
 * directly.
 *
 * The 6 BJCP metric dimensions (OG / FG / IBU / colour /
 * carbonation / ABV) each ship as a min/max pair so the picker
 * UX can highlight when a recipe's actual metrics fall outside
 * the style's expected range.
 */
export interface StyleCatalogEntry {
  id: string;
  name: string;
  category: string;
  category_number: number;
  style_letter: string;
  style_guide: string;
  type: StyleType;
  og_min: number | null;
  og_max: number | null;
  fg_min: number | null;
  fg_max: number | null;
  ibu_min: number | null;
  ibu_max: number | null;
  color_ebc_min: number | null;
  color_ebc_max: number | null;
  carb_min: number | null;
  carb_max: number | null;
  abv_min: number | null;
  abv_max: number | null;
  notes: string | null;
  profile: string | null;
  ingredients: string | null;
  examples: string | null;
  created_at: Date;
  updated_at: Date;
}
