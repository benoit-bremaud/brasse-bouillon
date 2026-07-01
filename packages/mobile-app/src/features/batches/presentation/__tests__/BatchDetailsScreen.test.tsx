import { Alert, type AlertButton } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { BatchDetailsScreen } from "@/features/batches/presentation/BatchDetailsScreen";
import {
  completeCurrentBatchStep,
  deleteBatch,
  getBatchDetailsViewModel,
  type BatchDetailsViewModel,
} from "@/features/batches/application/batches.use-cases";
import { listBatchMeasurements } from "@/features/batches/application/measurement.use-cases";
import { getTasting } from "@/features/batches/application/bottling.use-cases";
import { Batch } from "@/features/batches/domain/batch.types";
import { Measurement } from "@/features/batches/domain/measurement.types";
import { dataSource } from "@/core/data/data-source";

// Shared timestamps so fixtures satisfy the full `Batch` shape without noise.
const TS = "2026-05-01T08:00:00.000Z";

const mockReplace = jest.fn();
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
  deleteBatch: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/features/batches/application/measurement.use-cases", () => ({
  listBatchMeasurements: jest.fn(() => Promise.resolve([])),
  recordBatchMeasurement: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("@/features/batches/application/bottling.use-cases", () => ({
  getTasting: jest.fn(() => Promise.resolve(null)),
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

  // Always restore jest.spyOn spies (e.g. the Alert.alert spy in the F6 tests)
  // even when an assertion throws, so a spy can never leak into later tests.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders batch details with the recipe name as title (happy path)", async () => {
    renderBatchDetailsScreen();

    // Title is the recipe name, not the technical batch id.
    expect(await screen.findByText("Ma recette test")).toBeTruthy();
    expect(screen.getByText("Progression du brassin")).toBeTruthy();
    expect(screen.getByText("Étapes")).toBeTruthy();
    expect(screen.getByText("Terminer l'étape en cours")).toBeTruthy();
  });

  it("confirms before completing a step, then completes on confirm (F6)", async () => {
    (completeCurrentBatchStep as jest.Mock).mockClear();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByText("Terminer l'étape en cours"));

    // The tap opens a confirmation dialog rather than completing immediately.
    expect(alertSpy).toHaveBeenCalledWith(
      "Terminer cette étape ?",
      expect.any(String),
      expect.any(Array),
    );
    expect(completeCurrentBatchStep).not.toHaveBeenCalled();

    // Confirming the dialog runs the completion.
    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    buttons.find((button) => button.text === "Terminer")?.onPress?.();

    await waitFor(() =>
      expect(completeCurrentBatchStep).toHaveBeenCalledTimes(1),
    );
  });

  it("does not complete the step when the confirmation is cancelled (F6, sad path)", async () => {
    (completeCurrentBatchStep as jest.Mock).mockClear();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByText("Terminer l'étape en cours"));

    // Opening the confirmation dialog must not complete anything on its own.
    expect(completeCurrentBatchStep).not.toHaveBeenCalled();

    // "Annuler" is a pure native dismiss (no handler), so cancelling can never
    // reach the completion mutation — assert it carries no onPress.
    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    const cancelButton = buttons.find((button) => button.text === "Annuler");
    expect(cancelButton).toBeDefined();
    expect(cancelButton?.onPress).toBeUndefined();
  });

  it("deletes the batch after confirmation and navigates back (F25)", async () => {
    (deleteBatch as jest.Mock).mockClear();
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByLabelText("Supprimer ce brassin"));

    // The tap opens a confirmation dialog rather than deleting immediately.
    expect(alertSpy).toHaveBeenCalled();
    expect(deleteBatch).not.toHaveBeenCalled();

    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    buttons.find((button) => button.text === "Supprimer")?.onPress?.();

    await waitFor(() => expect(deleteBatch).toHaveBeenCalledWith("b1"));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/batches"));
  });

  it("surfaces an error and does not navigate when the batch delete fails (F25, sad)", async () => {
    (deleteBatch as jest.Mock).mockRejectedValueOnce(new Error("boom"));
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByLabelText("Supprimer ce brassin"));
    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    buttons.find((button) => button.text === "Supprimer")?.onPress?.();

    // The onError sets the shared error banner; getErrorMessage surfaces the
    // error's own message ("boom") over the fallback copy.
    expect(await screen.findByText("boom")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalledWith("/batches");
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

describe("BatchDetailsScreen — measurement card (B2)", () => {
  const measurementFixture = (
    type: "og" | "fg",
    value: number,
    takenAt: string,
  ): Measurement => ({
    id: `m-${type}-${value}`,
    batchId: "b1",
    stepOrder: null,
    type,
    value,
    unit: null,
    takenAt,
    createdAt: takenAt,
  });

  beforeEach(() => {
    mockPush.mockReset();
    dataSource.useDemoData = false;
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue(
      viewModel(mashBatch, "Ma recette test"),
    );
    (listBatchMeasurements as jest.Mock).mockResolvedValue([]);
  });

  // Happy path: OG + FG recorded → the app computes and shows the ABV.
  it("shows the computed ABV when both OG and FG are recorded", async () => {
    (listBatchMeasurements as jest.Mock).mockResolvedValue([
      measurementFixture("og", 1.06, "2026-05-01T08:00:00.000Z"),
      measurementFixture("fg", 1.01, "2026-05-15T08:00:00.000Z"),
    ]);

    renderBatchDetailsScreen();

    // (1.06 - 1.01) × 131.25 = 6.5625 → rounded to 1 decimal → 6.6.
    expect(await screen.findByText("6.6 % vol")).toBeTruthy();
    expect(screen.getByText(/131,25/)).toBeTruthy();
  });

  // Edge path: only OG recorded → teach that ABV needs the final gravity.
  it("invites recording FG when only OG exists", async () => {
    (listBatchMeasurements as jest.Mock).mockResolvedValue([
      measurementFixture("og", 1.06, "2026-05-01T08:00:00.000Z"),
    ]);

    renderBatchDetailsScreen();

    expect(
      await screen.findByText(/ABV calculée à la fin de la fermentation/),
    ).toBeTruthy();
    // No alcohol figure is shown until FG is recorded.
    expect(screen.queryByText(/% vol/)).toBeNull();
  });

  // Sad path: no reading yet → invite recording the original gravity.
  it("invites recording OG when no measurement exists", async () => {
    renderBatchDetailsScreen();

    expect(await screen.findByText(/Aucune densité saisie/)).toBeTruthy();
  });

  // Edge: when several OG readings exist, the latest (by takenAt) is forwarded.
  it("forwards the latest recorded OG to the measurement route", async () => {
    (listBatchMeasurements as jest.Mock).mockResolvedValue([
      measurementFixture("og", 1.04, "2026-05-01T08:00:00.000Z"),
      measurementFixture("og", 1.05, "2026-05-03T08:00:00.000Z"),
    ]);

    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByText("Saisir une densité"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/batches/[id]/measurement",
      params: { id: "b1", og: "1.05" },
    });
  });

  // Navigation without an OG param when no reading exists yet.
  it("navigates without an OG param when no measurement exists", async () => {
    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByText("Saisir une densité"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/batches/[id]/measurement",
      params: { id: "b1" },
    });
  });
});

