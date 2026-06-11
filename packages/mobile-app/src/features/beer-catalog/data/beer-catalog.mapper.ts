/**
 * Pure mappers: encyclopedia snake_case DTOs → camelCase domain types.
 * Conforms to `docs/architecture/diagrams/mobile-catalog/11-data-flow.md`:
 * `abv` (Pydantic Decimal serialised as string) is parsed to number, the
 * ADR-0017 interval bounds are carried as-is, and null names stay null —
 * fallback labels are a view-model concern, the domain stays truthful.
 * DTO shapes are duplicated from scan on purpose (different target types).
 */
import type {
  CatalogBeer,
  CatalogBeerDetail,
  CatalogBrewery,
  CatalogStyle,
  Page,
} from "@/features/beer-catalog/domain/beer-catalog.types";

export interface BeerReadDto {
  id: string;
  name: string;
  slug: string;
  brewery_id: string | null;
  style_id: string | null;
  brewery_name: string | null;
  style_name: string | null;
  abv: string | null;
  ibu_min: number | null;
  ibu_max: number | null;
  srm_min: number | null;
  srm_max: number | null;
  description: string | null;
  is_active: boolean;
  is_verified: boolean;
  source: string;
  ean_code: string | null;
  legal_denomination: string | null;
  country_of_origin: string | null;
  allergens: string[] | null;
  alcohol_group: number | null;
  created_at: string;
  updated_at: string;
}

export interface BreweryReadDto {
  id: string;
  name: string;
  slug: string;
  brewery_type: string | null;
  city: string | null;
  country: string | null;
  founded_year: number | null;
  website_url: string | null;
  description: string | null;
}

export interface StyleReadDto {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  family: string | null;
  abv_min: string | null;
  abv_max: string | null;
  ibu_min: number | null;
  ibu_max: number | null;
  srm_min: number | null;
  srm_max: number | null;
}

/** `{items, meta}` list envelope — NOT wrapped in `{data}` by this API. */
export interface PageDto<TItem> {
  items: TItem[];
  meta: { total: number; page: number; per_page: number };
}

/** Decimal-as-string → number; null, empty and unparsable input stay null. */
export function toNumber(value: string | null): number | null {
  if (value === null || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function mapBeer(dto: BeerReadDto): CatalogBeer {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    breweryId: dto.brewery_id,
    styleId: dto.style_id,
    breweryName: dto.brewery_name,
    styleName: dto.style_name,
    abv: toNumber(dto.abv),
    ibuMin: dto.ibu_min,
    ibuMax: dto.ibu_max,
    srmMin: dto.srm_min,
    srmMax: dto.srm_max,
    description: dto.description,
  };
}

export function mapBeerDetail(dto: BeerReadDto): CatalogBeerDetail {
  return {
    ...mapBeer(dto),
    eanCode: dto.ean_code,
    legalDenomination: dto.legal_denomination,
    countryOfOrigin: dto.country_of_origin,
    allergens: dto.allergens,
    alcoholGroup: dto.alcohol_group,
    isVerified: dto.is_verified,
    source: dto.source,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapBrewery(dto: BreweryReadDto): CatalogBrewery {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    breweryType: dto.brewery_type,
    city: dto.city,
    country: dto.country,
    foundedYear: dto.founded_year,
    // Rename, not just a casing change: website ≡ BreweryRead.website_url.
    website: dto.website_url,
    description: dto.description,
  };
}

export function mapStyle(dto: StyleReadDto): CatalogStyle {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    category: dto.category,
    family: dto.family,
    abvMin: toNumber(dto.abv_min),
    abvMax: toNumber(dto.abv_max),
    ibuMin: dto.ibu_min,
    ibuMax: dto.ibu_max,
    srmMin: dto.srm_min,
    srmMax: dto.srm_max,
  };
}

export function mapPage<TDto, T>(
  dto: PageDto<TDto>,
  mapItem: (item: TDto) => T,
): Page<T> {
  return {
    items: dto.items.map(mapItem),
    meta: {
      total: dto.meta.total,
      page: dto.meta.page,
      perPage: dto.meta.per_page,
    },
  };
}
