/**
 * Brewing yeast categories for the catalogue. Adapted from BeerXML
 * 1.0 (which lists 5 values including the wine / champagne entries
 * irrelevant for a beer-focused app) and broadened beyond the
 * existing `RecipeYeastType` (ale / lager / wild / brett) to add
 * the WHEAT category every demo recipe needs (Hefeweizen, Witbier).
 *
 * Mapping rationale:
 *   - ALE: top-fermenting Saccharomyces cerevisiae standard ales
 *   - LAGER: bottom-fermenting Saccharomyces pastorianus lagers
 *   - WHEAT: Hefeweizen / Weizen / Witbier strains with strong
 *     phenolic + ester profile (e.g. Wyeast 3068)
 *   - WILD: Brettanomyces / Lactobacillus / Pediococcus + any
 *     funky / sour culture (folds the existing BRETT into a
 *     superset that also covers sours)
 *
 * Wine and champagne values from BeerXML are intentionally absent
 * — out of scope for a beer-focused catalogue.
 */
export enum YeastType {
  ALE = 'ale',
  LAGER = 'lager',
  WHEAT = 'wheat',
  WILD = 'wild',
}
