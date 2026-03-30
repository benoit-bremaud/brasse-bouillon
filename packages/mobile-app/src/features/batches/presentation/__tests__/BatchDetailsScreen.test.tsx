import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { BatchDetailsScreen } from "@/features/batches/presentation/BatchDetailsScreen";

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
  getBatchDetails: jest.fn().mockResolvedValue({
    id: "b1",
    status: "in_progress",
    currentStepOrder: 0,
    steps: [
      {
        batchId: "b1",
        stepOrder: 0,
        type: "mash",
        label: "Empâtage",
        status: "in_progress",
      },
      {
        batchId: "b1",
        stepOrder: 1,
        type: "boil",
        label: "Ébullition",
        status: "pending",
      },
    ],
  }),
  completeCurrentBatchStep: jest.fn().mockResolvedValue({
    id: "b1",
    status: "completed",
    currentStepOrder: 0,
    steps: [],
  }),
}));

function renderBatchDetailsScreen(batchId = "b1") {
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
      <BatchDetailsScreen batchId={batchId} />
    </QueryClientProvider>,
  );
}

describe("BatchDetailsScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
  });

  it("renders batch details", async () => {
    renderBatchDetailsScreen();

    expect(await screen.findByText("Batch b1")).toBeTruthy();
    expect(screen.getByText("Progression du brassin")).toBeTruthy();
    expect(screen.getByText("Steps")).toBeTruthy();
    expect(screen.getByText("Complete current step")).toBeTruthy();
  });

  it("navigates back to batches list from header action", async () => {
    renderBatchDetailsScreen();

    expect(await screen.findByText("Batch b1")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Retour à la liste des brassins"));

    expect(mockReplace).toHaveBeenCalledWith("/batches");
  });
});
