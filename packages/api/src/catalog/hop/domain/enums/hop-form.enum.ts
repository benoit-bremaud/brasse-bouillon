/**
 * Physical form a hop variety is typically sold as. Mirrors the
 * BeerXML 1.0 `<FORM>` element (3 values). The catalogue records
 * the most common / recommended form for each variety — per-recipe
 * usage may legitimately use a different form (a brewer who only
 * has Cascade leaf when the catalogue says pellet is normal).
 */
export enum HopForm {
  PELLET = 'pellet',
  PLUG = 'plug',
  LEAF = 'leaf',
}
