import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { BatchDetailsScreen } from "@/features/batches/presentation/BatchDetailsScreen";
import { getBatchDetails } from "@/features/batches/application/batches.use-cases";
import { dataSource } from "@/core/data/data-source";

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

const mashBatch = {
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
};

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  getBatchDetails: jest.fn(),
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
    dataSource.useDemoData = false;
    (getBatchDetails as jest.Mock).mockResolvedValue(mashBatch);
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

describe("BatchDetailsScreen — demo-mode fermentation tracker", () => {
  // Anchor the fermentation start 5 days ago so the J+N headline
  // computes to a sensible mid-fermentation moment matching the
  // marketing screenshot intent ("Fermenter" parcours step).
  const fiveDaysAgo = new Date(
    Date.now() - 5 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const fermentationInProgressBatch = {
    id: "b-demo-pdd-ferm",
    ownerId: "u-demo-1",
    recipeId: "r-demo-pdd",
    status: "in_progress",
    currentStepOrder: 2,
    steps: [
      {
        batchId: "b-demo-pdd-ferm",
        stepOrder: 0,
        type: "mash",
        label: "Empâtage 67°C",
        status: "completed",
      },
      {
        batchId: "b-demo-pdd-ferm",
        stepOrder: 1,
        type: "boil",
        label: "Ébullition 60 min",
        status: "completed",
      },
      {
        batchId: "b-demo-pdd-ferm",
        stepOrder: 2,
        type: "fermentation",
        label: "Fermentation primaire",
        status: "in_progress",
        startedAt: fiveDaysAgo,
      },
    ],
  };

  beforeEach(() => {
    mockReplace.mockReset();
    dataSource.useDemoData = true;
    (getBatchDetails as jest.Mock).mockResolvedValue(
      fermentationInProgressBatch,
    );
  });

  it("renders the J+N headline and progress bar when fermentation is active (happy path)", async () => {
    renderBatchDetailsScreen("b-demo-pdd-ferm");

    expect(await screen.findByText("Fermentation")).toBeTruthy();
    expect(screen.getByText("J+5 / J+14")).toBeTruthy();
    expect(screen.getByText("Densité actuelle")).toBeTruthy();
    expect(screen.getByText("Température")).toBeTruthy();
  });

  it("renders the gravity numbers derived from the recipe OG/FG (edge path)", async () => {
    renderBatchDetailsScreen("b-demo-pdd-ferm");

    await screen.findByText("Fermentation");

    // Recipe r-demo-pdd has OG 1.048 and FG 1.012. At 5/14 of the
    // fermentation arc the linear-interp current gravity is
    // 1.048 - (1.048 - 1.012) * (5 / 14) = 1.035.
    expect(screen.getByText("1.035")).toBeTruthy();
    expect(screen.getByText(/cible 1\.012 · départ 1\.048/)).toBeTruthy();
    expect(screen.getByText("19 °C")).toBeTruthy();
    expect(screen.getByText("idéal 18–20 °C")).toBeTruthy();
  });

  it("pins the headline to J+5 even when fermentation started long ago (regression)", async () => {
    const longAgo = new Date(
      Date.now() - 40 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const longAgoBatch = {
      ...fermentationInProgressBatch,
      steps: fermentationInProgressBatch.steps.map((step) =>
        step.stepOrder === 2 ? { ...step, startedAt: longAgo } : step,
      ),
    };
    (getBatchDetails as jest.Mock).mockResolvedValue(longAgoBatch);

    renderBatchDetailsScreen("b-demo-pdd-ferm");

    // A date-derived count would cap at J+14 here; the demo pin keeps J+5.
    expect(await screen.findByText("Fermentation")).toBeTruthy();
    expect(screen.getByText("J+5 / J+14")).toBeTruthy();
  });

  it("hides the fermentation card in live mode (sad path)", async () => {
    dataSource.useDemoData = false;

    renderBatchDetailsScreen("b-demo-pdd-ferm");

    await screen.findByText("Batch b-demo-p");
    expect(screen.queryByText("Fermentation")).toBeNull();
    expect(screen.queryByText(/J\+\d/)).toBeNull();
  });

  it("hides the fermentation card when the current step is not fermentation", async () => {
    (getBatchDetails as jest.Mock).mockResolvedValue(mashBatch);

    renderBatchDetailsScreen();

    await screen.findByText("Batch b1");
    expect(screen.queryByText("J+5 / J+14")).toBeNull();
    expect(screen.queryByText("Densité actuelle")).toBeNull();
  });

  it("hides the fermentation card when the fermentation step is not yet in progress", async () => {
    const stepStatuses = ["completed", "in_progress", "pending"] as const;
    (getBatchDetails as jest.Mock).mockResolvedValue({
      ...fermentationInProgressBatch,
      currentStepOrder: 1,
      steps: fermentationInProgressBatch.steps.map((step, index) => ({
        ...step,
        status: stepStatuses[index],
        startedAt: index === 2 ? null : step.startedAt,
      })),
    });

    renderBatchDetailsScreen("b-demo-pdd-ferm");

    await screen.findByText("Batch b-demo-p");
    expect(screen.queryByText("Densité actuelle")).toBeNull();
  });
});