describe("BatchDetailsScreen — B3 bottling routing + closure view", () => {
  const packagingBatch: Batch = {
    id: "b1",
    ownerId: "u1",
    recipeId: "r1",
    status: "in_progress",
    currentStepOrder: 1,
    startedAt: TS,
    createdAt: TS,
    updatedAt: TS,
    steps: [
      {
        batchId: "b1",
        stepOrder: 0,
        type: "fermentation",
        label: "Fermentation",
        status: "completed",
        createdAt: TS,
        updatedAt: TS,
      },
      {
        batchId: "b1",
        stepOrder: 1,
        type: "packaging",
        label: "Conditionnement",
        status: "in_progress",
        createdAt: TS,
        updatedAt: TS,
      },
    ],
  };

  const completedBatch: Batch = {
    ...packagingBatch,
    status: "completed",
    currentStepOrder: null,
    bottledAt: "2026-06-20T09:00:00.000Z",
    completedAt: "2026-06-20T09:00:00.000Z",
    steps: packagingBatch.steps.map((step) => ({
      ...step,
      status: "completed",
    })),
  };

  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    dataSource.useDemoData = false;
    (listBatchMeasurements as jest.Mock).mockResolvedValue([]);
    (getTasting as jest.Mock).mockResolvedValue(null);
  });

  it("routes a live PACKAGING step to the bottling screen instead of the dead-end button (happy path)", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue({
      batch: packagingBatch,
      recipeName: "Ma blonde",
      recipeVolumeL: 4.3,
    });

    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByText("Mettre en bouteille"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/batches/[id]/bottling",
      params: { id: "b1" },
    });
    // The dead-end complete button must not be shown on the packaging step.
    expect(screen.queryByText("Terminer l'étape en cours")).toBeNull();
  });

  it("keeps the complete button for non-packaging live steps (sad path)", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue({
      batch: {
        ...packagingBatch,
        currentStepOrder: 0,
        steps: packagingBatch.steps.map((step) =>
          step.stepOrder === 0
            ? { ...step, status: "in_progress" }
            : { ...step, status: "pending" },
        ),
      },
      recipeName: "Ma blonde",
      recipeVolumeL: 4.3,
    });

    renderBatchDetailsScreen();

    expect(await screen.findByText("Terminer l'étape en cours")).toBeTruthy();
    expect(screen.queryByText("Mettre en bouteille")).toBeNull();
  });

  it("renders the live closure view fed by the real batch when completed (happy path)", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue({
      batch: completedBatch,
      recipeName: "Ma blonde",
      recipeVolumeL: 4.3,
    });

    renderBatchDetailsScreen();

    expect(await screen.findByTestId("batch-closure-view")).toBeTruthy();
    expect(screen.getByText("Volume : 4.3 L")).toBeTruthy();
    expect(screen.getByText(/Mis en bouteille le/)).toBeTruthy();
    // The completed live path replaces the steps list + measurement card.
    expect(screen.queryByText("Étapes")).toBeNull();
  });

  it("navigates to the tasting route from the closure CTA (happy path)", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue({
      batch: completedBatch,
      recipeName: "Ma blonde",
      recipeVolumeL: 4.3,
    });

    renderBatchDetailsScreen();

    fireEvent.press(await screen.findByText("Noter ma dégustation"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/batches/[id]/tasting",
      params: { id: "b1" },
    });
  });

  it("shows the recorded tasting in the closure view when present (edge path)", async () => {
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue({
      batch: completedBatch,
      recipeName: "Ma blonde",
      recipeVolumeL: 4.3,
    });
    (getTasting as jest.Mock).mockResolvedValue({
      id: "t1",
      batchId: "b1",
      rating: 5,
      note: "À refaire",
      createdAt: "2026-06-21T09:00:00.000Z",
    });

    renderBatchDetailsScreen();

    expect(await screen.findByTestId("closure-tasting-note")).toHaveTextContent(
      /À refaire/,
    );
    // v1 = one tasting per batch (no update path): once recorded, the CTA is
    // hidden rather than offering a "Modifier" that would 409 on the backend.
    expect(screen.queryByText("Modifier ma dégustation")).toBeNull();
    expect(screen.queryByText("Noter ma dégustation")).toBeNull();
  });

  it("does not show the closure view in demo mode even when completed (sad path)", async () => {
    dataSource.useDemoData = true;
    (getBatchDetailsViewModel as jest.Mock).mockResolvedValue({
      batch: completedBatch,
      recipeName: "Ma blonde",
      recipeVolumeL: 4.3,
    });

    renderBatchDetailsScreen();

    await screen.findByText("Ma blonde");
    // Demo keeps the original behaviour (steps list + disabled button).
    expect(screen.queryByTestId("batch-closure-view")).toBeNull();
    expect(screen.getByText("Étapes")).toBeTruthy();
  });
});
