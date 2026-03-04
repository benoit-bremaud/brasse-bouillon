import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { BatchesScreen } from "@/features/batches/presentation/BatchesScreen";
import React from "react";

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

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  listBatches: jest.fn().mockResolvedValue([]),
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
    mockReplace.mockReset();
  });

  it("renders header and empty state", async () => {
    renderBatchesScreen();

    expect(await screen.findByText("Mes Brassins")).toBeTruthy();
    expect(await screen.findByText("Aucun batch")).toBeTruthy();
  });

  it("navigates back to dashboard from header action", async () => {
    renderBatchesScreen();

    expect(await screen.findByText("Mes Brassins")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Retour à l'accueil"));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});
