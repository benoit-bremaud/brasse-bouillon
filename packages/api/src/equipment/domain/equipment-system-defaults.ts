import { EquipmentSystemType } from './enums/equipment-system-type.enum';

/**
 * Educational defaults for the brewing constants that the 3-question equipment
 * wizard never asks a novice (mash/brewhouse efficiency and boil-off rate).
 *
 * The mobile wizard sends only the user's three answers (system type, fermenter
 * volume, boil-kettle volume); the backend fills the remaining required
 * constants from this table, keyed by system type. These are starting estimates,
 * not measured values — a profile stays editable so the user can refine them
 * once they brew.
 *
 * Aligns with ADR-0020 (volume-planning constants owned by the backend).
 */
export interface EquipmentSystemDefaults {
  /** Estimated mash/brewhouse efficiency, percent in [0, 100]. */
  efficiencyEstimatedPercent: number;
  /** Boil-off rate, litres per hour. */
  evaporationRateLPerHour: number;
}

/**
 * Per-system-type defaults applied at creation when the wizard omits the hidden
 * constants. Mash-tun volume is intentionally absent: it is derived from the
 * boil-kettle volume (single-vessel assumption) in the service, not table-driven.
 */
export const EQUIPMENT_SYSTEM_DEFAULTS: Record<
  EquipmentSystemType,
  EquipmentSystemDefaults
> = {
  [EquipmentSystemType.EXTRACT]: {
    efficiencyEstimatedPercent: 100,
    evaporationRateLPerHour: 2.5,
  },
  [EquipmentSystemType.ALL_GRAIN]: {
    efficiencyEstimatedPercent: 72,
    evaporationRateLPerHour: 3,
  },
  [EquipmentSystemType.ALL_IN_ONE]: {
    efficiencyEstimatedPercent: 68,
    evaporationRateLPerHour: 2.5,
  },
};
