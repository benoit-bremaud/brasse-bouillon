import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MiscType, MiscUseAt } from '../domain/misc-template.types';

/**
 * Immutable reference catalogue of homebrew "misc" ingredients
 * (BeerXML 1.0 `<MISC>` records — spices, finings, water agents,
 * herbs, flavor adjuncts). Issue #708 / #869, Phase 3 PR #8 —
 * the last catalogue of the refactor series.
 *
 * Seeded with 10 entries — the 5 BeerXML 1.0 canonical entries
 * (verbatim from `libraries/misc.xml`) plus 5 modern essentials
 * (Coriandre, Lactose, Whirlfloc, Servomyces, Gypse) covering
 * the TYPE × USE matrix end users actually reach for.
 *
 * **Naming**: the table is `misc_templates` (not `miscs`) for
 * consistency with `equipment_templates`, and to leave room for
 * a future `recipe_misc` junction table (Recipe → MiscTemplate)
 * without name collision when the Recipe entities are refactored
 * post Phase 3.
 *
 * BeerXML 1.0 `<MISC>` field mapping:
 *   - NAME → name (varchar(120) UNIQUE)
 *   - TYPE → type (enum MiscType — spice / fining / water_agent /
 *     herb / flavor / other)
 *   - USE → use_at (enum MiscUseAt — mash / boil / primary /
 *     secondary / bottling; renamed from BeerXML's `USE` because
 *     `use` is a SQL reserved keyword)
 *   - AMOUNT → amount (real, kg if amount_is_weight else L —
 *     stored verbatim so round-tripping a recipe preserves the
 *     exact reference value)
 *   - AMOUNT_IS_WEIGHT → amount_is_weight (boolean)
 *   - TIME → time_min (real — BeerXML TIME is float minutes)
 *   - USE_FOR → use_for (varchar — short purpose category, English)
 *   - NOTES → notes (text, French — UI-facing brewer description)
 *
 * Display fields (`DISPLAY_AMOUNT`, `DISPLAY_TIME`, `INVENTORY`)
 * are intentionally omitted: they are operator-side formatting
 * concerns and stock-tracking metadata that do not belong in a
 * shared reference catalogue.
 */
@Entity('misc_templates')
export class MiscTemplateOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 32, enum: MiscType, nullable: false })
  type: MiscType;

  @Column({ type: 'varchar', length: 32, enum: MiscUseAt, nullable: false })
  use_at: MiscUseAt;

  @Column({ type: 'real', nullable: false })
  amount: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  amount_is_weight: boolean;

  @Column({ type: 'real', nullable: false })
  time_min: number;

  @Column({ type: 'varchar', length: 120, nullable: true })
  use_for: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /**
   * Optional FK to the unified `producers` reference table
   * (Issue #900). Most miscs have a single producer (Servomyces
   * = Lallemand, Whirlfloc = Kerry Group), commodity items
   * (lactose, coriandre) leave it NULL. Nullable + ON DELETE
   * SET NULL.
   */
  @Column({ type: 'varchar', length: 36, nullable: true })
  producer_id: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
