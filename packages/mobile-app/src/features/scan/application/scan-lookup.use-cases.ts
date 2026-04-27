/**
 * Use-case for the scan lookup flow (Epic #594 chunk #1, mobile
 * counterpart of backend issue #696).
 *
 * Orchestrates:
 * - The data-source toggle (`dataSource.useDemoData` → return a
 *   demo entry, otherwise hit the real backend).
 * - Barcode normalisation (trim + strip non-digits) so a barcode
 *   coming from a manual entry / paste does not surprise the API.
 * - Domain-level guard rails (empty input, etc.) before touching
 *   the network.
 *
 * Does NOT handle UI concerns (loading state, toast messages):
 * those belong to the presentation layer (#698).
 */
import { dataSource } from "@/core/data/data-source";
import { HttpError } from "@/core/http/http-error";
import { lookupBeerByBarcode as fetchLookupFromApi } from "@/features/scan/data/scan-lookup.api";
import type { ScanLookupResult } from "@/features/scan/domain/scan.types";
import { buildDemoLookupResult, demoScanCatalog } from "@/mocks/demo-data";

/**
 * Inclusive digit-count window the backend accepts on `/scan/lookup/:ean`
 * (`^\d{8,14}$` per `ScanDomainService.validateBarcode`). Mirrored here so
 * the use-case can fail fast on obviously malformed input (empty string,
 * a few digits typed by mistake, a long alphanumeric paste) before
 * burning a network round-trip.
 */
const BARCODE_MIN_LENGTH = 8;
const BARCODE_MAX_LENGTH = 14;

/**
 * Error thrown when the caller passes a barcode that cannot match the
 * backend contract (empty after normalisation, fewer than 8 digits, or
 * more than 14). The data layer would also reject these, but failing
 * fast at the use-case layer keeps a useless network round-trip from
 * happening and lets the presentation layer surface a precise error
 * message instead of a generic 4xx from the API.
 */
export class ScanLookupInvalidBarcodeError extends Error {
  constructor(barcode: string) {
    super(
      `Cannot lookup an invalid barcode (received: "${barcode.slice(0, 32)}").`,
    );
    this.name = "ScanLookupInvalidBarcodeError";
  }
}

/**
 * Error thrown when the lookup endpoint cannot resolve the barcode
 * (404 from backend) — barcode unknown to OpenFoodFacts AND absent
 * from the local catalogue. Distinct from a transport failure.
 */
export class ScanLookupBeerNotFoundError extends Error {
  constructor(public readonly barcode: string) {
    super(`Beer not found for barcode "${barcode}".`);
    this.name = "ScanLookupBeerNotFoundError";
  }
}

/**
 * Error thrown when OpenFoodFacts is unreachable AND the local
 * catalogue is empty (backend 503). The presentation layer should
 * surface a "try again later" message and keep the camera ready
 * for a retry.
 */
export class ScanLookupServiceUnavailableError extends Error {
  constructor(public readonly barcode: string) {
    super(`Scan lookup is temporarily unavailable for barcode "${barcode}".`);
    this.name = "ScanLookupServiceUnavailableError";
  }
}

function normaliseBarcode(input: string): string {
  return input.trim().replace(/\D/g, "");
}

/**
 * Resolves a beer by EAN/UPC barcode.
 *
 * @throws {ScanLookupInvalidBarcodeError} when the normalised barcode
 *         contains fewer than 8 digits or more than 14 (the backend
 *         contract). Empty input and non-digit-only input both fall in
 *         this case after normalisation.
 * @throws {ScanLookupBeerNotFoundError} when the backend reports 404.
 * @throws {ScanLookupServiceUnavailableError} when the backend
 *         reports 503 (OFF unreachable + no local cache).
 * @throws {HttpError} for any other transport / authorisation
 *         failure (401, 429, 500, etc.) — caller decides how to
 *         react.
 */
export async function lookupBeerByBarcode(
  rawBarcode: string,
): Promise<ScanLookupResult> {
  const barcode = normaliseBarcode(rawBarcode);
  if (
    barcode.length < BARCODE_MIN_LENGTH ||
    barcode.length > BARCODE_MAX_LENGTH
  ) {
    throw new ScanLookupInvalidBarcodeError(rawBarcode);
  }

  if (dataSource.useDemoData) {
    const demoItem = demoScanCatalog[barcode];
    if (!demoItem) {
      throw new ScanLookupBeerNotFoundError(barcode);
    }
    return buildDemoLookupResult(demoItem);
  }

  try {
    return await fetchLookupFromApi(barcode);
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 404) {
        throw new ScanLookupBeerNotFoundError(barcode);
      }
      if (error.status === 503) {
        throw new ScanLookupServiceUnavailableError(barcode);
      }
    }
    throw error;
  }
}
