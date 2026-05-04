/**
 * Domain types for the distributor catalogue (Issue #901).
 *
 * **Distributor ≠ Producer**: a producer (issue #900) is the
 * brand owner — 1 product = 1 producer. A distributor is the
 * entity that SELLS the product to the brewer — 1 product = N
 * distributors. The boutique 'Acheter' button (#625) lets the
 * brewer pick from the N distributors who carry the exact
 * catalogue entry, ranked by location, currency, and (later)
 * price.
 *
 * Linked to the 5 catalogue tables via M:N junction tables
 * (one per catalogue : `hop_distributors`,
 * `fermentable_distributors`, `yeast_distributors`,
 * `misc_template_distributors`,
 * `equipment_template_distributors`), each carrying the
 * distributor-specific outbound URL + SKU + per-distributor
 * notes. See `packages/api/src/catalog/<x>/entities/<x>-distributor.orm.entity.ts`
 * for the junction shapes.
 *
 * **Note** : no `DistributorEntry` domain interface is exported
 * here yet — the ORM entity (`DistributorOrmEntity`) and the
 * wire DTO (`DistributorDto`) cover the read paths today.
 * Adding a domain-layer shape would currently be dead code
 * (Copilot catch on PR #908 review). The interface lands when
 * an actual application-layer use case needs to round-trip
 * through a non-ORM shape (e.g. boutique UI builders, future
 * write paths).
 */
export {};
