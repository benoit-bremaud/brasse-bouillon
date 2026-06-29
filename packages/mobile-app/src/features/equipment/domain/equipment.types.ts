/**
 * High-level classification of a brewing system, mirroring the backend
 * `EquipmentSystemType` enum.
 */
export type EquipmentSystemType = "extract" | "all-grain" | "all-in-one";

/**
 * A user's saved equipment profile, mirroring the backend `EquipmentProfileDto`
 * in camelCase. The "hidden" constants (efficiency, boil-off rate, mash-tun
 * volume) are seeded server-side and read back here.
 */
export interface EquipmentProfile {
  id: string;
  ownerId: string;
  name: string;
  mashTunVolumeL: number;
  boilKettleVolumeL: number;
  fermenterVolumeL: number;
  trubLossL: number;
  deadSpaceLossL: number;
  transferLossL: number;
  evaporationRateLPerHour: number;
  efficiencyEstimatedPercent: number;
  efficiencyMeasuredPercent: number | null;
  coolingTimeMinutes: number | null;
  coolingFlowRateLPerMinute: number | null;
  systemType: EquipmentSystemType;
  createdAt: string;
  updatedAt: string;
}

/**
 * The three answers collected by the equipment wizard. The remaining required
 * fields are filled by the backend from per-system-type defaults.
 */
export interface EquipmentProfileInput {
  name: string;
  systemType: EquipmentSystemType;
  fermenterVolumeL: number;
  boilKettleVolumeL: number;
}
