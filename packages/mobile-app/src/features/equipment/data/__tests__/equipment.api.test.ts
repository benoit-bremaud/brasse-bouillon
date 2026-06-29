import {
  createEquipmentProfile,
  listMyEquipmentProfiles,
  mapEquipmentProfile,
} from "@/features/equipment/data/equipment.api";

import { HttpError } from "@/core/http/http-error";

const mockRequest = jest.fn();

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

const sampleDto = {
  id: "eq-1",
  owner_id: "u-1",
  name: "Tout-grain 30 L",
  mash_tun_volume_l: 30,
  boil_kettle_volume_l: 30,
  fermenter_volume_l: 23,
  trub_loss_l: 0,
  dead_space_loss_l: 0,
  transfer_loss_l: 0,
  evaporation_rate_l_per_hour: 3,
  efficiency_estimated_percent: 72,
  efficiency_measured_percent: null,
  cooling_time_minutes: null,
  cooling_flow_rate_l_per_minute: null,
  system_type: "all-grain" as const,
  created_at: "2026-02-01T10:00:00.000Z",
  updated_at: "2026-02-01T10:00:00.000Z",
};

describe("equipment.api", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("POSTs only the four wizard fields and maps the response (happy)", async () => {
    mockRequest.mockResolvedValue(sampleDto);

    const result = await createEquipmentProfile({
      name: "Tout-grain 30 L",
      systemType: "all-grain",
      fermenterVolumeL: 23,
      boilKettleVolumeL: 30,
    });

    expect(mockRequest).toHaveBeenCalledWith("/equipment-profiles", {
      method: "POST",
      body: {
        name: "Tout-grain 30 L",
        system_type: "all-grain",
        fermenter_volume_l: 23,
        boil_kettle_volume_l: 30,
      },
    });
    expect(result.fermenterVolumeL).toBe(23);
    expect(result.efficiencyEstimatedPercent).toBe(72);
    expect(result.systemType).toBe("all-grain");
  });

  it("lists profiles and maps each to the domain shape (happy)", async () => {
    mockRequest.mockResolvedValue([sampleDto]);

    const result = await listMyEquipmentProfiles();

    expect(mockRequest).toHaveBeenCalledWith("/equipment-profiles");
    expect(result).toHaveLength(1);
    expect(result[0].ownerId).toBe("u-1");
    expect(result[0].mashTunVolumeL).toBe(30);
  });

  it("maps an absent measured efficiency to null (edge)", () => {
    const mapped = mapEquipmentProfile({
      ...sampleDto,
      efficiency_measured_percent: undefined,
    });

    expect(mapped.efficiencyMeasuredPercent).toBeNull();
  });

  it("propagates an HttpError from the client (sad)", async () => {
    mockRequest.mockRejectedValue(new HttpError(500, "boom"));

    await expect(
      createEquipmentProfile({
        name: "x",
        systemType: "extract",
        fermenterVolumeL: 10,
        boilKettleVolumeL: 12,
      }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
