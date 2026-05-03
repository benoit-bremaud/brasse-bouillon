/**
 * Aromatic role a hop variety plays in brewing recipes. Mirrors the
 * BeerXML 1.0 `<TYPE>` element (3 values) rather than the wider
 * BeerJSON enum (7 values with combinations) — the simpler set
 * matches the brewer mental model used by the picker UX without
 * losing fidelity for the demo recipes.
 *
 * Note: this is intentionally distinct from `RecipeHopType` in
 * `recipe/domain/enums/recipe-hop-type.enum.ts`, which despite its
 * name actually carries the BeerXML `<FORM>` (pellet / leaf /
 * extract). The new catalogue uses BeerXML semantics correctly —
 * see `HopForm` for the catalogue's form enum.
 */
export enum HopUsageType {
  BITTERING = 'bittering',
  AROMA = 'aroma',
  BOTH = 'both',
}
