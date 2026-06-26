import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";

import { TastingScreen } from "@/features/batches/presentation/TastingScreen";
import { recordTasting } from "@/features/batches/application/bottling.use-cases";

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

jest.mock("@/features/batches/application/bottling.use-cases", () => ({
  recordTasting: jest.fn(),
}));

const mockedRecord = recordTasting as jest.MockedFunction<typeof recordTasting>;

function renderScreen(batchId = "b1") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TastingScreen batchId={batchId} />
    </QueryClientProvider>,
  );
}

describe("TastingScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockedRecord.mockReset();
    mockedRecord.mockResolvedValue({
      id: "t1",
      batchId: "b1",
      rating: 4,
      note: null,
      createdAt: "2026-06-20T09:00:00.000Z",
    });
  });

  it("renders the five-star row and a disabled save until a rating is picked (happy path)", () => {
    renderScreen();

    expect(screen.getByText("Noter ma dégustation")).toBeTruthy();
    for (let value = 1; value <= 5; value += 1) {
      expect(screen.getByTestId(`tasting-star-${value}`)).toBeTruthy();
    }

    // No rating yet → submitting does nothing.
    fireEvent.press(screen.getByText("Enregistrer ma dégustation"));
    expect(mockedRecord).not.toHaveBeenCalled();
  });

  it("captures the star rating and records it with the note (happy path)", async () => {
    renderScreen();

    fireEvent.press(screen.getByTestId("tasting-star-4"));
    fireEvent.changeText(
      screen.getByTestId("tasting-note-input"),
      "Belle mousse",
    );
    fireEvent.press(screen.getByText("Enregistrer ma dégustation"));

    await waitFor(() =>
      expect(mockedRecord).toHaveBeenCalledWith("b1", {
        rating: 4,
        note: "Belle mousse",
      }),
    );
    expect(mockBack).toHaveBeenCalled();
  });

  it("omits the note when it is empty / whitespace only (edge path)", async () => {
    renderScreen();

    fireEvent.press(screen.getByTestId("tasting-star-5"));
    fireEvent.changeText(screen.getByTestId("tasting-note-input"), "   ");
    fireEvent.press(screen.getByText("Enregistrer ma dégustation"));

    await waitFor(() =>
      expect(mockedRecord).toHaveBeenCalledWith("b1", { rating: 5 }),
    );
  });

  it("lets the brewer change the rating before saving (edge path)", async () => {
    renderScreen();

    fireEvent.press(screen.getByTestId("tasting-star-2"));
    fireEvent.press(screen.getByTestId("tasting-star-3"));
    fireEvent.press(screen.getByText("Enregistrer ma dégustation"));

    await waitFor(() =>
      expect(mockedRecord).toHaveBeenCalledWith("b1", { rating: 3 }),
    );
  });

  it("shows an error card and stays on the screen when recording fails (sad path)", async () => {
    mockedRecord.mockRejectedValue(new Error("Batch already has a tasting"));
    renderScreen();

    fireEvent.press(screen.getByTestId("tasting-star-3"));
    fireEvent.press(screen.getByText("Enregistrer ma dégustation"));

    expect(await screen.findByText(/Batch already has a tasting/)).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("invalidates the tasting cache on a successful record (regression)", async () => {
    const invalidateSpy = jest.spyOn(
      QueryClient.prototype,
      "invalidateQueries",
    );
    renderScreen();

    fireEvent.press(screen.getByTestId("tasting-star-4"));
    fireEvent.press(screen.getByText("Enregistrer ma dégustation"));

    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["batches", "tasting", "b1"],
    });

    invalidateSpy.mockRestore();
  });
});
