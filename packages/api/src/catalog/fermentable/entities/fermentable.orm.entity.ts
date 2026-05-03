import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { FermentableType } from '../domain/enums/fermentable-type.enum';

/**
 * Immutable reference catalogue of fermentable varieties (Issue
 * #708 / #869, Phase 1 PR #2). Seeded with 20 entries — the 4
 * BeerXML 1.0 canonical fermentables + 16 popular grains, sugars
 * and extracts needed by the demo recipes.
 *
 * Kept intentionally minimal in this PR: the supplier dimension
 * (real-world many-to-many: Pale Ale Malt is sold by Briess,
 * Castle Malting, Crisp, Bairds…) is deferred to the "normalize-
 * producers" PR after Phase 1, where `producers` +
 * `fermentable_suppliers` (alongside `hop_producers` and
 * `yeast_labs`) land as one coherent normalised model. Storing
 * `supplier` here as denormalised varchar would be tech debt to
 * migrate later.
 *
 * `recipe_fermentables` is not yet migrated to point at this
 * catalogue via a `fermentable_id` FK — that migration ships in a
 * follow-up PR after all Phase 1-3 catalogues exist.
 */
@Entity('fermentables')
@Index(['type'])
@Index(['producer_id'])
export class FermentableOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 10,
    enum: FermentableType,
    nullable: false,
  })
  type: FermentableType;

  /**
   * Geographic origin / regional association of the fermentable.
   * Free-text country or region — labels in the wild include
   * "United Kingdom", "Germany", "Belgium", "Pacific Northwest", etc.
   */
  @Column({ type: 'varchar', length: 80, nullable: true })
  origin: string | null;

  /**
   * Typical SRM-equivalent colour stored in EBC (project convention
   * — see `feedback_normalized_colors`). Conversion: SRM × 1.97 ≈ EBC.
   * Per-batch override (a maltster's specific lot can drift) lives
   * on `recipe_fermentables.color_ebc`.
   */
  @Column({ type: 'real', nullable: true })
  color_ebc_typical: number | null;

  /**
   * BeerXML `<POTENTIAL>` — maximum specific gravity per pound of
   * grain in 1 gallon of water (the brewing-software standard unit).
   * E.g. 1.037 for a base pilsner malt, 1.046 for table sugar.
   */
  @Column({ type: 'real', nullable: true })
  potential_gravity_typical: number | null;

  /**
   * BeerXML `<YIELD>` — extract yield percentage. 100 for pure
   * sugars, ~80 for base malts, ~70 for caramel / roasted grains.
   */
  @Column({ type: 'real', nullable: true })
  yield_percent_typical: number | null;

  /**
   * BeerXML `<DIASTATIC_POWER>` — enzymatic power in lintner units.
   * 0 for caramel / roasted / non-grain (no enzymes left), 50+ for
   * standard base malts, 100+ for high-enzyme base malts (US 2-Row,
   * Pilsner) used to convert adjuncts.
   */
  @Column({ type: 'real', nullable: true })
  diastatic_power_lintner: number | null;

  /**
   * BeerXML `<MAX_IN_BATCH>` — recommended cap as percentage of the
   * total grain bill. 100 for base malts, 10-20 for specialty,
   * 5-10 for very strong roasted / acid malts.
   */
  @Column({ type: 'real', nullable: true })
  max_in_batch_percent: number | null;

  /**
   * BeerXML `<RECOMMEND_MASH>` — whether the fermentable must pass
   * through the mash. true for grains and adjuncts that need
   * enzymatic conversion; false for sugars and extracts that
   * dissolve directly into the boil or fermenter.
   */
  @Column({ type: 'boolean', nullable: false, default: true })
  recommend_mash: boolean;

  /**
   * Brewer-friendly description in French (UI-facing, surfaced
   * verbatim on the mobile catalogue page). Mirrors the convention
   * used by `PUBLIC_RECIPES_SEED.description` and the hop catalogue.
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /**
   * Optional FK to the unified `producers` reference table
   * (Issue #900) — the maltster that produces this exact malt
   * (Briess, Weyermann, Best Malz, Castle, Crisp…). Same malt
   * type sold by multiple maltsters typically has slightly
   * different chemistry, so each maltster's variant is its own
   * catalogue row. Nullable + ON DELETE SET NULL.
   */
  @Column({ type: 'varchar', length: 36, nullable: true })
  producer_id: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
