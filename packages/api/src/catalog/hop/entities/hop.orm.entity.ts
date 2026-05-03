import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { HopForm } from '../domain/enums/hop-form.enum';
import { HopUsageType } from '../domain/enums/hop-usage-type.enum';

/**
 * Immutable reference catalogue of hop varieties (Issue #708 / #869,
 * Phase 1 PR #1). Seeded with 20 entries — the 5 BeerXML 1.0
 * canonical hops + 15 popular varieties needed by the demo recipes.
 *
 * Kept intentionally minimal in this PR: the producer / substitute
 * dimensions (real-world many-to-many relations) are deferred to a
 * dedicated "normalize-producers" PR after Phase 1 ships, where
 * `producers` + `hop_producers` + `hop_substitutes` (+ the analogous
 * `yeast_labs` and `fermentable_suppliers`) land as one coherent
 * normalised model across all three Phase 1 catalogues. Storing
 * them here as denormalised varchar / comma-separated text would be
 * tech debt to migrate later.
 *
 * `recipe_hops` is not yet migrated to point at this catalogue via
 * a `hop_id` FK — that migration ships in a follow-up PR after all
 * Phase 1-3 catalogues exist.
 */
@Entity('hops')
@Index(['usage_type'])
@Index(['form'])
@Index(['producer_id'])
export class HopOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  /**
   * Geographic origin of the variety (where the strain originated /
   * is most strongly associated with). Free-text country or region
   * — no enum because hop origin labels in the wild include
   * "United States", "Pacific Northwest", "Hallertau", etc.
   */
  @Column({ type: 'varchar', length: 80, nullable: true })
  origin: string | null;

  /**
   * Typical alpha acid percentage at harvest. A single representative
   * value rather than min/max bounds — the per-batch override (which
   * varies by harvest year) lives on `recipe_hops.alpha_acid_percent`.
   */
  @Column({ type: 'real', nullable: true })
  alpha_acid_typical: number | null;

  @Column({ type: 'real', nullable: true })
  beta_acid_typical: number | null;

  /**
   * Hop Stability Index (BeerXML `<HSI>`). Indicates how quickly the
   * variety loses alpha acid in storage; higher HSI = more stable.
   * Rarely consumed in modern brewing software but kept because the
   * BeerXML reference fixtures populate it.
   */
  @Column({ type: 'real', nullable: true })
  hop_stability_index: number | null;

  @Column({
    type: 'varchar',
    length: 12,
    enum: HopUsageType,
    nullable: false,
  })
  usage_type: HopUsageType;

  @Column({
    type: 'varchar',
    length: 8,
    enum: HopForm,
    nullable: false,
  })
  form: HopForm;

  /**
   * Brewer-friendly description in French (UI-facing, surfaced
   * verbatim on the mobile catalogue page). Mirrors the convention
   * used by `PUBLIC_RECIPES_SEED.description`.
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /**
   * Optional FK to the unified `producers` reference table
   * (Issue #900). Identifies the brand owner — for trademarked
   * varieties (Citra, Mosaic, Galaxy) this is the unique
   * producer; for open varieties (Cascade, Saaz) this is the
   * curated default. Nullable so legacy/future entries without
   * an identified producer remain valid. ON DELETE SET NULL so
   * deleting a producer never cascades onto the catalogue row.
   */
  @Column({ type: 'varchar', length: 36, nullable: true })
  producer_id: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
