import { EquipmentSystemType } from '../enums/equipment-system-type.enum';

/**
 * Unique identifier type for an Equipment Profile aggregate.
 */
export type EquipmentProfileId = string;

/**
 * Unique identifier type for a User.
 *
 * NOTE: This is intentionally a simple alias to keep
 * the domain independent from the infrastructure
 * user model.
 */
export type UserId = string;

/**
 * EquipmentProfile
 *
 * Represents a brewing system configuration for a user.
 * Users can own multiple equipment profiles (e.g. small BIAB
 * system, large all-grain system).
 *
 * All numeric values are expressed in metric units:
 * - Volumes: litres (L)
 * - Evaporation rate: litres per hour (L/h)
 * - Efficiency: percentage in [0, 100]
 * - Cooling time: minutes
 * - Cooling flow: litres per minute (L/min)
 */
export interface EquipmentProfile {
  /** Unique technical identifier for this profile */
  readonly id: EquipmentProfileId;

  /** Owner of this profile */
  readonly ownerId: UserId;

  /** Human-readable name, e.g. "20L All-Grain System" */
  readonly name: string;

  /** Mash tun total volume in litres */
  readonly mashTunVolumeL: number;

  /** Boil kettle total volume in litres */
  readonly boilKettleVolumeL: number;

  /** Fermenter usable volume in litres */
  readonly fermenterVolumeL: number;

  /** Loss due to trub/kettle residue in litres */
  readonly trubLossL: number;

  /** Dead space loss (e.g. below tap) in litres */
  readonly deadSpaceLossL: number;

  /** Loss during transfers (hoses, filters) in litres */
  readonly transferLossL: number;

  /** Boil-off or evaporation rate in litres per hour */
  readonly evaporationRateLPerHour: number;

  /** Estimated brewhouse efficiency in percent [0, 100] */
  readonly efficiencyEstimatedPercent: number;

  /**
   * Last measured brewhouse efficiency in percent [0, 100].
   * Optional: not available until user records a real batch.
   */
  readonly efficiencyMeasuredPercent?: number;

  /** Optional cooling total time in minutes */
  readonly coolingTimeMinutes?: number;

  /** Optional cooling flow rate in litres per minute */
  readonly coolingFlowRateLPerMinute?: number;

  /** Type of brewing system (extract / all-grain / all-in-one) */
  readonly systemType: EquipmentSystemType;

  /** Creation timestamp */
  readonly createdAt: Date;

  /** Last update timestamp */
  readonly updatedAt: Date;
}
