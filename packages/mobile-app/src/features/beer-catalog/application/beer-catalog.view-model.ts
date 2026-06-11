/**
 * View-model builders — domain (nullable, raw bounds) → display-ready VMs,
 * per the conception view-model diagram (`mobile-catalog/10-class-view-model.md`):
 * derived scalars (interval midpoint, SRM→EBC) and fallback labels live HERE,
 * never in the domain. Reuses the exported scan helpers (`ebcToHex`,
 * `foregroundOnEbc`, `formatInterval`); `srmToEbc` and `intervalMidpoint`
 * are re-implemented locally (private to scan — algorithmic reuse, not an
 * import of a private symbol, per `mobile-catalog/11-data-flow.md`).
 */
import {
  ebcToHex,
  foregroundOnEbc,
} from "@/features/scan/application/lookup-color";
import { formatInterval } from "@/features/scan/application/lookup-formatters";

import type {
  CatalogBeer,
  CatalogBeerDetail,
  CatalogBrewery,
  CatalogStyle,
} from "@/features/beer-catalog/domain/beer-catalog.types";

export const BREWERY_FALLBACK_LABEL = "Brasserie inconnue";
export const STYLE_FALLBACK_LABEL = "Style inconnu";
export const EMPTY_VALUE_LABEL = "—";

const SOURCE_LABELS: Record<string, string> = {
  openfoodfacts: "Open Food Facts",
  internal: "Corpus interne",
  community: "Communauté",
};

export interface TapTargetVM {
  id: string;
  label: string;
  route: string;
}

export interface BeerListItemVM {
  id: string;
  title: string;
  subtitle: string;
  abvLabel: string;
  ibuLabel: string;
  heroColorHex: string;
  foregroundHex: string;
}

export interface LegalBlockVM {
  denomination: string | null;
  country: string | null;
  allergens: string[];
  alcoholGroupLabel: string | null;
}

export interface BeerDetailVM {
  title: string;
  breweryName: string;
  styleName: string;
  abvLabel: string;
  ibuLabel: string;
  colorLabel: string;
  heroColorHex: string;
  foregroundHex: string;
  description: string | null;
  legal: LegalBlockVM;
  isVerifiedBadge: boolean;
  sourceLabel: string | null;
  breweryTap: TapTargetVM | undefined;
  styleTap: TapTargetVM | undefined;
}

export interface BreweryFicheVM {
  title: string;
  typeLabel: string | null;
  locationLabel: string | null;
  foundedLabel: string | null;
  website: string | null;
  description: string | null;
}

export interface StyleFicheVM {
  title: string;
  categoryLabel: string | null;
  familyLabel: string | null;
  abvRangeLabel: string | null;
  ibuRangeLabel: string | null;
  colorRangeLabel: string | null;
}

/** Same formula as the scan feature (private there): SRM → EBC ≈ ×1.97. */
export function srmToEbc(srm: number | null): number | null {
  if (srm === null) {
    return null;
  }
  return Math.round(srm * 1.97);
}

/** Representative scalar of an ADR-0017 [min, max] interval (display only). */
export function intervalMidpoint(
  min: number | null,
  max: number | null,
): number | null {
  if (min === null) {
    return max;
  }
  if (max === null) {
    return min;
  }
  return Math.round((min + max) / 2);
}

/** French decimal comma without relying on Intl (Hermes-safe). */
function frDecimal(value: number): string {
  return String(value).replace(".", ",");
}

export function formatAbv(abv: number | null): string {
  return abv === null ? EMPTY_VALUE_LABEL : `${frDecimal(abv)} %`;
}

function heroColors(beer: CatalogBeer): {
  heroColorHex: string;
  foregroundHex: string;
} {
  const ebcMid = srmToEbc(intervalMidpoint(beer.srmMin, beer.srmMax));
  return {
    heroColorHex: ebcToHex(ebcMid),
    foregroundHex: foregroundOnEbc(ebcMid),
  };
}

export function toBeerListItemVM(beer: CatalogBeer): BeerListItemVM {
  const brewery = beer.breweryName ?? BREWERY_FALLBACK_LABEL;
  const style = beer.styleName ?? STYLE_FALLBACK_LABEL;
  return {
    id: beer.id,
    title: beer.name,
    subtitle: `${brewery} · ${style}`,
    abvLabel: formatAbv(beer.abv),
    ibuLabel:
      formatInterval(beer.ibuMin, beer.ibuMax, null) ?? EMPTY_VALUE_LABEL,
    ...heroColors(beer),
  };
}

export function toBeerDetailVM(beer: CatalogBeerDetail): BeerDetailVM {
  const ebcRange = formatInterval(
    srmToEbc(beer.srmMin),
    srmToEbc(beer.srmMax),
    null,
  );
  return {
    title: beer.name,
    breweryName: beer.breweryName ?? BREWERY_FALLBACK_LABEL,
    styleName: beer.styleName ?? STYLE_FALLBACK_LABEL,
    abvLabel: formatAbv(beer.abv),
    ibuLabel:
      formatInterval(beer.ibuMin, beer.ibuMax, null) ?? EMPTY_VALUE_LABEL,
    colorLabel: ebcRange === null ? EMPTY_VALUE_LABEL : `EBC ${ebcRange}`,
    ...heroColors(beer),
    description: beer.description,
    legal: {
      denomination: beer.legalDenomination,
      country: beer.countryOfOrigin,
      allergens: beer.allergens ?? [],
      alcoholGroupLabel:
        beer.alcoholGroup === null ? null : `Groupe ${beer.alcoholGroup}`,
    },
    isVerifiedBadge: beer.isVerified,
    sourceLabel: SOURCE_LABELS[beer.source] ?? null,
    breweryTap:
      beer.breweryId === null
        ? undefined
        : {
            id: beer.breweryId,
            label: beer.breweryName ?? BREWERY_FALLBACK_LABEL,
            route: `/(app)/beer-catalog/brewery/${encodeURIComponent(beer.breweryId)}`,
          },
    styleTap:
      beer.styleId === null
        ? undefined
        : {
            id: beer.styleId,
            label: beer.styleName ?? STYLE_FALLBACK_LABEL,
            route: `/(app)/beer-catalog/style/${encodeURIComponent(beer.styleId)}`,
          },
  };
}

export function toBreweryFicheVM(brewery: CatalogBrewery): BreweryFicheVM {
  const location = [brewery.city, brewery.country]
    .map((part) => part?.trim() ?? "")
    .filter((part) => part !== "")
    .join(", ");
  return {
    title: brewery.name,
    typeLabel: brewery.breweryType,
    locationLabel: location === "" ? null : location,
    foundedLabel:
      brewery.foundedYear === null ? null : `Fondée en ${brewery.foundedYear}`,
    website: brewery.website,
    description: brewery.description,
  };
}

export function toStyleFicheVM(style: CatalogStyle): StyleFicheVM {
  const abvRange = formatInterval(style.abvMin, style.abvMax, null);
  const ebcRange = formatInterval(
    srmToEbc(style.srmMin),
    srmToEbc(style.srmMax),
    null,
  );
  return {
    title: style.name,
    categoryLabel: style.category,
    familyLabel: style.family,
    abvRangeLabel:
      abvRange === null ? null : `${abvRange.replaceAll(".", ",")} %`,
    ibuRangeLabel: formatInterval(style.ibuMin, style.ibuMax, null),
    colorRangeLabel: ebcRange === null ? null : `EBC ${ebcRange}`,
  };
}
