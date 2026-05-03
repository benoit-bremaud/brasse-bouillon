/**
 * Beer style families for the BJCP catalogue. Mirrors BeerXML 1.0
 * `<TYPE>` (which lists 6 values including Cider — out of scope
 * for a beer-focused app):
 *
 *   - LAGER: bottom-fermented, cold-conditioned styles
 *     (Pilsner, Bock, Vienna, Baltic Porter)
 *   - ALE: top-fermented styles (IPA, Stout, Belgian, Saison,
 *     ESB, Wee Heavy)
 *   - WHEAT: wheat-forward styles fermented with specialty wheat
 *     yeast (Witbier, Hefeweizen, American Wheat)
 *   - MIXED: hybrid fermentation profile (California Common,
 *     Kölsch when not classified ALE)
 *   - MEAD: honey-based fermentation — kept for completeness
 *     even though no demo entry uses it yet
 *
 * BeerXML's CIDER value is intentionally absent (out of scope).
 */
export enum StyleType {
  LAGER = 'lager',
  ALE = 'ale',
  WHEAT = 'wheat',
  MIXED = 'mixed',
  MEAD = 'mead',
}
