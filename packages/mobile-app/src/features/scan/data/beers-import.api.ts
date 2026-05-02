/**
 * Data layer for the Python beer-encyclopedia
 * `POST /beers/import-by-ean` endpoint (PR #847 + #848).
 *
 * Targets the **knowledge-base** backend (`env.encyclopediaUrl`),
 * not the NestJS product backend. See ADR-0005 for the split.
 *
 * Per Clean Architecture, this file contains only the HTTP call and
 * the snake_case → ScanCatalogItem mapping. Use-case orchestration
 * (when to call this fallback, error handling for the UI) lives in
 * `application/scan-lookup.use-cases.ts`.
 */
import { env } from "@/core/config/env";
import { request } from "@/core/http/http-client";

import type {
  ScanCatalogItem,
  ScanCatalogItemOrigin,
  ScanLookupResult,
} from "../domain/scan.types";

/**
 * Wire shape returned by the Python beer-encyclopedia.
 *
 * Mirrors `BeerRead` from `packages/beer-encyclopedia/api/schemas/beer.py`.
 * The schema is intentionally richer than NestJS `scan_catalog_items`
 * (legal_denomination, allergens, country_of_origin, alcohol_group)
 * but does NOT include a denormalised brewery name or style name —
 * only the foreign-key UUIDs. We accept this degraded mapping for now
 * (TODO: enrich `BeerRead` server-side with brewery_name + style_name
 * before the NestJS deprecation step of ADR-0005's roadmap).
 */
type PythonBeerReadDto = {
  id: string;
  name: string;
  slug: string;
  brewery_id: string | null;
  style_id: string | null;
  abv: string | null; // Pydantic Decimal serialises as string
  ibu: number | null;
  srm: number | null;
  description: string | null;
  is_active: boolean;
  is_verified: boolean;
  source: "openfoodfacts" | "internal" | "community";
  ean_code: string | null;
  legal_denomination: string | null;
  country_of_origin: string | null;
  allergens: string[] | null;
  alcohol_group: number | null;
  created_at: string;
  updated_at: string;
};

/**
 * Conservative SRM → EBC conversion (EBC ≈ SRM × 1.97). The Python
 * model exposes SRM (Standard Reference Method, US) while NestJS
 * `scan_catalog_items` exposes EBC (European Brewery Convention).
 * Conversion is approximate; we round to the nearest integer to
 * match the column type and avoid suggesting false precision.
 */
function srmToEbc(srm: number | null): number | null {
  if (srm === null || srm === undefined) {
    return null;
  }
  return Math.round(srm * 1.97);
}

function mapPythonSourceToOrigin(
  source: PythonBeerReadDto["source"],
): ScanCatalogItemOrigin {
  if (source === "openfoodfacts") {
    return "openfoodfacts";
  }
  if (source === "internal") {
    return "seed";
  }
  // community → represent as "manual" for now (closest NestJS analogue)
  return "manual";
}

function mapPythonBeerToCatalogItem(
  dto: PythonBeerReadDto,
  ean: string,
): ScanCatalogItem {
  return {
    id: dto.id,
    barcode: ean,
    name: dto.name,
    // Brewery / style names live in separate Python tables. Until
    // BeerRead is enriched server-side we surface a placeholder.
    brewery: "Brasserie inconnue",
    style: "Style inconnu",
    abv: dto.abv === null ? null : Number(dto.abv),
    ibu: dto.ibu,
    colorEbc: srmToEbc(dto.srm),
    fermentationType: "",
    aromaticTags: null,
    notesSource: dto.description,
    isAbvEstimated: false,
    isIbuEstimated: false,
    isColorEbcEstimated: dto.srm !== null,
    isStyleEstimated: true,
    origin: mapPythonSourceToOrigin(dto.source),
    fetchedAt: dto.updated_at,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/**
 * Call the Python beer-encyclopedia to resolve a barcode, importing
 * from Open Food Facts on first occurrence. Returns a
 * `ScanLookupResult` whose `item` carries placeholders for the fields
 * Python does not yet expose (brewery name, style name,
 * fermentation type, aromatic tags). The presentation layer should
 * render the fiche in a degraded-but-functional state until the
 * server-side enrichment ships.
 *
 * Throws (for the use-case to translate):
 * - HttpError 404 — the EAN is unknown to both Python DB and OFF
 * - HttpError 503 — OFF transport / payload / seed-state failure
 * - HttpError 4xx/5xx — other unexpected backend conditions
 */
export async function importBeerByEan(ean: string): Promise<ScanLookupResult> {
  const dto = await request<PythonBeerReadDto>("/beers/import-by-ean", {
    method: "POST",
    body: { ean },
    auth: false, // Python backend is currently unauthenticated.
    baseUrl: env.encyclopediaUrl,
  });
  const item = mapPythonBeerToCatalogItem(dto, ean);
  return {
    item,
    // Python's "import-by-ean" semantically straddles the existing
    // NestJS source values: a 200 (DB hit) ≈ cache_hit_fresh, a 201
    // (OFF first-time fetch) ≈ cache_miss_fetched. We cannot
    // distinguish the two without inspecting the HTTP status code
    // (the wrapper returns the body only). Default to
    // "cache_miss_fetched" since this fallback only fires after a
    // NestJS 404 — meaning the row was likely just imported.
    source: "cache_miss_fetched",
    rawPayloadAvailable: false,
  };
}
