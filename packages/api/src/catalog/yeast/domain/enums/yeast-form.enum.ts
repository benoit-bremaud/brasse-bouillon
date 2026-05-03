/**
 * Physical form a yeast strain is sold as. Mirrors the BeerXML 1.0
 * `<FORM>` element (4 values). Liquid and dry cover the
 * homebrewer's day-to-day; slant and culture are kept for advanced
 * users who maintain a yeast bank.
 */
export enum YeastForm {
  LIQUID = 'liquid',
  DRY = 'dry',
  SLANT = 'slant',
  CULTURE = 'culture',
}
