import { Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import React from "react";
import { EquipmentDetailScreen } from "@/features/equipment/presentation/EquipmentDetailScreen";
import { ConfirmProvider } from "@/core/ui/confirm-provider";
import { EquipmentProfile } from "@/features/equipment/domain/equipment.types";
import {
  deleteEquipmentProfile,
  getEquipmentProfile,
} from "@/features/equipment/application/equipment.use-cases";

const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/equipment/application/equipment.use-cases", () => ({
  getEquipmentProfile: jest.fn(),
  deleteEquipmentProfile: jest.fn(),
}));

const mockedGet = getEquipmentProfile as jest.MockedFunction<
  typeof getEquipmentProfile
>;
const mockedDelete = deleteEquipmentProfile as jest.MockedFunction<
  typeof deleteEquipmentProfile
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

function renderScreen(profileId = "eq-1") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        <EquipmentDetailScreen profileId={profileId} />
      </ConfirmProvider>
    </QueryClientProvider>,
  );
}

// The delete confirmation is the branded in-app ConfirmDialog; press its
// « Supprimer » button (accessibilityLabel) to confirm the deletion.
async function confirmDeleteInDialog() {
  fireEvent.press(await screen.findByLabelText("Supprimer"));
}

describe("EquipmentDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue(makeProfile());
    mockedDelete.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the profile detail (happy)", async () => {
    renderScreen();

    expect(await screen.findByText("Ma cuve")).toBeTruthy();
    expect(screen.getByText("23 L")).toBeTruthy(); // fermenter volume
    expect(screen.getByText("72 %")).toBeTruthy(); // estimated efficiency
  });

  it("deletes the profile after confirmation and navigates back (F22)", async () => {
    renderScreen();

    fireEvent.press(await screen.findByTestId("equipment-delete-cta"));

    // The tap opens the branded confirmation dialog rather than deleting
    // immediately.
    expect(await screen.findByText("Supprimer ce matériel ?")).toBeTruthy();
    expect(mockedDelete).not.toHaveBeenCalled();

    await confirmDeleteInDialog();

    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith("eq-1"));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/equipment"));
  });

  it("shows an error when the profile is not found (sad)", async () => {
    mockedGet.mockResolvedValue(null);
    renderScreen();

    expect(await screen.findByText("Matériel introuvable")).toBeTruthy();
  });

  it("alerts and stays on the screen when the delete fails (sad)", async () => {
    mockedDelete.mockRejectedValue(new Error("boom"));
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    renderScreen();

    fireEvent.press(await screen.findByTestId("equipment-delete-cta"));
    await confirmDeleteInDialog();

    // The failure feedback still uses the native error Alert (not part of this
    // migration).
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "Suppression impossible",
        expect.any(String),
      ),
    );
    expect(mockReplace).not.toHaveBeenCalledWith("/equipment");
  });
});
