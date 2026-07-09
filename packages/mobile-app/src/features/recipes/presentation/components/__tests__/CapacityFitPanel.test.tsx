import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { loadEquipmentFit } from "@/features/recipes/application/equipment-fit.use-cases";
import { CapacityFitPanel } from "@/features/recipes/presentation/components/CapacityFitPanel";
import type { CapacityFit } from "@/features/recipes/domain/equipment-fit.types";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: jest.fn(),
}));

jest.mock("@/features/recipes/application/equipment-fit.use-cases", () => ({
  ...jest.requireActual(
    "@/features/recipes/application/equipment-fit.use-cases",
  ),
  loadEquipmentFit: jest.fn(),
}));

const mockLoad = loadEquipmentFit as jest.MockedFunction<
  typeof loadEquipmentFit
>;

function fit(overrides: Partial<CapacityFit> = {}): CapacityFit {
  return {
    fermenter: "FITS",
    fermenterReason: null,
    kettle: "OK",
    kettleReason: null,
    fermenterUsableL: 4.5,
    recipeVolumeL: 4.3,
    preBoilL: 5,
    kettleCapacityL: 10,
    scaleRatio: null,
    ...overrides,
  };
}

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <CapacityFitPanel recipeId="recipe-1" />
    </QueryClientProvider>,
  );
}

describe("CapacityFitPanel", () => {
  afterEach(() => jest.clearAllMocks());

  it("shows a loading indicator while the fit loads", async () => {
    mockLoad.mockReturnValue(new Promise<CapacityFit>(() => {}));
    renderPanel();
    expect(await screen.findByTestId("capacity-fit-loading")).toBeTruthy();
  });

  it("renders both legs with their verdicts on a successful fit", async () => {
    mockLoad.mockResolvedValue(fit());
    renderPanel();

    expect(await screen.findByTestId("capacity-fit-fermenter")).toBeTruthy();
    expect(screen.getByTestId("capacity-fit-kettle")).toBeTruthy();
    expect(screen.getByText("Fermenteur")).toBeTruthy();
    expect(screen.getByText("Bouilloire")).toBeTruthy();
    // Badge force-uppercases its label.
    expect(screen.getAllByText("ÇA PASSE").length).toBeGreaterThan(0);
  });

  it("surfaces an error message when the fetch fails", async () => {
    mockLoad.mockRejectedValue(new Error("Backend indisponible"));
    renderPanel();
    expect(await screen.findByText("Backend indisponible")).toBeTruthy();
  });

  it("shows the declare-equipment CTA and navigates when no profile is declared", async () => {
    mockLoad.mockResolvedValue(
      fit({
        fermenter: "NOT_EVALUATED",
        fermenterReason: "NO_PROFILE",
        kettle: "NOT_EVALUATED",
        kettleReason: "NO_PROFILE",
      }),
    );
    renderPanel();

    const cta = await screen.findByTestId("capacity-fit-cta");
    expect(screen.queryByTestId("capacity-fit-fermenter")).toBeNull();

    fireEvent.press(cta);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/equipment"));
  });
});
