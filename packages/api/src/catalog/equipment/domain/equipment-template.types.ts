/**
 * Domain shape for one equipment template entry in the immutable
 * reference catalogue. Mirrors the `EquipmentTemplateOrmEntity` row
 * shape one-to-one (no field is computed) — kept as a separate
 * interface so the application / presentation layers do not import
 * the ORM entity directly.
 *
 * **Naming**: the table is called `equipment_templates` (not
 * `equipment_profiles`) because `equipment_profiles` already exists
 * as the user-owned table for personal brewing setups. A template
 * here is the SHARED reference (e.g. "Klarstein Brauheld Pro 30L
 * spec constructeur") that an end user can later copy to seed their
 * own personal `equipment_profile` entity.
 */
export interface EquipmentTemplateEntry {
  id: string;
  name: string;
  boil_size_l: number | null;
  batch_size_l: number | null;
  tun_volume_l: number | null;
  tun_weight_kg: number | null;
  tun_specific_heat: number | null;
  top_up_water_l: number | null;
  trub_chiller_loss_l: number | null;
  evap_rate_percent: number | null;
  boil_time_min: number | null;
  calc_boil_volume: boolean;
  lauter_deadspace_l: number | null;
  top_up_kettle_l: number | null;
  hop_utilization_percent: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
