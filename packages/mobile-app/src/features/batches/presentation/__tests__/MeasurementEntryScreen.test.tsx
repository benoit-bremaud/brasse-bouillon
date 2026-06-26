import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import React from "react";
import { MeasurementEntryScreen } from "@/features/batches/presentation/MeasurementEntryScreen";
import { recordBatchMeasurement } from "@/features/batches/application/measurement.use-cases";

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
      replace: jest.fn(),
      back: mockBack,
    }),
  };
});

jest.mock("@/features/batches/application/measurement.use-cases", () => ({
  recordBatchMeasurement: jest.fn(),
}));

const mockedRecord = recordBatchMeasurement as jest.MockedFunction<
  typeof recordBatchMeasurement
>;

function renderScreen(recordedOg: number | null = null) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MeasurementEntryScreen batchId="b1" recordedOg={recordedOg} />
    </QueryClientProvider>,
  );
}

describe("MeasurementEntryScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockedRecord.mockReset();
    mockedRecord.mockResolvedValue({
      id: "m1",
      batchId: "b1",
      stepOrder: null,
      type: "og",
      value: 1.05,
      unit: null,
      takenAt: "2026-05-19T09:00:00.000Z",
      createdAt: "2026-05-19T09:00:00.000Z",
    });
  });

  it("renders the form with the OG/FG choice and the save button (happy path)", () => {
    renderScreen();

    expect(screen.getByText("Saisir une densité")).toBeTruthy();
    expect(screen.getByText("Densité initiale (OG)")).toBeTruthy();
    expect(screen.getByText("Densité finale (FG)")).toBeTruthy();
    expect(screen.getByText("Enregistrer la densité")).toBeTruthy();
  });

  it("records the OG reading on submit (happy path)", async () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId("measurement-value-input"),
      "1.050",
    );
    fireEvent.press(screen.getByText("Enregistrer la densité"));

    await waitFor(() => {
      expect(mockedRecord).toHaveBeenCalledWith("b1", {
        type: "og",
        value: 1.05,
      });
    });
    expect(mockBack).toHaveBeenCalled();
  });

  it("blocks an FG >= OG with a plain explanation and does not submit (sad path)", async () => {
    renderScreen(1.05);

    // FG is preselected when an OG is already recorded.
    fireEvent.changeText(
      screen.getByTestId("measurement-value-input"),
      "1.060",
    );
    fireEvent.press(screen.getByText("Enregistrer la densité"));

    expect(screen.getByTestId("measurement-block-message")).toBeTruthy();
    expect(
      screen.getByText(/densité finale doit être plus basse/),
    ).toBeTruthy();
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("shows buy-advice via the no-hydrometer escape without submitting (edge path)", () => {
    renderScreen();

    fireEvent.press(screen.getByText("Je n'ai pas de densimètre"));

    expect(screen.getByTestId("measurement-buy-advice")).toBeTruthy();
    expect(screen.getByText(/indisponible/)).toBeTruthy();
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("computes and explains ABV once a valid FG is entered against the OG (happy path)", () => {
    renderScreen(1.05);

    fireEvent.changeText(
      screen.getByTestId("measurement-value-input"),
      "1.010",
    );

    expect(screen.getByText("5.3 % vol")).toBeTruthy();
  });

  it("blocks an FG equal to the OG at the boundary and does not submit (edge path)", () => {
    renderScreen(1.05);

    fireEvent.changeText(
      screen.getByTestId("measurement-value-input"),
      "1.050",
    );
    fireEvent.press(screen.getByText("Enregistrer la densité"));

    expect(screen.getByTestId("measurement-block-message")).toBeTruthy();
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("shows an error card when recording fails and stays on the screen (sad path)", async () => {
    mockedRecord.mockReset();
    mockedRecord.mockRejectedValue(new Error("Réseau indisponible"));
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId("measurement-value-input"),
      "1.050",
    );
    fireEvent.press(screen.getByText("Enregistrer la densité"));

    expect(await screen.findByText(/Réseau indisponible/)).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("invalidates the measurements cache on a successful record (regression)", async () => {
    const invalidateSpy = jest.spyOn(
      QueryClient.prototype,
      "invalidateQueries",
    );
    renderScreen();

    fireEvent.changeText(
      screen.getByTestId("measurement-value-input"),
      "1.050",
    );
    fireEvent.press(screen.getByText("Enregistrer la densité"));

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["batches", "measurements", "b1"],
    });

    invalidateSpy.mockRestore();
  });
});
