import { Injectable, Logger } from '@nestjs/common';

/**
 * OpenFoodFacts product payload — minimal shape we rely on. The real
 * response carries 100+ fields; we only declare the ones we read so
 * type drift on OFF's side does not break us.
 */
export interface OpenFoodFactsRawProduct {
  code?: string;
  product?: {
    product_name?: string;
    brands?: string;
    alcohol_by_volume_value?: number | string;
    categories_tags?: string[];
    image_url?: string;
  };
  status?: 0 | 1;
  status_verbose?: string;
}

/**
 * Result of a lookup. `payload` is the raw OFF response, kept so the
 * caller can stash it into `scan_catalog_items.raw_payload` for later
 * re-derivation if our parsing logic evolves.
 */
export interface OpenFoodFactsLookupResult {
  found: boolean;
  payload: OpenFoodFactsRawProduct;
  // Convenience-extracted fields (stable shape for our domain code).
  // `null` when the field is missing or unparseable on the OFF side.
  name: string | null;
  brewery: string | null;
  abv: number | null;
  isBeer: boolean;
}

const OPENFOODFACTS_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

const DEFAULT_TIMEOUT_MS = 5_000;
const USER_AGENT = 'brasse-bouillon/0.1 (https://brassebouillon.app)';

/**
 * OpenFoodFacts thin HTTP client.
 *
 * Stateless wrapper around `fetch` that hits OFF's public product
 * endpoint and normalises the response into the shape our domain
 * code wants. No retry, no backoff, no caching here — caching is
 * the caller's job (it lives in `scan_catalog_items` per Epic #693
 * part 3/5 and ADR-0004 hybrid storage principle). Retries can be
 * layered on later if OFF turns flaky in production.
 *
 * Error contract — two failure modes, two channels:
 *
 * - **Product genuinely missing from OFF** (200 OK with `status: 0`):
 *   surfaced via the return value as `{ found: false, ... }`. The
 *   caller treats this as "not in OFF" and decides between 404 and
 *   degraded cache reads.
 * - **Transport / upstream failure** (network down, timeout, non-2xx
 *   HTTP status, malformed JSON): **thrown** as `Error`. The caller
 *   wraps the call in `try/catch` and decides between 503 and
 *   degraded cache reads.
 *
 * This split lets the caller distinguish "OFF says no" from "OFF is
 * unreachable" without having to inspect error subtypes.
 */
@Injectable()
export class OpenFoodFactsClient {
  private readonly logger = new Logger(OpenFoodFactsClient.name);

  /**
   * Fetches a single product by EAN-13.
   *
   * @param ean — bare digits, no spaces or dashes. Validation is the
   *              caller's job (we hit OFF as-is).
   * @throws Error when OFF is unreachable or returns a non-JSON
   *         response. Use `result.found` for "no such product".
   */
  async lookupByBarcode(ean: string): Promise<OpenFoodFactsLookupResult> {
    const url = `${OPENFOODFACTS_BASE_URL}/product/${encodeURIComponent(ean)}.json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(
          `OpenFoodFacts HTTP ${response.status} for EAN ${ean}`,
        );
        throw new Error(
          `OpenFoodFacts upstream error: HTTP ${response.status}`,
        );
      }

      const payload = (await response.json()) as OpenFoodFactsRawProduct;

      const found = payload.status === 1 && payload.product != null;
      if (!found) {
        return {
          found: false,
          payload,
          name: null,
          brewery: null,
          abv: null,
          isBeer: false,
        };
      }

      return {
        found: true,
        payload,
        name: this.parseName(payload),
        brewery: this.parseBrewery(payload),
        abv: this.parseAbv(payload),
        isBeer: this.isBeerCategory(payload),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseName(payload: OpenFoodFactsRawProduct): string | null {
    const raw = payload.product?.product_name;
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private parseBrewery(payload: OpenFoodFactsRawProduct): string | null {
    const raw = payload.product?.brands;
    if (typeof raw !== 'string') return null;
    // OFF stores multiple brands comma-separated. We pick the first
    // for the canonical brewery field; the full string stays in
    // raw_payload for callers who want it.
    const first = raw.split(',')[0]?.trim();
    return first && first.length > 0 ? first : null;
  }

  private parseAbv(payload: OpenFoodFactsRawProduct): number | null {
    const raw = payload.product?.alcohol_by_volume_value;
    if (raw == null) return null;
    const num = typeof raw === 'string' ? Number.parseFloat(raw) : raw;
    return Number.isFinite(num) && num >= 0 && num <= 100 ? num : null;
  }

  private isBeerCategory(payload: OpenFoodFactsRawProduct): boolean {
    const tags = payload.product?.categories_tags;
    if (!Array.isArray(tags)) return false;
    return tags.some(
      (tag) =>
        typeof tag === 'string' &&
        (tag === 'en:beers' || tag.startsWith('en:beer')),
    );
  }
}
