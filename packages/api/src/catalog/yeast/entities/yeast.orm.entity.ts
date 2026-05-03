import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { YeastFlocculation } from '../domain/enums/yeast-flocculation.enum';
import { YeastForm } from '../domain/enums/yeast-form.enum';
import { YeastType } from '../domain/enums/yeast-type.enum';

/**
 * Immutable reference catalogue of brewing yeast strains (Issue
 * #708 / #869, Phase 1 PR #3). Seeded with 20 entries — the 5
 * BeerXML 1.0 canonical yeasts + 15 popular industry products
 * (Fermentis dry yeasts, White Labs / Wyeast / Imperial Yeast
 * liquid strains, Lallemand specialties).
 *
 * Each row represents a SPECIFIC lab product (Safale US-05,
 * WLP002 English Ale, Wyeast 1056 American Ale, etc.). The
 * laboratory dimension is now FK-normalised through
 * `producer_id` (Issue #904 cleanup — PR #902 mode-prudent
 * step shipped the FK alongside the legacy `laboratory`
 * varchar; this PR drops the legacy column). The
 * brewer-recognisable SKU (US-05, WLP002, 1056) is preserved
 * as `product_code` (renamed from `product_id` for clarity —
 * it's a SKU, not a FK).
 *
 * `recipe_yeasts` is not yet migrated to point at this catalogue
 * via a `yeast_id` FK — that migration ships in a follow-up PR
 * after all Phase 1-3 catalogues exist.
 */
@Entity('yeasts')
@Index(['type'])
@Index(['form'])
@Index(['producer_id'])
export class YeastOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 10,
    enum: YeastType,
    nullable: false,
  })
  type: YeastType;

  @Column({
    type: 'varchar',
    length: 10,
    enum: YeastForm,
    nullable: false,
  })
  form: YeastForm;

  /**
   * Manufacturer SKU recognisable by brewers worldwide (WLP002,
   * 1056, US-05). Acts as the de-facto industry identifier even
   * across language boundaries. Renamed from `product_id` to
   * `product_code` on Issue #904 cleanup — the column is a SKU
   * string, not a FK identifier, and the new name removes the
   * confusion with `producer_id` (which IS a FK).
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  product_code: string | null;

  /**
   * Recommended fermentation temperature range in °C. Per-batch
   * override (a brewer fermenting cold to suppress esters can
   * legitimately go below the min) lives on `recipe_yeasts`.
   */
  @Column({ type: 'real', nullable: true })
  min_temperature_c: number | null;

  @Column({ type: 'real', nullable: true })
  max_temperature_c: number | null;

  @Column({
    type: 'varchar',
    length: 10,
    enum: YeastFlocculation,
    nullable: true,
  })
  flocculation: YeastFlocculation | null;

  /**
   * Typical apparent attenuation in percent. 75% means the yeast
   * consumes 75% of the available sugars — leaving the beer at
   * 25% residual gravity. Per-batch reality varies with mash
   * temperature and yeast health.
   */
  @Column({ type: 'real', nullable: true })
  attenuation_percent_typical: number | null;

  /**
   * Brewer-friendly description in French (UI-facing). Folds the
   * BeerXML `<NOTES>` and `<BEST_FOR>` fields into one prose
   * narrative. Mirrors the convention used by HOPS_CATALOG_SEED
   * and FERMENTABLES_CATALOG_SEED.
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /**
   * Optional FK to the unified `producers` reference table
   * (Issue #900) — the laboratory that brands this strain
   * (Wyeast Labs, White Labs, Fermentis, Lallemand, Imperial
   * Yeast). Sole producer-related field on this entity since
   * the Issue #904 cleanup dropped the legacy `laboratory`
   * varchar. Nullable + ON DELETE SET NULL.
   */
  @Column({ type: 'varchar', length: 36, nullable: true })
  producer_id: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
