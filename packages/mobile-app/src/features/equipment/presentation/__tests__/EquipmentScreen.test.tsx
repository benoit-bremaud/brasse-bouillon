import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { EquipmentProfile } from "@/features/equipment/domain/equipment.types";
import { EquipmentScreen } from "@/features/equipment/presentation/EquipmentScreen";
import React from "react";
import { listEquipmentProfiles } from "@/features/equipment/application/equipment.use-cases";

const mockPush = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/equipment/application/equipment.use-cases", () => ({
  listEquipmentProfiles: jest.fn(),
}));

const mockedList = listEquipmentProfiles as jest.MockedFunction<
  typeof listEquipmentProfiles
>;

function makeProfile(
  overrides: Partial<EquipmentProfile> = {},
): EquipmentProfile {
  return {
    id: "eq-1",
    ownerId: "u-1",
    name: "Ma cuve",
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

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EquipmentScreen />
    </QueryClientProvider>,
  );
}

describe("EquipmentScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the user's profiles (happy)", async () => {
    mockedList.mockResolvedValue([makeProfile({ name: "Ma cuve" })]);

    renderScreen();

    expect(await screen.findByText("Ma cuve")).toBeTruthy();
  });

  it("shows the empty state with a CTA when there is no profile (edge)", async () => {
    mockedList.mockResolvedValue([]);

    renderScreen();

    expect(await screen.findByText("Aucun matériel enregistré")).toBeTruthy();
    fireEvent.press(screen.getByTestId("equipment-empty-cta"));
    expect(mockPush).toHaveBeenCalledWith("/equipment/wizard");
  });

  it("navigates to the wizard from the add CTA (happy)", async () => {
    mockedList.mockResolvedValue([makeProfile()]);

    renderScreen();
    await screen.findByTestId("equipment-add-cta");

    fireEvent.press(screen.getByTestId("equipment-add-cta"));
    expect(mockPush).toHaveBeenCalledWith("/equipment/wizard");
  });

  it("opens a profile's detail when its card is tapped (F22)", async () => {
    mockedList.mockResolvedValue([
      makeProfile({ id: "eq-1", name: "Ma cuve" }),
    ]);

    renderScreen();
    fireEvent.press(await screen.findByTestId("equipment-card-eq-1"));

    expect(mockPush).toHaveBeenCalledWith("/equipment/eq-1");
  });

  it("shows an error card when the query fails (sad)", async () => {
    // getErrorMessage surfaces the error's own message (falling back to the
    // generic copy only when the error has none).
    mockedList.mockRejectedValue(new Error("timeout"));

    renderScreen();

    expect(await screen.findByText("timeout")).toBeTruthy();
  });
});
