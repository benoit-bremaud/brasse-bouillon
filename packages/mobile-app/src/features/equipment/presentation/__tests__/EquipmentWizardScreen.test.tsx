import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { EquipmentProfile } from "@/features/equipment/domain/equipment.types";
import { EquipmentWizardScreen } from "@/features/equipment/presentation/EquipmentWizardScreen";
import React from "react";
import { createEquipmentProfile } from "@/features/equipment/application/equipment.use-cases";

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
      back: mockBack,
    }),
  };
});

jest.mock("@/features/equipment/application/equipment.use-cases", () => ({
  createEquipmentProfile: jest.fn(),
}));

const mockedCreate = createEquipmentProfile as jest.MockedFunction<
  typeof createEquipmentProfile
>;

const CREATED_PROFILE: EquipmentProfile = {
  id: "eq-1",
  ownerId: "u-1",
  name: "Tout-grain 23 L",
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
};

function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <EquipmentWizardScreen />
    </QueryClientProvider>,
  );
}

function completeAllSteps() {
  fireEvent.press(screen.getByTestId("equipment-system-option-all-grain"));
  fireEvent.press(screen.getByTestId("equipment-wizard-next"));
  fireEvent.changeText(screen.getByTestId("equipment-fermenter-input"), "23");
  fireEvent.press(screen.getByTestId("equipment-wizard-next"));
  fireEvent.changeText(screen.getByTestId("equipment-kettle-input"), "30");
  fireEvent.press(screen.getByTestId("equipment-wizard-next"));
}

describe("EquipmentWizardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("walks the 3 questions then creates and navigates (happy)", async () => {
    mockedCreate.mockResolvedValue(CREATED_PROFILE);

    renderScreen();
    completeAllSteps();
    fireEvent.press(screen.getByTestId("equipment-wizard-create"));

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledWith({
        name: "Tout-grain 23 L",
        systemType: "all-grain",
        fermenterVolumeL: 23,
        boilKettleVolumeL: 30,
      });
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/equipment");
    });
  });

  it("does not advance past question 1 until a system type is chosen (edge)", () => {
    renderScreen();

    fireEvent.press(screen.getByTestId("equipment-wizard-next"));

    expect(screen.getByText("Question 1 / 3")).toBeTruthy();
    expect(screen.queryByTestId("equipment-fermenter-input")).toBeNull();
  });

  it("shows an error message when creation fails (sad)", async () => {
    mockedCreate.mockRejectedValue(new Error("network down"));

    renderScreen();
    completeAllSteps();
    fireEvent.press(screen.getByTestId("equipment-wizard-create"));

    await waitFor(() => {
      expect(screen.getByText("network down")).toBeTruthy();
    });
  });
});
