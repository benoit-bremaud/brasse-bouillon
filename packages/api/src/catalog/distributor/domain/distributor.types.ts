/**
 * Domain shape for one distributor entry in the immutable
 * reference catalogue. Mirrors the `DistributorOrmEntity` row
 * shape one-to-one.
 *
 * **Distributor ≠ Producer**: a producer (issue #900) is the
 * brand owner — 1 product = 1 producer. A distributor (this
 * issue #901) is the entity that SELLS the product to the
 * brewer — 1 product = N distributors. The boutique 'Acheter'
 * button (#625) lets the brewer pick from the N distributors
 * who carry the exact catalogue entry, ranked by location,
 * currency, and (later) price.
 *
 * Linked to the 5 catalogue tables via M:N junction tables
 * (one per catalogue: hop_distributors, fermentable_distributors,
 * yeast_distributors, misc_template_distributors,
 * equipment_template_distributors), each carrying the
 * distributor-specific outbound URL + SKU + per-distributor
 * notes. See `packages/api/src/catalog/<x>/entities/<x>-distributor.orm.entity.ts`
 * for the junction shapes.
 */

export interface DistributorEntry {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 (uppercase ASCII), e.g. "FR", "BE", "US". */
  country: string;
  website: string;
  /**
   * JSON array of ISO 3166-1 alpha-2 country codes the
   * distributor ships to. Stored as a JSON-encoded string to
   * stay portable across SQLite (no native JSON column).
   * Application-side serialisation handles the encode/decode.
   */
  ships_to: string[];
  /** ISO 4217 currency code, e.g. "EUR", "USD", "GBP". */
  currency_default: string;
  /** Brewer-friendly description in French (UI-facing). */
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
