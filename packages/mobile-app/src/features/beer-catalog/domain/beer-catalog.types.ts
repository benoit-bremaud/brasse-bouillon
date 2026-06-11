/**
 * Mobile domain model for the beer catalogue (UC1 browse / UC2 search /
 * UC3 fiche). Conforms to the conception class diagram
 * `docs/architecture/diagrams/mobile-catalog/09-class-domain.md` — camelCase
 * mirror of the encyclopedia API contract after mapping. Types only, no logic.
 */

/**
 * Mirror of the API pagination envelope meta (`api/schemas/common.PaginationMeta`):
 * `perPage` ≡ `per_page`. Pages are 1-based; the client reads this to compute
 * the next page, it never sends it back.
 */
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
}

/** One mapped API page (`{items, meta}` envelope). */
export interface Page<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * List-level beer (browse + search rows). Carries the raw ADR-0017 interval
 * bounds only — derived scalars (midpoint, SRM→EBC) live in the view-model
 * layer, never here. `breweryName`/`styleName` are denormalised by the API
 * but currently null on list/search/detail (known divergence — only
 * `import-by-ean` resolves them); the view-model applies fallback labels.
 */
export interface CatalogBeer {
  id: string;
  slug: string;
  name: string;
  breweryId: string | null;
  styleId: string | null;
  breweryName: string | null;
  styleName: string | null;
  abv: number | null;
  ibuMin: number | null;
  ibuMax: number | null;
  srmMin: number | null;
  srmMax: number | null;
  description: string | null;
}

/** Full fiche (UC3) — the heavy fields the list rows do not need. */
export interface CatalogBeerDetail extends CatalogBeer {
  eanCode: string | null;
  legalDenomination: string | null;
  countryOfOrigin: string | null;
  allergens: string[] | null;
  alcoholGroup: number | null;
  isVerified: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Brewery fiche reached by tapping from the beer fiche.
 * `website` ≡ `BreweryRead.website_url` (renamed by the mapper).
 */
export interface CatalogBrewery {
  id: string;
  slug: string;
  name: string;
  breweryType: string | null;
  city: string | null;
  country: string | null;
  foundedYear: number | null;
  website: string | null;
  description: string | null;
}

/** Style fiche reached by tapping from the beer fiche. */
export interface CatalogStyle {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  family: string | null;
  abvMin: number | null;
  abvMax: number | null;
  ibuMin: number | null;
  ibuMax: number | null;
  srmMin: number | null;
  srmMax: number | null;
}
