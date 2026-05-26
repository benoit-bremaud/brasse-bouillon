import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { BatchDetailsScreen } from "@/features/batches/presentation/BatchDetailsScreen";
import {
  getBatchDetailsViewModel,
  type BatchDetailsViewModel,
} from "@/features/batches/application/batches.use-cases";
import { Batch } from "@/features/batches/domain/batch.types";
import { dataSource } from "@/core/data/data-source";

// Shared timestamps so fixtures satisfy the full `Batch` shape without noise.
const TS = "2026-05-01T08:00:00.000Z";

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

const mashBatch: Batch = {
  id: "b1",
  ownerId: "u-demo-1",
  recipeId: "r1",
  status: "in_progress",
  currentStepOrder: 0,
  startedAt: TS,
  createdAt: TS,
  updatedAt: TS,
  steps: [
    {
      batchId: "b1",
      stepOrder: 0,
      type: "mash",
      label: "Empâtage 67°C",
      status: "in_progress",
      createdAt: TS,
      updatedAt: TS,
    },
    {
      batchId: "b1",
      stepOrder: 1,
      type: "boil",
      label: "Ébullition 60 min",
      status: "pending",
      createdAt: TS,
      updatedAt: TS,
    },
  ],
};

// Helper: the screen now consumes a view-model { batch, recipeName }.
const viewModel = (
  batch: Batch,
  recipeName: string | null,
): BatchDetailsViewModel => ({
  batch,
  recipeName,
});

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  getBatchDetailsViewModel: jest.fn(),
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
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(mashBatch, "Ma recette test"),
    );
  });

  it("renders batch details with the recipe name as title (happy path)", async () => {
    renderBatchDetailsScreen();

    // Title is the recipe name, not the technical batch id.
    expect(await screen.findByText("Ma recette test")).toBeTruthy();
    expect(screen.getByText("Progression du brassin")).toBeTruthy();
    expect(screen.getByText("Étapes")).toBeTruthy();
    expect(screen.getByText("Terminer l'étape en cours")).toBeTruthy();
  });

  it("renders French status, step index, badges and phase labels", async () => {
    renderBatchDetailsScreen();

    await screen.findByText("Ma recette test");

    expect(screen.getByText("Statut : En cours")).toBeTruthy();
    // currentStepOrder 0 is displayed 1-indexed for humans.
    expect(screen.getByText("Étape en cours : 1")).toBeTruthy();
    // Step status badges (in_progress → "En cours", pending → "À venir").
    // The Badge component uppercases its label for display.
    expect(screen.getByText("EN COURS")).toBeTruthy();
    expect(screen.getByText("À VENIR")).toBeTruthy();
    // Phase enums localized (mash → "Empâtage", boil → "Ébullition").
    expect(screen.getByText("Empâtage")).toBeTruthy();
    expect(screen.getByText("Ébullition")).toBeTruthy();
    // The raw technical id must never be shown as the title.
    expect(screen.queryByText("Batch b1")).toBeNull();
  });

  it("falls back to a French 'Brassin <id>' title when no recipe name (sad path)", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(mashBatch, null),
    );

    renderBatchDetailsScreen();

    expect(await screen.findByText("Brassin b1")).toBeTruthy();
  });

  it("navigates back to batches list from header action", async () => {
    renderBatchDetailsScreen();

    expect(await screen.findByText("Ma recette test")).toBeTruthy();

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

  const fermentationInProgressBatch: Batch = {
    id: "b-demo-pdd-ferm",
    ownerId: "u-demo-1",
    recipeId: "r-demo-pdd",
    status: "in_progress",
    currentStepOrder: 2,
    startedAt: TS,
    createdAt: TS,
    updatedAt: TS,
    steps: [
      {
        batchId: "b-demo-pdd-ferm",
        stepOrder: 0,
        type: "mash",
        label: "Empâtage 67°C",
        status: "completed",
        createdAt: TS,
        updatedAt: TS,
      },
      {
        batchId: "b-demo-pdd-ferm",
        stepOrder: 1,
        type: "boil",
        label: "Ébullition 60 min",
        status: "completed",
        createdAt: TS,
        updatedAt: TS,
      },
      {
        batchId: "b-demo-pdd-ferm",
        stepOrder: 2,
        type: "fermentation",
        label: "Fermentation primaire",
        status: "in_progress",
        startedAt: fiveDaysAgo,
        createdAt: TS,
        updatedAt: TS,
      },
    ],
  };

  beforeEach(() => {
    mockReplace.mockReset();
    dataSource.useDemoData = true;
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(fermentationInProgressBatch, "La Première du dimanche"),
    );
  });

  it("renders the J+N headline and progress bar when fermentation is active (happy path)", async () => {
    renderBatchDetailsScreen("b-demo-pdd-ferm");

    // Anchor on a card-unique label: "Fermentation" alone is ambiguous now
    // that the step-phase enum also renders as "Fermentation".
    expect(await screen.findByText("Densité actuelle")).toBeTruthy();
    expect(screen.getByText("J+5 / J+14")).toBeTruthy();
    expect(screen.getByText("Densité actuelle")).toBeTruthy();
    expect(screen.getByText("Température")).toBeTruthy();
  });

  it("renders the gravity numbers derived from the recipe OG/FG (edge path)", async () => {
    renderBatchDetailsScreen("b-demo-pdd-ferm");

    await screen.findByText("Densité actuelle");

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
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(longAgoBatch, "La Première du dimanche"),
    );

    renderBatchDetailsScreen("b-demo-pdd-ferm");

    // A date-derived count would cap at J+14 here; the demo pin keeps J+5.
    expect(await screen.findByText("Densité actuelle")).toBeTruthy();
    expect(screen.getByText("J+5 / J+14")).toBeTruthy();
  });

  it("hides the fermentation card in live mode (sad path)", async () => {
    dataSource.useDemoData = false;

    renderBatchDetailsScreen("b-demo-pdd-ferm");

    await screen.findByText("La Première du dimanche");
    // The fermentation *card* is hidden in live mode; the step-phase label
    // "Fermentation" in the steps list legitimately stays, so assert on the
    // card-only "Densité actuelle" metric instead.
    expect(screen.queryByText("Densité actuelle")).toBeNull();
    expect(screen.queryByText(/J\+\d/)).toBeNull();
  });

  it("hides the fermentation card when the current step is not fermentation", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(mashBatch, "Ma recette test"),
    );

    renderBatchDetailsScreen();

    await screen.findByText("Ma recette test");
    expect(screen.queryByText("J+5 / J+14")).toBeNull();
    expect(screen.queryByText("Densité actuelle")).toBeNull();
  });

  it("hides the fermentation card when the fermentation step is not yet in progress", async () => {
    const stepStatuses = ["completed", "in_progress", "pending"] as const;
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(
        {
          ...fermentationInProgressBatch,
          currentStepOrder: 1,
          steps: fermentationInProgressBatch.steps.map((step, index) => ({
            ...step,
            status: stepStatuses[index],
            startedAt: index === 2 ? null : step.startedAt,
          })),
        },
        "La Première du dimanche",
      ),
    );

    renderBatchDetailsScreen("b-demo-pdd-ferm");

    await screen.findByText("La Première du dimanche");
    expect(screen.queryByText("Densité actuelle")).toBeNull();
  });
});

