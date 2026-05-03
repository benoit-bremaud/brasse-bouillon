import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProducerType } from '../domain/producer.types';

/**
 * Immutable reference catalogue of brewing-product producers
 * (Issue #900). Closes the design debt documented in every
 * Phase 1-3 catalogue entity ("deferred to normalize-producers
 * PR after Phase 3"). Seeded with ~16 entries spanning the 5
 * producer types — the major brands every homebrewer
 * encounters in the catalogue.
 *
 * **Producer ≠ Distributor**: a producer is the brand owner
 * (1 product = 1 producer); a distributor is the reseller
 * (1 product = N distributors). Distributors live in a
 * separate table introduced by issue #901 and power the
 * boutique 'Acheter' button. Keep the two distinct.
 *
 * Referenced by 5 catalogue tables via nullable FK
 * `producer_id` (ON DELETE SET NULL):
 *   - hops
 *   - fermentables
 *   - yeasts — added ALONGSIDE the existing `laboratory`
 *     varchar + `product_id` varchar columns (PR #890), NOT
 *     in replacement. Mode-prudent first cut deliberately
 *     keeps the legacy columns; the cleanup PR (drop
 *     `laboratory`, rename `product_id` → `product_code`)
 *     ships separately once the picker UX is validated
 *     against the new FK.
 *   - misc_templates
 *   - equipment_templates
 */
@Entity('producers')
@Index(['type'])
export class ProducerOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 32,
    enum: ProducerType,
    nullable: false,
  })
  type: ProducerType;

  /**
   * ISO 3166-1 alpha-2 country code. Stored uppercase ASCII
   * only (e.g. "US", "DE", "FR"). The application-side write
   * path is responsible for normalising before insert; the
   * migration applies a CHECK that enforces 2 ASCII letters.
   */
  @Column({ type: 'varchar', length: 2, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string | null;

  /** Brewer-friendly description in French (UI-facing). */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
