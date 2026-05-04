import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DistributorOrmEntity } from '../../distributor/entities/distributor.orm.entity';
import { HopOrmEntity } from './hop.orm.entity';

/**
 * M:N junction between hops and distributors (Issue #901).
 * One row = "this distributor sells this hop, here's the
 * outbound product page URL".
 *
 * **Composite primary key on (hop_id, distributor_id)** —
 * canonical M:N pattern. The junction has no business meaning
 * beyond the link itself; the per-row business fields
 * (`product_url`, `sku`, `notes_per_distributor`) are
 * attributes of the link, not of a separately addressable
 * entity. No surrogate UUID needed.
 *
 * **ON DELETE CASCADE on both sides**: if the hop is removed
 * (rare — catalogue tables are append-only) or the distributor
 * goes out of business, the link goes too. No orphan junction
 * rows possible.
 *
 * **Pattern precedent**: this PR sets the M:N junction pattern
 * for the codebase. The 4 sibling junctions
 * (`fermentable_distributors`, `yeast_distributors`,
 * `misc_template_distributors`, `equipment_template_distributors`)
 * mirror this exact shape.
 */
@Entity('hop_distributors')
export class HopDistributorOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  hop_id: string;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  distributor_id: string;

  /**
   * Outbound deeplink to the distributor's product page for
   * this exact hop. Migration applies a CHECK that enforces
   * `https://` prefix — no `http://` (mixed-content risk on
   * the mobile WebView) and no relative URLs.
   */
  @Column({ type: 'varchar', length: 500, nullable: false })
  product_url: string;

  /**
   * Distributor-specific SKU when the brewer needs to copy it
   * (e.g. for a phone order). Optional — most boutique shops
   * surface URLs but not always machine-readable SKUs.
   */
  @Column({ type: 'varchar', length: 80, nullable: true })
  sku: string | null;

  /** Brewer-friendly note in French (UI-facing, optional). */
  @Column({ type: 'text', nullable: true })
  notes_per_distributor: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => HopOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hop_id' })
  hop: HopOrmEntity;

  @ManyToOne(() => DistributorOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'distributor_id' })
  distributor: DistributorOrmEntity;
}
