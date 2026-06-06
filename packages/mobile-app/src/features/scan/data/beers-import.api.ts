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
import { HttpError } from "@/core/http/http-error";

import type {
  ScanCatalogItem,
  ScanCatalogItemOrigin,
  ScanLookupResult,
  ScanLookupSource,
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
interface PythonBeerReadDto {
  id: string;
  name: string;
  slug: string;
  brewery_id: string | null;
  style_id: string | null;
  // Denormalised names resolved server-side from the FKs
  // (07-class-api-contract); null when the FK/relation is unresolved.
  brewery_name: string | null;
  style_name: string | null;
  abv: string | null; // Pydantic Decimal serialises as string
  // ADR-0017: IBU and colour are stored as min/max intervals
  // (min === max when the value is exactly known).
  ibu_min: number | null;
  ibu_max: number | null;
  srm_min: number | null;
  srm_max: number | null;
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
}

/**
 * Window during which a row whose `created_at` is "now-ish" is treated
 * as a freshly imported one (cache_miss_fetched). The Python endpoint
 * does not return its HTTP status (200 vs 201) through the response
 * body, so we lean on this heuristic. Generous enough to absorb clock
 * skew and the round-trip latency, narrow enough to avoid mislabelling
 * older DB rows.
 */
const FRESH_IMPORT_WINDOW_MS = 5_000;

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

/**
 * Representative single value for an ADR-0017 [min, max] interval. The
 * bucket formatters (bitterness/colour words) and the recipe-matching
 * scorer work on a scalar, so we collapse the interval to its rounded
 * midpoint; the bounds themselves are preserved separately for display.
 */
function intervalMidpoint(
  min: number | null,
  max: number | null,
): number | null {
  if (min === null || min === undefined) {
    return max ?? null;
  }
  if (max === null || max === undefined) {
    return min;
  }
  return Math.round((min + max) / 2);
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

/**
 * Best-effort guess of whether the Python endpoint just imported the
 * beer (HTTP 201) versus served an existing DB row (HTTP 200). We
 * cannot read the status from the response body, so we infer from
 * `created_at`: a row whose creation timestamp is within
 * `FRESH_IMPORT_WINDOW_MS` of "now" is almost certainly the result of
 * the very import we just triggered.
 */
function inferLookupSource(dto: PythonBeerReadDto): ScanLookupSource {
  const createdAtMs = Date.parse(dto.created_at);
  if (Number.isFinite(createdAtMs)) {
    const ageMs = Date.now() - createdAtMs;
    if (ageMs >= 0 && ageMs <= FRESH_IMPORT_WINDOW_MS) {
      return "cache_miss_fetched";
    }
  }
  return "cache_hit_fresh";
}

/**
 * Display placeholders used when the server could not resolve a brewery
 * or style name. Exported so consumers (e.g. recipe matching) can treat
 * them as "absent" instead of feeding the literal placeholder text into
 * an algorithm that would mistake it for a real value.
 */
export const SCAN_BREWERY_PLACEHOLDER = "Brasserie inconnue";
export const SCAN_STYLE_PLACEHOLDER = "Style inconnu";

function mapPythonBeerToCatalogItem(
  dto: PythonBeerReadDto,
  ean: string,
): ScanCatalogItem {
  return {
    id: dto.id,
    barcode: ean,
    name: dto.name,
    // Brewery / style names are resolved server-side from the FKs
    // (07-class-api-contract). Fall back to a placeholder only when the
    // server could not resolve one (FK null or relation missing).
    brewery: dto.brewery_name ?? SCAN_BREWERY_PLACEHOLDER,
    style: dto.style_name ?? SCAN_STYLE_PLACEHOLDER,
    abv: dto.abv === null ? null : Number(dto.abv),
    // Scalar = representative midpoint (formatters/scoring); bounds kept
    // for range display (ADR-0017).
    ibu: intervalMidpoint(dto.ibu_min, dto.ibu_max),
    ibuMin: dto.ibu_min,
    ibuMax: dto.ibu_max,
    colorEbc: srmToEbc(intervalMidpoint(dto.srm_min, dto.srm_max)),
    colorEbcMin: srmToEbc(dto.srm_min),
    colorEbcMax: srmToEbc(dto.srm_max),
    fermentationType: "",
    aromaticTags: null,
    notesSource: dto.description,
    isAbvEstimated: false,
    // IBU is the raw value: a true range (min !== max) is an estimate, an
    // exact single value is not. EBC differs on purpose — it is always an
    // estimate when present, being an approximate SRM→EBC conversion
    // (×1.97, rounded), regardless of whether the SRM bounds coincide.
    isIbuEstimated: dto.ibu_min !== null && dto.ibu_min !== dto.ibu_max,
    isColorEbcEstimated: dto.srm_min !== null,
    isStyleEstimated: true,
    origin: mapPythonSourceToOrigin(dto.source),
    // BeerRead does not expose the OFF fetch timestamp; `updated_at`
    // changes on any row update (including community edits) so it
    // would fabricate freshness metadata. Surface null until the
    // server adds an explicit `last_fetched_at` field.
    fetchedAt: null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

/**
 * Call the Python beer-encyclopedia to resolve a barcode, importing
 * from Open Food Facts on first occurrence. Returns a
 * `ScanLookupResult`. Brewery and style names are resolved server-side
 * (07-class-api-contract); the `item` still carries placeholders for the
 * fields Python does not yet expose (fermentation type, aromatic tags).
 * The presentation layer should render the fiche in a
 * degraded-but-functional state until the remaining enrichment ships.
 *
 * Throws (for the use-case to translate):
 * - HttpError 503 — `EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL` is not
 *   configured (default `http://localhost:8000` would silently fail
 *   on physical devices). Fail fast instead of timing out.
 * - HttpError 404 — the EAN is unknown to both Python DB and OFF
 * - HttpError 503 — OFF transport / payload / seed-state failure
 * - HttpError 4xx/5xx — other unexpected backend conditions
 */
export async function importBeerByEan(ean: string): Promise<ScanLookupResult> {
  // Codex P1 #871: when the env var is absent, the bundle would fall
  // back to `http://localhost:8000` — meaningful only on a host that
  // happens to also run the encyclopedia (web preview from the dev
  // PC). On a physical device or production build, that URL resolves
  // to the device itself and times out. Surface a clean 503 the
  // use-case already knows how to translate, instead of leaking a
  // raw network error to the UI.
  if (!env.encyclopediaUrlIsConfigured) {
    throw new HttpError(
      503,
      "Beer encyclopedia backend not configured (EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL).",
      null,
    );
  }
  const dto = await request<PythonBeerReadDto>("/beers/import-by-ean", {
    method: "POST",
    body: { ean },
    auth: false, // Python backend is currently unauthenticated.
    baseUrl: env.encyclopediaUrl,
  });
  const item = mapPythonBeerToCatalogItem(dto, ean);
  return {
    item,
    source: inferLookupSource(dto),
    // Python persists the raw OFF payload in `EntitySource.raw_data`
    // for every `openfoodfacts` import (PR #847). Internal / community
    // sources never carry an upstream payload, so gate on origin.
    rawPayloadAvailable: dto.source === "openfoodfacts",
  };
}
