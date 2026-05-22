import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { BatchesScreen } from "@/features/batches/presentation/BatchesScreen";
import React from "react";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { dataSource } from "@/core/data/data-source";

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

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  listBatches: jest.fn(),
}));

function renderBatchesScreen() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Number.POSITIVE_INFINITY,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BatchesScreen />
    </QueryClientProvider>,
  );
}

describe("BatchesScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    (listBatches as jest.Mock).mockReset();
    dataSource.useDemoData = false;
  });

  it("renders header and empty state when no batches are returned (happy path)", async () => {
    (listBatches as jest.Mock).mockResolvedValue([]);

    renderBatchesScreen();

    expect(await screen.findByText("Mes Brassins")).toBeTruthy();
    expect(await screen.findByText("Aucun batch")).toBeTruthy();
  });

  it("shows the fil-rouge recipe name and status badges in demo mode (edge path)", async () => {
    dataSource.useDemoData = true;
    (listBatches as jest.Mock).mockResolvedValue([
      {
        id: "b-demo-pdd-mash",
        ownerId: "u-demo-1",
        recipeId: "r-demo-pdd",
        status: "in_progress",
        currentStepOrder: 0,
        startedAt: "2026-05-19T09:00:00.000Z",
        fermentationStartedAt: null,
        fermentationCompletedAt: null,
        completedAt: null,
        createdAt: "2026-05-19T09:00:00.000Z",
        updatedAt: "2026-05-19T09:30:00.000Z",
      },
      {
        id: "b-demo-pdd-done",
        ownerId: "u-demo-1",
        recipeId: "r-demo-pdd",
        status: "completed",
        currentStepOrder: 2,
        startedAt: "2026-04-22T09:00:00.000Z",
        fermentationStartedAt: "2026-04-22T11:30:00.000Z",
        fermentationCompletedAt: "2026-05-06T11:30:00.000Z",
        completedAt: "2026-05-12T15:00:00.000Z",
        createdAt: "2026-04-22T09:00:00.000Z",
        updatedAt: "2026-05-12T15:00:00.000Z",
      },
    ]);

    renderBatchesScreen();

    // Recipe name resolved from the demo catalogue (not the batch id).
    expect((await screen.findAllByText("La Première du dimanche")).length).toBe(
      2,
    );
    // French status labels, uppercased by the Badge component.
    expect(screen.getByText("EN COURS")).toBeTruthy();
    expect(screen.getByText("TERMINÉ")).toBeTruthy();
  });

  it("falls back to a French Brassin <id> label when no recipe is found (sad path)", async () => {
    dataSource.useDemoData = true;
    (listBatches as jest.Mock).mockResolvedValue([
      {
        id: "b-orphan-1",
        ownerId: "u-demo-1",
        recipeId: "r-missing",
        status: "in_progress",
        currentStepOrder: 0,
        startedAt: "2026-05-19T09:00:00.000Z",
        fermentationStartedAt: null,
        fermentationCompletedAt: null,
        completedAt: null,
        createdAt: "2026-05-19T09:00:00.000Z",
        updatedAt: "2026-05-19T09:30:00.000Z",
      },
    ]);

    renderBatchesScreen();

    expect(await screen.findByText("Brassin b-orphan")).toBeTruthy();
  });

  it("navigates to the batch detail when an in-progress card is pressed", async () => {
    dataSource.useDemoData = true;
    (listBatches as jest.Mock).mockResolvedValue([
      {
        id: "b-demo-pdd-mash",
        ownerId: "u-demo-1",
        recipeId: "r-demo-pdd",
        status: "in_progress",
        currentStepOrder: 0,
        startedAt: "2026-05-19T09:00:00.000Z",
        fermentationStartedAt: null,
        fermentationCompletedAt: null,
        completedAt: null,
        createdAt: "2026-05-19T09:00:00.000Z",
        updatedAt: "2026-05-19T09:30:00.000Z",
      },
    ]);

    renderBatchesScreen();

    fireEvent.press(await screen.findByText("La Première du dimanche"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/batches/b-demo-pdd-mash");
  });

  it("routes a completed brassin to the celebration mockup in demo mode", async () => {
    dataSource.useDemoData = true;
    (listBatches as jest.Mock).mockResolvedValue([
      {
        id: "b-demo-pdd-done",
        ownerId: "u-demo-1",
        recipeId: "r-demo-pdd",
        status: "completed",
        currentStepOrder: 2,
        startedAt: "2026-04-22T09:00:00.000Z",
        fermentationStartedAt: "2026-04-22T11:30:00.000Z",
        fermentationCompletedAt: "2026-05-06T11:30:00.000Z",
        completedAt: "2026-05-12T15:00:00.000Z",
        createdAt: "2026-04-22T09:00:00.000Z",
        updatedAt: "2026-05-12T15:00:00.000Z",
      },
    ]);

    renderBatchesScreen();

    fireEvent.press(await screen.findByText("La Première du dimanche"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/batches/celebration");
  });

  it("keeps the canonical details route for completed batches in live mode", async () => {
    dataSource.useDemoData = false;
    (listBatches as jest.Mock).mockResolvedValue([
      {
        id: "b-live-7",
        ownerId: "u-live-1",
        recipeId: "r-live-1",
        status: "completed",
        currentStepOrder: 2,
        startedAt: "2026-04-22T09:00:00.000Z",
        fermentationStartedAt: "2026-04-22T11:30:00.000Z",
        fermentationCompletedAt: "2026-05-06T11:30:00.000Z",
        completedAt: "2026-05-12T15:00:00.000Z",
        createdAt: "2026-04-22T09:00:00.000Z",
        updatedAt: "2026-05-12T15:00:00.000Z",
      },
    ]);

    renderBatchesScreen();

    fireEvent.press(await screen.findByText("Brassin b-live-7"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/batches/b-live-7");
  });
});
