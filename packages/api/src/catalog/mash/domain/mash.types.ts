import { MashStepType } from './enums/mash-step-type.enum';

/**
 * Domain shape for one step within a mash profile. Mirrors the
 * `MashStepOrmEntity` row shape one-to-one (no field is computed).
 *
 * `mash_profile_id` is the FK to the parent profile; `step_index`
 * (1-based) defines the canonical execution order within the
 * profile. The composite UNIQUE (mash_profile_id, step_index)
 * guards against duplicate ordering.
 */
export interface MashStepEntry {
  id: string;
  mash_profile_id: string;
  step_index: number;
  name: string;
  type: MashStepType;
  step_time_min: number | null;
  step_temp_c: number | null;
  ramp_time_min: number | null;
  end_temp_c: number | null;
  infuse_amount_l: number | null;
  infuse_temp_c: number | null;
  decoction_amount_l: number | null;
  water_grain_ratio: number | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Domain shape for one mash profile entry in the immutable reference
 * catalogue. Mirrors the `MashProfileOrmEntity` row shape one-to-one.
 *
 * The `steps` field is populated by the service layer via the
 * @OneToMany relation when callers request a profile by id (or list
 * with `relations: ['steps']`). It is NOT a database column.
 */
export interface MashProfileEntry {
  id: string;
  name: string;
  grain_temp_c: number | null;
  tun_temp_c: number | null;
  sparge_temp_c: number | null;
  ph: number | null;
  tun_weight_kg: number | null;
  tun_specific_heat: number | null;
  equip_adjust: boolean;
  notes: string | null;
  steps: MashStepEntry[];
  created_at: Date;
  updated_at: Date;
}
