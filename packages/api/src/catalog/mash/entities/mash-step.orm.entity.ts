import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { MashProfileOrmEntity } from './mash-profile.orm.entity';
import { MashStepType } from '../domain/enums/mash-step-type.enum';

/**
 * Single step within a mash profile (Issue #708 / #869, Phase 2
 * PR #5). Owned by exactly one `MashProfileOrmEntity` via the
 * `mash_profile_id` FK with ON DELETE CASCADE — deleting a profile
 * automatically removes all its steps, since orphan steps make no
 * sense.
 *
 * `step_index` (1-based) defines the execution order. The composite
 * UNIQUE (mash_profile_id, step_index) guards against duplicate
 * positions within the same profile.
 *
 * BeerXML 1.0 `<MASH_STEP>` field mapping:
 *   - TYPE → type (enum: infusion / temperature / decoction)
 *   - INFUSE_AMOUNT → infuse_amount_l (litres of hot water added)
 *   - STEP_TIME → step_time_min
 *   - STEP_TEMP → step_temp_c
 *   - RAMP_TIME → ramp_time_min
 *   - END_TEMP → end_temp_c
 *   - DECOCTION_AMT → decoction_amount_l
 *   - WATER_GRAIN_RATIO → water_grain_ratio (L/kg)
 *   - INFUSE_TEMP → infuse_temp_c
 *   - DESCRIPTION → description (UI-facing French)
 */
@Entity('mash_steps')
@Unique('UQ_mash_steps_profile_index', ['mash_profile_id', 'step_index'])
@Index(['mash_profile_id'])
@Index(['type'])
export class MashStepOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  mash_profile_id: string;

  /**
   * 1-based ordering position within the parent profile. The seed
   * loader and any future write paths must keep these dense (no
   * gaps) so the UI can iterate them as `1..steps.length`.
   */
  @Column({ type: 'integer', nullable: false })
  step_index: number;

  @Column({ type: 'varchar', length: 60, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 12,
    enum: MashStepType,
    nullable: false,
  })
  type: MashStepType;

  @Column({ type: 'integer', nullable: true })
  step_time_min: number | null;

  @Column({ type: 'real', nullable: true })
  step_temp_c: number | null;

  @Column({ type: 'integer', nullable: true })
  ramp_time_min: number | null;

  @Column({ type: 'real', nullable: true })
  end_temp_c: number | null;

  /**
   * Volume of water added at this step (infusion type only).
   * NULL for temperature / decoction steps.
   */
  @Column({ type: 'real', nullable: true })
  infuse_amount_l: number | null;

  /**
   * Temperature of the infused water before it hits the grain bed.
   */
  @Column({ type: 'real', nullable: true })
  infuse_temp_c: number | null;

  /**
   * Volume of mash pulled out and boiled (decoction type only).
   * NULL for infusion / temperature steps.
   */
  @Column({ type: 'real', nullable: true })
  decoction_amount_l: number | null;

  /**
   * Water-to-grain ratio in litres per kilogram. Standard range
   * 2.5-3.5 L/kg (thicker mash for fuller body, thinner for higher
   * extract efficiency).
   */
  @Column({ type: 'real', nullable: true })
  water_grain_ratio: number | null;

  /**
   * Brewer-friendly description in French (UI-facing). Folds the
   * BeerXML `<DESCRIPTION>` field. May reference computed values
   * verbatim ("Add 12.5 L of water at 72°C") for instant copy/paste
   * to a brew day notepad.
   */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => MashProfileOrmEntity, (profile) => profile.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mash_profile_id' })
  mash_profile: MashProfileOrmEntity;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
