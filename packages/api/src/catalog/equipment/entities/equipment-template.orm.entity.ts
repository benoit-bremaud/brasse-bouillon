import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Immutable reference catalogue of homebrew equipment templates
 * (Issue #708 / #869, Phase 3 PR #7). Seeded with 9 entries —
 * a Brasse-Bouillon original kitchen starter (5L casserole,
 * extract brewing, no investment), the 2 BeerXML 1.0 canonical
 * equipment profiles (verbatim from `libraries/equipment.xml`),
 * plus 6 popular modern setups (BIAB 20/30L, Grainfather G30,
 * Klarstein Brauheld Pro, Anvil Foundry, 3-Vessel HERMS).
 *
 * **Naming**: the table is called `equipment_templates` (not
 * `equipment_profiles`) because `equipment_profiles` already
 * exists as the user-owned table for personal brewing setups.
 * A template here is the SHARED reference (manufacturer specs)
 * that an end user can later copy to seed their own personal
 * `equipment_profile` entity. The class name follows suit
 * (`EquipmentTemplateOrmEntity` not `EquipmentProfileOrmEntity`)
 * to avoid the same kind of class-name collision that PR #894
 * caught and fixed for `WaterModule` → `WaterCatalogModule`.
 *
 * BeerXML 1.0 `<EQUIPMENT>` field mapping:
 *   - BOIL_SIZE → boil_size_l (litres before boil)
 *   - BATCH_SIZE → batch_size_l (litres of finished beer)
 *   - TUN_VOLUME → tun_volume_l (mash tun capacity)
 *   - TUN_WEIGHT → tun_weight_kg (empty mash tun mass)
 *   - TUN_SPECIFIC_HEAT → tun_specific_heat (cal/g·°C)
 *   - TOP_UP_WATER → top_up_water_l (water added after boil)
 *   - TRUB_CHILLER_LOSS → trub_chiller_loss_l (lost to trub + chiller)
 *   - EVAP_RATE → evap_rate_percent (per hour during boil)
 *   - BOIL_TIME → boil_time_min (60 or 90 typical)
 *   - CALC_BOIL_VOLUME → calc_boil_volume (auto-compute pre-boil L)
 *   - LAUTER_DEADSPACE → lauter_deadspace_l (mash tun dead volume)
 *   - TOP_UP_KETTLE → top_up_kettle_l (water added to kettle pre-boil)
 *   - HOP_UTILIZATION → hop_utilization_percent (rig efficiency factor)
 */
@Entity('equipment_templates')
export class EquipmentTemplateOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, nullable: false, unique: true })
  name: string;

  @Column({ type: 'real', nullable: true })
  boil_size_l: number | null;

  @Column({ type: 'real', nullable: true })
  batch_size_l: number | null;

  @Column({ type: 'real', nullable: true })
  tun_volume_l: number | null;

  @Column({ type: 'real', nullable: true })
  tun_weight_kg: number | null;

  @Column({ type: 'real', nullable: true })
  tun_specific_heat: number | null;

  @Column({ type: 'real', nullable: true })
  top_up_water_l: number | null;

  @Column({ type: 'real', nullable: true })
  trub_chiller_loss_l: number | null;

  @Column({ type: 'real', nullable: true })
  evap_rate_percent: number | null;

  @Column({ type: 'integer', nullable: true })
  boil_time_min: number | null;

  @Column({ type: 'boolean', nullable: false, default: true })
  calc_boil_volume: boolean;

  @Column({ type: 'real', nullable: true })
  lauter_deadspace_l: number | null;

  @Column({ type: 'real', nullable: true })
  top_up_kettle_l: number | null;

  @Column({ type: 'real', nullable: true })
  hop_utilization_percent: number | null;

  /**
   * Brewer-friendly description in French (UI-facing). Typically
   * calls out the rig category (extract pot / BIAB / electric AIO
   * / 3-vessel HERMS) and the typical user profile (beginner /
   * intermediate / pro).
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /**
   * Optional FK to the unified `producers` reference table
   * (Issue #900) — the equipment manufacturer (Grainfather/
   * iMake, Klarstein, Anvil Brewing). Each equipment template
   * has at most one manufacturer (1:1 relationship).
   * Nullable + ON DELETE SET NULL — the kitchen-starter
   * Casserole 5L for instance has no specific manufacturer.
   */
  @Column({ type: 'varchar', length: 36, nullable: true })
  producer_id: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
