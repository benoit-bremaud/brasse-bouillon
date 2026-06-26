import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { BottlingScreen } from "@/features/batches/presentation/BottlingScreen";
import {
  closeBottling,
  getBottlingInfo,
} from "@/features/batches/application/bottling.use-cases";
import { PrimingInfo } from "@/features/batches/domain/bottling.types";

const mockReplace = jest.fn();
const mockBack = jest.fn();

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
      back: mockBack,
    }),
  };
});

jest.mock("@/features/batches/application/bottling.use-cases", () => ({
  getBottlingInfo: jest.fn(),
  closeBottling: jest.fn(),
}));

const mockedGetBottlingInfo = getBottlingInfo as jest.MockedFunction<
  typeof getBottlingInfo
>;
const mockedClose = closeBottling as jest.MockedFunction<typeof closeBottling>;

const priming: PrimingInfo = {
  sugarGrams: 28,
  sugarType: "table_sugar",
  targetCo2Vol: 2.4,
  volumeL: 4.3,
  safetyWarning:
    "Sécurité : un sur-sucrage peut faire EXPLOSER la bouteille. Pesez le sucre.",
};

function renderScreen(batchId = "b1") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BottlingScreen batchId={batchId} />
    </QueryClientProvider>,
  );
}

describe("BottlingScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockBack.mockReset();
    mockedGetBottlingInfo.mockReset();
    mockedClose.mockReset();
    mockedGetBottlingInfo.mockResolvedValue(priming);
    mockedClose.mockResolvedValue({
      id: "b1",
      ownerId: "u1",
      recipeId: "r1",
      status: "completed",
      currentStepOrder: null,
      startedAt: "2026-02-05T09:00:00.000Z",
      bottledAt: "2026-06-20T09:00:00.000Z",
      completedAt: "2026-06-20T09:00:00.000Z",
      createdAt: "2026-02-05T09:00:00.000Z",
      updatedAt: "2026-06-20T09:00:00.000Z",
      steps: [],
    });
  });

  it("shows the priming dose, sugar type and the safety warning (happy path)", async () => {
    renderScreen();

    expect(await screen.findByTestId("priming-dose")).toHaveTextContent("28 g");
    expect(screen.getByText(/sucre de table/)).toBeTruthy();
    expect(screen.getByTestId("bottling-safety-warning")).toHaveTextContent(
      /EXPLOSER/,
    );
  });

  it("disables the close button until the safety checkbox is ticked (gating, happy path)", async () => {
    renderScreen();

    await screen.findByTestId("priming-dose");

    // Pressing while the gate is closed must not fire the mutation.
    fireEvent.press(screen.getByText("Mettre en bouteille / clôturer"));
    expect(mockedClose).not.toHaveBeenCalled();
    expect(screen.getByText(/Coche la case de sécurité/)).toBeTruthy();
  });

  it("closes the batch once acknowledged and navigates to the closure view (happy path)", async () => {
    renderScreen();

    await screen.findByTestId("priming-dose");

    fireEvent.press(screen.getByTestId("bottling-ack-checkbox"));
    fireEvent.press(screen.getByText("Mettre en bouteille / clôturer"));

    await waitFor(() => expect(mockedClose).toHaveBeenCalledWith("b1"));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/batches/[id]",
      params: { id: "b1" },
    });
  });

  it("invalidates the batch detail + list caches on a successful close (regression)", async () => {
    const invalidateSpy = jest.spyOn(
      QueryClient.prototype,
      "invalidateQueries",
    );
    renderScreen();

    await screen.findByTestId("priming-dose");

    fireEvent.press(screen.getByTestId("bottling-ack-checkbox"));
    fireEvent.press(screen.getByText("Mettre en bouteille / clôturer"));

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["batches", "details", "b1"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["batches", "list"],
    });

    invalidateSpy.mockRestore();
  });

  it("toggling the checkbox off again re-disables the close gate (edge path)", async () => {
    renderScreen();

    await screen.findByTestId("priming-dose");

    const checkbox = screen.getByTestId("bottling-ack-checkbox");
    fireEvent.press(checkbox); // on
    fireEvent.press(checkbox); // off

    fireEvent.press(screen.getByText("Mettre en bouteille / clôturer"));
    expect(mockedClose).not.toHaveBeenCalled();
  });

  it("shows an error card and stays on the screen when the close fails (sad path)", async () => {
    mockedClose.mockRejectedValue(new Error("Batch already completed"));
    renderScreen();

    await screen.findByTestId("priming-dose");

    fireEvent.press(screen.getByTestId("bottling-ack-checkbox"));
    fireEvent.press(screen.getByText("Mettre en bouteille / clôturer"));

    expect(await screen.findByText(/Batch already completed/)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("renders a fallback message when priming is unavailable (sad path)", async () => {
    mockedGetBottlingInfo.mockRejectedValue(
      new Error("Cannot compute priming"),
    );
    renderScreen();

    expect(await screen.findByTestId("priming-error")).toBeTruthy();
    // The safety warning still renders from its hardcoded fallback.
    expect(screen.getByTestId("bottling-safety-warning")).toBeTruthy();
  });

  it("keeps the close gate disabled when the priming dose did not load, even if acknowledged (safety, sad path)", async () => {
    // A brewer must never close without having received the sugar dose: when
    // priming is null the close gate stays shut regardless of the checkbox.
    mockedGetBottlingInfo.mockResolvedValue(null);
    renderScreen();

    await screen.findByTestId("priming-error");

    fireEvent.press(screen.getByTestId("bottling-ack-checkbox"));
    fireEvent.press(screen.getByText("Mettre en bouteille / clôturer"));

    expect(mockedClose).not.toHaveBeenCalled();
  });
});
