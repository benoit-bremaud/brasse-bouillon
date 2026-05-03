import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { StyleType } from '../domain/enums/style-type.enum';

/**
 * Immutable reference catalogue of BJCP beer styles (Issue #708 /
 * #869, Phase 2 PR #4).
 *
 * **BJCP** = **Beer Judge Certification Program** — the
 * international non-profit (https://www.bjcp.org) that publishes
 * the de-facto reference for beer styles used worldwide by
 * homebrewers, craft brewers, and beer competitions. Each BJCP
 * edition (1999, 2008, 2015, 2021…) revises the style categories,
 * numbering, and metric ranges (OG / FG / IBU / SRM / ABV) as the
 * brewing world evolves.
 *
 * Seeded with 20 entries — the 5 BeerXML 1.0 canonical styles
 * (BJCP 1999 verbatim from `libraries/style.xml`) plus 15 modern
 * BJCP 2021 styles needed by the demo recipes
 * (Punk IPA / NEIPA / Saison / Tripel / Witbier / Hefeweizen /
 * Kölsch / Wee Heavy / Imperial Stout / Baltic Porter / Vienna
 * Lager / ESB / White IPA / American Pale Ale / Belgian Strong
 * Golden Ale).
 *
 * The `style_guide` column carries one of three closed-set values
 * (see `StyleGuide` enum): "BJCP 1999" (verbatim BeerXML entries),
 * "BJCP 2021" (modern entries), or "Hybrid post-2010" (community
 * styles with no official BJCP category, e.g. White IPA). The
 * field handles the divergence per-row, so `category_number` /
 * `style_letter` stay accurate to the guide they reference. A
 * single uniform guide would have required either rewriting the
 * BeerXML entries (breaks verbatim) or using an obsolete guide
 * for the 2026 demo recipes.
 *
 * Uniqueness is enforced as a COMPOSITE on (name, style_guide) so
 * the same display name can legitimately exist across guides
 * (e.g. "American IPA" in BJCP 2021 vs a hypothetical future
 * BJCP 2026 with revised metric ranges). Per-name global
 * uniqueness alone would block that.
 *
 * Each metric dimension (OG / FG / IBU / colour EBC / carbonation
 * / ABV) ships as a min/max pair so the picker UX can highlight
 * when a recipe's actual metrics fall outside the expected range.
 *
 * Colour values stored in EBC (project convention — see
 * `feedback_normalized_colors`). BJCP / BeerXML quote SRM; the
 * conversion used is EBC ≈ SRM × 1.97.
 *
 * `recipes.style` (current denormalised varchar) is not yet
 * migrated to point at this catalogue via a `style_id` FK — that
 * migration ships in a separate PR after all Phase 1-3 catalogues
 * exist (so the FK landing is one coherent change rather than 8
 * incremental ones).
 */
@Entity('styles')
@Unique('UQ_styles_name_guide', ['name', 'style_guide'])
@Index(['type'])
@Index(['category_number'])
@Index(['style_guide'])
export class StyleOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  /**
   * Display name (e.g. "American IPA"). NOT globally unique — the
   * composite UNIQUE on (name, style_guide) lets the same name
   * legitimately exist across guide editions with different
   * metric ranges.
   */
  @Column({ type: 'varchar', length: 120, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 80, nullable: false })
  category: string;

  @Column({ type: 'integer', nullable: false })
  category_number: number;

  @Column({ type: 'varchar', length: 2, nullable: false })
  style_letter: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  style_guide: string;

  @Column({
    type: 'varchar',
    length: 10,
    enum: StyleType,
    nullable: false,
  })
  type: StyleType;

  // ─── Original Gravity range ────────────────────────────────────────────────
  @Column({ type: 'real', nullable: true })
  og_min: number | null;

  @Column({ type: 'real', nullable: true })
  og_max: number | null;

  // ─── Final Gravity range ───────────────────────────────────────────────────
  @Column({ type: 'real', nullable: true })
  fg_min: number | null;

  @Column({ type: 'real', nullable: true })
  fg_max: number | null;

  // ─── International Bitterness Units range ──────────────────────────────────
  @Column({ type: 'real', nullable: true })
  ibu_min: number | null;

  @Column({ type: 'real', nullable: true })
  ibu_max: number | null;

  // ─── Colour range (EBC) ────────────────────────────────────────────────────
  @Column({ type: 'real', nullable: true })
  color_ebc_min: number | null;

  @Column({ type: 'real', nullable: true })
  color_ebc_max: number | null;

  // ─── Carbonation range (volumes of CO2) ────────────────────────────────────
  @Column({ type: 'real', nullable: true })
  carb_min: number | null;

  @Column({ type: 'real', nullable: true })
  carb_max: number | null;

  // ─── ABV range (% alcohol by volume) ───────────────────────────────────────
  @Column({ type: 'real', nullable: true })
  abv_min: number | null;

  @Column({ type: 'real', nullable: true })
  abv_max: number | null;

  /**
   * General description in French (UI-facing). Mirrors the
   * convention used by HOPS_CATALOG_SEED, FERMENTABLES_CATALOG_SEED,
   * YEASTS_CATALOG_SEED and PUBLIC_RECIPES_SEED.description.
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /**
   * Sensory profile: appearance, aroma, flavour, mouthfeel —
   * folded into one French prose narrative. BJCP 2015+ separates
   * these into discrete fields; we keep them merged for now and
   * may split later if the picker UX needs them rendered as
   * separate sections.
   */
  @Column({ type: 'text', nullable: true })
  profile: string | null;

  @Column({ type: 'text', nullable: true })
  ingredients: string | null;

  @Column({ type: 'text', nullable: true })
  examples: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
