import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";

import { BatchesScreen } from "@/features/batches/presentation/BatchesScreen";
import React from "react";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

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
  it("renders header and empty state", async () => {
    renderBatchesScreen();

    expect(await screen.findByText("Mes Brassins")).toBeTruthy();
    expect(await screen.findByText("Aucun batch")).toBeTruthy();
  });
});
