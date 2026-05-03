/**
 * How readily a yeast strain settles out of suspension after
 * fermentation. Mirrors the BeerXML 1.0 `<FLOCCULATION>` element
 * (4 values), with the underscored `very_high` matching the
 * project's snake_case convention for multi-word enum values.
 *
 * Brewer interpretation:
 *   - LOW: stays in suspension, hazy beer (NEIPA, Hefeweizen)
 *   - MEDIUM: standard, beer clears in a week or two
 *   - HIGH: drops fast, very clear beer (US-05, S-04)
 *   - VERY_HIGH: drops within hours, may require rousing (WLP002)
 */
export enum YeastFlocculation {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}
