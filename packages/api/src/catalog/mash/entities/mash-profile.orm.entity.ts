import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MashStepOrmEntity } from './mash-step.orm.entity';

/**
 * Immutable reference catalogue of mash profiles (Issue #708 /
 * #869, Phase 2 PR #5).
 *
 * A **mash profile** is a sequence of temperature steps (paliers
 * d'empâtage) that the brewer follows during the mashing phase to
 * convert grain starches into fermentable sugars. The profile
 * defines the equipment context (grain temp, tun temp, sparge temp,
 * pH target) and references its ordered steps via the OneToMany
 * relation to `MashStepOrmEntity` (cascade-delete on profile
 * removal).
 *
 * Seeded with 10 profiles — the 5 BeerXML 1.0 canonical profiles
 * (verbatim from `libraries/mash.xml`, 18 steps) plus 5 modern
 * single-infusion / step-mash / Hochkurz profiles needed by the
 * demo recipes.
 *
 * `recipes` is not yet migrated to point at this catalogue via a
 * `mash_profile_id` FK — that migration ships in a separate PR
 * after all Phase 1-3 catalogues exist.
 */
@Entity('mash_profiles')
export class MashProfileOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  /**
   * BeerXML `<GRAIN_TEMP>` — initial grain temperature in °C
   * (typically room temperature, ~22°C).
   */
  @Column({ type: 'real', nullable: true })
  grain_temp_c: number | null;

  /**
   * BeerXML `<TUN_TEMP>` — initial mash tun temperature in °C
   * before mashing in.
   */
  @Column({ type: 'real', nullable: true })
  tun_temp_c: number | null;

  /**
   * BeerXML `<SPARGE_TEMP>` — temperature of the rinse water in °C
   * (typically 75-78°C to denature enzymes and improve flow).
   */
  @Column({ type: 'real', nullable: true })
  sparge_temp_c: number | null;

  /**
   * BeerXML `<PH>` — target mash pH (typical brewing range 5.2-5.6).
   */
  @Column({ type: 'real', nullable: true })
  ph: number | null;

  /**
   * BeerXML `<TUN_WEIGHT>` — empty mash tun weight in kg, used by
   * brewing software to compute strike water temperatures.
   */
  @Column({ type: 'real', nullable: true })
  tun_weight_kg: number | null;

  /**
   * BeerXML `<TUN_SPECIFIC_HEAT>` — specific heat capacity of the
   * mash tun (cal/g·°C), used for thermal calculations.
   */
  @Column({ type: 'real', nullable: true })
  tun_specific_heat: number | null;

  /**
   * BeerXML `<EQUIP_ADJUST>` — whether brewing software should
   * adjust temperatures for equipment heat loss.
   */
  @Column({ type: 'boolean', nullable: false, default: false })
  equip_adjust: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => MashStepOrmEntity, (step) => step.mash_profile)
  steps: MashStepOrmEntity[];

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
