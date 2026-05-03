import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Immutable reference catalogue of historical brewing water
 * profiles (Issue #708 / #869, Phase 3 PR #6). Seeded with 10
 * entries — the 5 BeerXML 1.0 canonical profiles (verbatim from
 * `libraries/water.xml`) plus 5 historically-significant water
 * profiles needed by the demo recipes (Munich, London, Dortmund,
 * Vienna, Dublin).
 *
 * Mineral concentrations are stored in ppm (parts per million),
 * equivalent to mg/L for dilute aqueous solutions. The six ions
 * tracked are the brewing-relevant ones — calcium, bicarbonate,
 * sulfate, chloride, sodium, magnesium — plus the baseline pH.
 * Trace minerals (iron, fluoride, manganese, etc.) are out of
 * scope: they have no impact on standard brewing styles and
 * complicate the data model without practical benefit.
 *
 * Brewing water history: each historical brewing city built its
 * style around its native water profile. Burton-on-Trent's high
 * sulfate (725 ppm) made it the cradle of the IPA; Pilsen's
 * exceptionally soft water (5 ppm sulfate) gave birth to the
 * Pilsner; Munich's moderate alkalinity favoured the dark Bock
 * styles. Modern brewers replicate these profiles by treating
 * their local tap water with brewing salts (gypsum, calcium
 * chloride, baking soda).
 *
 * `recipes` is not yet migrated to point at this catalogue via a
 * `water_profile_id` FK — that migration ships in a separate PR
 * after all Phase 1-3 catalogues exist.
 */
@Entity('waters')
export class WaterOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  /**
   * Geographic origin (city, region) of the water profile. Free-
   * text varchar — labels in the wild include "Burton on Trent",
   * "Pilsen, Czech Republic", "Pacific Northwest", etc.
   */
  @Column({ type: 'varchar', length: 80, nullable: true })
  origin: string | null;

  /**
   * Calcium (Ca²⁺) in ppm. Critical mineral for brewing — drives
   * mash enzyme activity, lowers mash pH, improves yeast
   * flocculation and beer clarity. Target range 50-150 ppm for
   * most styles.
   */
  @Column({ type: 'real', nullable: true })
  calcium_ppm: number | null;

  /**
   * Bicarbonate (HCO₃⁻) in ppm. Drives water alkalinity. Low
   * (<50 ppm) for pale beers, high (>200 ppm) tolerated for
   * roasted dark beers (Stout, Porter) where the acidic dark
   * malts neutralise it.
   */
  @Column({ type: 'real', nullable: true })
  bicarbonate_ppm: number | null;

  /**
   * Sulfate (SO₄²⁻) in ppm. Accentuates hop bitterness perception
   * — high sulfate (>250 ppm) gives the dry assertive finish of
   * British IPAs. Burton-on-Trent water sits at 725 ppm.
   */
  @Column({ type: 'real', nullable: true })
  sulfate_ppm: number | null;

  /**
   * Chloride (Cl⁻) in ppm. Accentuates malt sweetness and rounded
   * mouthfeel. High chloride favours malt-forward styles (lagers,
   * stouts, brown ales). Should NOT be confused with chlorine
   * (Cl₂), which must be removed before brewing.
   */
  @Column({ type: 'real', nullable: true })
  chloride_ppm: number | null;

  /**
   * Sodium (Na⁺) in ppm. Accentuates malt character at low levels
   * (<150 ppm); above 250 ppm gives a noticeable salty/metallic
   * off-flavour. Most brewing waters sit at 5-50 ppm.
   */
  @Column({ type: 'real', nullable: true })
  sodium_ppm: number | null;

  /**
   * Magnesium (Mg²⁺) in ppm. Yeast nutrient at trace levels;
   * above 30 ppm contributes a sour-bitter note. Not actively
   * targeted in brewing water adjustment.
   */
  @Column({ type: 'real', nullable: true })
  magnesium_ppm: number | null;

  /**
   * Baseline pH of the source water. Note this is the *water* pH
   * before mashing — the *mash* pH (post-grain) is the value
   * brewers actually target (typically 5.2-5.6) and is influenced
   * by both the water profile and the grain bill acidity.
   */
  @Column({ type: 'real', nullable: true })
  ph: number | null;

  /**
   * Brewer-friendly description in French (UI-facing). Mirrors
   * the convention used by HOPS / FERMENTABLES / YEASTS /
   * STYLES / MASH catalog seeds. Typically calls out the
   * historical style this water is famous for.
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