describe("BatchDetailsScreen — brewing step timer + pedagogical tip (#781)", () => {
  const guidedMashBatch: Batch = {
    ...mashBatch,
    steps: [
      {
        ...mashBatch.steps[0],
        plannedDurationMin: 30,
        pedagogicalTip:
          "À 67°C, l'alpha-amylase convertit l'amidon en sucres fermentescibles.",
      },
      mashBatch.steps[1],
    ],
  };

  beforeEach(() => {
    mockReplace.mockReset();
    dataSource.useDemoData = true;
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(guidedMashBatch, "La Première du dimanche"),
    );
  });

  // Happy path: an in-progress step with a planned duration shows the timer.
  it("renders the step timer when the active step has a planned duration", async () => {
    renderBatchDetailsScreen();

    expect(await screen.findByText("Minuterie d'étape")).toBeTruthy();
  });

  // Sad path: a step without a planned duration hides the timer.
  it("hides the step timer when the active step has no planned duration", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(mashBatch, "Ma recette test"),
    );

    renderBatchDetailsScreen();

    await screen.findByText("Ma recette test");
    expect(screen.queryByText("Minuterie d'étape")).toBeNull();
  });

  // Edge: the ⓘ action opens the tip modal, and "Compris" dismisses it.
  it("opens the pedagogical-tip modal from ⓘ and dismisses it", async () => {
    renderBatchDetailsScreen();

    await screen.findByText("La Première du dimanche");

    fireEvent.press(screen.getByLabelText("Astuce pour l'étape Empâtage 67°C"));
    expect(screen.getByText(/alpha-amylase convertit l'amidon/)).toBeTruthy();

    fireEvent.press(screen.getByText("Compris"));
    expect(screen.queryByText(/alpha-amylase convertit l'amidon/)).toBeNull();
  });
});
