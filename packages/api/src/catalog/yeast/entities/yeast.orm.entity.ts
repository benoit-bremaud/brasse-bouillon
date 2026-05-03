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
 * `laboratory` and `product_id` columns stay as direct varchars
 * because each catalogue row is 1:1 with a manufacturer product;
 * the future "normalize-producers" PR may add an optional
 * `laboratory_id` FK referencing the unified `producers` table
 * but the textual fields remain as the brewer-recognisable
 * identifier (US-05, WLP002, 1056).
 *
 * `recipe_yeasts` is not yet migrated to point at this catalogue
 * via a `yeast_id` FK — that migration ships in a follow-up PR
 * after all Phase 1-3 catalogues exist.
 */
@Entity('yeasts')
@Index(['type'])
@Index(['laboratory'])
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
   * Manufacturer label (e.g. White Labs, Wyeast Labs, Fermentis,
   * Imperial Yeast, Lallemand). Free-text varchar in this PR —
   * future normalisation may move it to a FK on a unified
   * `producers` table while keeping this column as the
   * brewer-facing display string.
   */
  @Column({ type: 'varchar', length: 60, nullable: true })
  laboratory: string | null;

  /**
   * Manufacturer SKU recognisable by brewers worldwide (WLP002,
   * 1056, US-05). Acts as the de-facto industry identifier even
   * across language boundaries.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  product_id: string | null;

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

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
