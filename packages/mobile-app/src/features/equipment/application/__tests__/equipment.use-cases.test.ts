import {
  createEquipmentProfile as createEquipmentProfileApi,
  listMyEquipmentProfiles,
} from "@/features/equipment/data/equipment.api";
import {
  createEquipmentProfile,
  listEquipmentProfiles,
} from "@/features/equipment/application/equipment.use-cases";

import { EquipmentProfile } from "@/features/equipment/domain/equipment.types";
import { dataSource } from "@/core/data/data-source";
import { demoEquipments } from "@/mocks/demo-data";

jest.mock("@/core/data/data-source", () => ({
  dataSource: { useDemoData: false },
}));

jest.mock("@/features/equipment/data/equipment.api", () => ({
  createEquipmentProfile: jest.fn(),
  listMyEquipmentProfiles: jest.fn(),
}));

const mockedCreateApi = createEquipmentProfileApi as jest.MockedFunction<
  typeof createEquipmentProfileApi
>;
const mockedListApi = listMyEquipmentProfiles as jest.MockedFunction<
  typeof listMyEquipmentProfiles
>;

function setDemo(value: boolean) {
  (dataSource as { useDemoData: boolean }).useDemoData = value;
}

function makeProfile(
  overrides: Partial<EquipmentProfile> = {},
): EquipmentProfile {
  return {
    id: "eq-1",
    ownerId: "u-1",
    name: "Setup",
    mashTunVolumeL: 30,
    boilKettleVolumeL: 30,
    fermenterVolumeL: 23,
    trubLossL: 0,
    deadSpaceLossL: 0,
    transferLossL: 0,
    evaporationRateLPerHour: 3,
    efficiencyEstimatedPercent: 72,
    efficiencyMeasuredPercent: null,
    coolingTimeMinutes: null,
    coolingFlowRateLPerMinute: null,
    systemType: "all-grain",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("equipment.use-cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setDemo(false);
  });

  it("create: calls the API with the input when demo is off (happy)", async () => {
    const profile = makeProfile();
    mockedCreateApi.mockResolvedValue(profile);

    const input = {
      name: "Tout-grain 30 L",
      systemType: "all-grain" as const,
      fermenterVolumeL: 23,
      boilKettleVolumeL: 30,
    };
    const result = await createEquipmentProfile(input);

    expect(mockedCreateApi).toHaveBeenCalledWith(input);
    expect(result).toBe(profile);
  });

  it("create: synthesizes a demo profile without calling the API (happy)", async () => {
    setDemo(true);

    const result = await createEquipmentProfile({
      name: "Demo",
      systemType: "all-in-one",
      fermenterVolumeL: 20,
      boilKettleVolumeL: 25,
    });

    expect(mockedCreateApi).not.toHaveBeenCalled();
    expect(result.name).toBe("Demo");
    expect(result.systemType).toBe("all-in-one");
    // Single-vessel demo assumption: mash tun mirrors the boil kettle.
    expect(result.mashTunVolumeL).toBe(25);
  });

  it("list: returns API rows when demo is off (happy)", async () => {
    const rows = [makeProfile()];
    mockedListApi.mockResolvedValue(rows);

    const result = await listEquipmentProfiles();

    expect(mockedListApi).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });

  it("list: maps demo equipment without calling the API (edge)", async () => {
    setDemo(true);

    const result = await listEquipmentProfiles();

    expect(mockedListApi).not.toHaveBeenCalled();
    expect(result).toHaveLength(demoEquipments.length);
    expect(result[0].id).toBe(demoEquipments[0].id);
  });

  it("create: propagates an API error when demo is off (sad)", async () => {
    mockedCreateApi.mockRejectedValue(new Error("network down"));

    await expect(
      createEquipmentProfile({
        name: "S",
        systemType: "all-grain",
        fermenterVolumeL: 23,
        boilKettleVolumeL: 30,
      }),
    ).rejects.toThrow("network down");
  });

  it("list: propagates an API error when demo is off (sad)", async () => {
    mockedListApi.mockRejectedValue(new Error("timeout"));

    await expect(listEquipmentProfiles()).rejects.toThrow("timeout");
  });
});
