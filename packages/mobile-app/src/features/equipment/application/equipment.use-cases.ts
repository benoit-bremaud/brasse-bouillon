import { dataSource } from "@/core/data/data-source";
import { Equipment, demoEquipments } from "@/mocks/demo-data";

import {
  EquipmentProfile,
  EquipmentProfileInput,
  EquipmentSystemType,
} from "../domain/equipment.types";
import {
  createEquipmentProfile as createEquipmentProfileApi,
  listMyEquipmentProfiles,
} from "../data/equipment.api";

const DEMO_TIMESTAMP = "2026-02-01T10:00:00.000Z";

/**
 * Adapt a legacy demo `Equipment` record to the real {@link EquipmentProfile}
 * shape so the screen consumes a single type in both data modes.
 */
function fromDemoEquipment(equipment: Equipment): EquipmentProfile {
  const systemType: EquipmentSystemType =
    equipment.type === "all-in-one" ? "all-in-one" : "all-grain";

  return {
    id: equipment.id,
    ownerId: "demo-owner",
    name: equipment.name,
    mashTunVolumeL: equipment.volumeLiters,
    boilKettleVolumeL: equipment.volumeLiters,
    fermenterVolumeL: equipment.volumeLiters,
    trubLossL: 0,
    deadSpaceLossL: 0,
    transferLossL: 0,
    evaporationRateLPerHour: 0,
    efficiencyEstimatedPercent: equipment.efficiencyPercent,
    efficiencyMeasuredPercent: null,
    coolingTimeMinutes: null,
    coolingFlowRateLPerMinute: null,
    systemType,
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  };
}

/**
 * Synthesize a profile from the wizard answers without a network call, so the
 * demo flow still ends on a created-profile screen.
 */
function synthesizeDemoProfile(input: EquipmentProfileInput): EquipmentProfile {
  const now = new Date().toISOString();

  return {
    id: `demo-${input.systemType}-${input.fermenterVolumeL}`,
    ownerId: "demo-owner",
    name: input.name,
    mashTunVolumeL: input.boilKettleVolumeL,
    boilKettleVolumeL: input.boilKettleVolumeL,
    fermenterVolumeL: input.fermenterVolumeL,
    trubLossL: 0,
    deadSpaceLossL: 0,
    transferLossL: 0,
    evaporationRateLPerHour: 0,
    efficiencyEstimatedPercent: 0,
    efficiencyMeasuredPercent: null,
    coolingTimeMinutes: null,
    coolingFlowRateLPerMinute: null,
    systemType: input.systemType,
    createdAt: now,
    updatedAt: now,
  };
}

export async function listEquipmentProfiles(): Promise<EquipmentProfile[]> {
  if (dataSource.useDemoData) {
    return demoEquipments.map(fromDemoEquipment);
  }
  return listMyEquipmentProfiles();
}

export async function createEquipmentProfile(
  input: EquipmentProfileInput,
): Promise<EquipmentProfile> {
  if (dataSource.useDemoData) {
    return synthesizeDemoProfile(input);
  }
  return createEquipmentProfileApi(input);
}
