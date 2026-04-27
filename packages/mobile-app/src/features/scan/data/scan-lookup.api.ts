/**
 * Data layer for the backend `GET /scan/lookup/:ean` endpoint
 * (Epic #594 chunk #1, mobile counterpart of Issue #696).
 *
 * Per Clean Architecture, this file contains only the HTTP call and
 * the snake_case → camelCase mapping. Use-case orchestration (demo
 * data branching, error handling for the UI, retry logic) lives in
 * `application/scan-lookup.use-cases.ts`.
 */
import { request } from "@/core/http/http-client";

import type {
  ScanCatalogItem,
  ScanCatalogItemOrigin,
  ScanLookupResult,
  ScanLookupSource,
} from "../domain/scan.types";

/**
 * Wire shape returned by the backend. snake_case fields, no nested
 * camelCase. Keep this `type` private to the module so consumers
 * always go through `ScanLookupResult` from the domain.
 */
type ScanCatalogItemDto = {
  id: string;
  barcode: string;
  name: string;
  brewery: string;
  style: string;
  abv?: number | null;
  ibu?: number | null;
  color_ebc?: number | null;
  fermentation_type: string;
  aromatic_tags?: string | null;
  notes_source?: string | null;
  is_abv_estimated: boolean;
  is_ibu_estimated: boolean;
  is_color_ebc_estimated: boolean;
  is_style_estimated: boolean;
  source: ScanCatalogItemOrigin;
  fetched_at?: string | null;
  created_at: string;
  updated_at: string;
};

type ScanLookupResultDto = {
  item: ScanCatalogItemDto;
  source: ScanLookupSource;
  rawPayloadAvailable: boolean;
};

function mapItem(dto: ScanCatalogItemDto): ScanCatalogItem {
  return {
    id: dto.id,
    barcode: dto.barcode,
    name: dto.name,
    brewery: dto.brewery,
    style: dto.style,
    abv: dto.abv ?? null,
    ibu: dto.ibu ?? null,
    colorEbc: dto.color_ebc ?? null,
    fermentationType: dto.fermentation_type,
    aromaticTags: dto.aromatic_tags ?? null,
    notesSource: dto.notes_source ?? null,
    isAbvEstimated: dto.is_abv_estimated,
    isIbuEstimated: dto.is_ibu_estimated,
    isColorEbcEstimated: dto.is_color_ebc_estimated,
    isStyleEstimated: dto.is_style_estimated,
    origin: dto.source,
    fetchedAt: dto.fetched_at ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapResult(dto: ScanLookupResultDto): ScanLookupResult {
  return {
    item: mapItem(dto.item),
    source: dto.source,
    rawPayloadAvailable: dto.rawPayloadAvailable,
  };
}

/**
 * Resolves a beer by EAN-13 against the backend lookup endpoint.
 *
 * The backend is cache-first: seed and manual entries never expire,
 * OpenFoodFacts entries respect a 1-hour TTL. On cache miss the
 * backend hits OpenFoodFacts, persists the response, and returns
 * the freshly inserted row. See backend issue #696 / PR #729 for
 * the full contract.
 *
 * Errors surface as `HttpError` from the shared HTTP client:
 * - 401 — missing or invalid JWT (caller should redirect to auth)
 * - 404 — barcode unknown to OpenFoodFacts and not in the local
 *   catalogue (caller can offer manual entry / contribution)
 * - 503 — OpenFoodFacts unreachable AND no cache row to fall back
 *   on (caller should ask the user to retry)
 * - 429 — rate limited (backend caps at 30 req/min/IP); caller
 *   should back off
 */
export async function lookupBeerByBarcode(
  ean: string,
): Promise<ScanLookupResult> {
  const dto = await request<ScanLookupResultDto>(
    `/scan/lookup/${encodeURIComponent(ean)}`,
  );
  return mapResult(dto);
}
