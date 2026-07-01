import { request } from "@/core/http/http-client";

import {
  EquipmentProfile,
  EquipmentProfileInput,
  EquipmentSystemType,
} from "../domain/equipment.types";

/**
 * Raw equipment profile as returned by the backend (snake_case). Mapped to the
 * {@link EquipmentProfile} domain shape by {@link mapEquipmentProfile}.
 */
type EquipmentProfileDto = {
  id: string;
  owner_id: string;
  name: string;
  mash_tun_volume_l: number;
  boil_kettle_volume_l: number;
  fermenter_volume_l: number;
  trub_loss_l: number;
  dead_space_loss_l: number;
  transfer_loss_l: number;
  evaporation_rate_l_per_hour: number;
  efficiency_estimated_percent: number;
  efficiency_measured_percent?: number | null;
  cooling_time_minutes?: number | null;
  cooling_flow_rate_l_per_minute?: number | null;
  system_type: EquipmentSystemType;
  created_at: string;
  updated_at: string;
};

/**
 * Wizard create payload — only the three answers the novice gives. The backend
 * seeds the remaining required constants from per-system-type defaults.
 */
type CreateEquipmentProfileBody = {
  name: string;
  system_type: EquipmentSystemType;
  fermenter_volume_l: number;
  boil_kettle_volume_l: number;
};

export function mapEquipmentProfile(
  dto: EquipmentProfileDto,
): EquipmentProfile {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    name: dto.name,
    mashTunVolumeL: dto.mash_tun_volume_l,
    boilKettleVolumeL: dto.boil_kettle_volume_l,
    fermenterVolumeL: dto.fermenter_volume_l,
    trubLossL: dto.trub_loss_l,
    deadSpaceLossL: dto.dead_space_loss_l,
    transferLossL: dto.transfer_loss_l,
    evaporationRateLPerHour: dto.evaporation_rate_l_per_hour,
    efficiencyEstimatedPercent: dto.efficiency_estimated_percent,
    efficiencyMeasuredPercent: dto.efficiency_measured_percent ?? null,
    coolingTimeMinutes: dto.cooling_time_minutes ?? null,
    coolingFlowRateLPerMinute: dto.cooling_flow_rate_l_per_minute ?? null,
    systemType: dto.system_type,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listMyEquipmentProfiles(): Promise<EquipmentProfile[]> {
  const rows = await request<EquipmentProfileDto[]>("/equipment-profiles");
  return rows.map(mapEquipmentProfile);
}

export async function createEquipmentProfile(
  input: EquipmentProfileInput,
): Promise<EquipmentProfile> {
  const body: CreateEquipmentProfileBody = {
    name: input.name,
    system_type: input.systemType,
    fermenter_volume_l: input.fermenterVolumeL,
    boil_kettle_volume_l: input.boilKettleVolumeL,
  };
  const row = await request<EquipmentProfileDto>("/equipment-profiles", {
    method: "POST",
    body,
  });
  return mapEquipmentProfile(row);
}

export async function getEquipmentProfileById(
  id: string,
): Promise<EquipmentProfile> {
  const row = await request<EquipmentProfileDto>(`/equipment-profiles/${id}`);
  return mapEquipmentProfile(row);
}

export async function deleteEquipmentProfile(id: string): Promise<void> {
  await request<void>(`/equipment-profiles/${id}`, { method: "DELETE" });
}
