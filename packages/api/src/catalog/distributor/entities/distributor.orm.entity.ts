import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Immutable reference catalogue of brewing-product distributors
 * (Issue #901). Foundation for the boutique 'Acheter' button
 * (#625). Seeded with 12 entries spanning FR / BE / UK / US / DE
 * — the major homebrew shops that carry the catalogue products.
 *
 * **Distributor ≠ Producer**: a producer (#900) is the brand
 * owner (1 product = 1 producer); a distributor is the reseller
 * (1 product = N distributors). Producers live in `producers`
 * via 1:1 FK on each catalogue. Distributors live HERE and link
 * via M:N junction tables (one per catalogue, see
 * `<x>-distributor.orm.entity.ts`).
 *
 * Linked to the 5 catalogue tables via M:N junctions :
 *   - `hop_distributors`               (Citra → Yakima [producer] → Brewferm/Hopt/MaltMiller [distributors])
 *   - `fermentable_distributors`
 *   - `yeast_distributors`
 *   - `misc_template_distributors`
 *   - `equipment_template_distributors`
 *
 * Each junction row carries the distributor-specific
 * `product_url` (outbound deeplink to that shop's product page),
 * optional `sku`, and optional `notes_per_distributor`.
 */
@Entity('distributors')
@Index(['country'])
export class DistributorOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  /**
   * ISO 3166-1 alpha-2 country code (uppercase ASCII).
   * Migration applies a CHECK that enforces 2 ASCII letters.
   */
  @Column({ type: 'varchar', length: 2, nullable: false })
  country: string;

  /**
   * Distributor home page (e.g. `https://www.brouwland.com`).
   * Migration applies a CHECK that enforces `https://` prefix
   * — no `http://` (mixed-content risk on the mobile WebView)
   * and no relative URLs.
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  website: string;

  /**
   * JSON-encoded array of ISO 3166-1 alpha-2 codes the
   * distributor ships to (e.g. `'["FR","BE","LU","CH"]'`).
   * SQLite has no native JSON column so we store as TEXT and
   * serialise/deserialise application-side.
   */
  @Column({ type: 'text', nullable: false })
  ships_to: string;

  /**
   * Default currency the distributor advertises prices in
   * (ISO 4217, e.g. "EUR", "USD", "GBP"). The boutique button
   * uses this as a hint when surfacing N distributors so the
   * brewer can pick a price they understand.
   */
  @Column({ type: 'varchar', length: 3, nullable: false })
  currency_default: string;

  /** Brewer-friendly description in French (UI-facing). */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
