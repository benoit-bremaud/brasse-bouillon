import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import React from "react";
import { Alert } from "react-native";

import { BrewPrepScreen } from "@/features/recipes/presentation/BrewPrepScreen";
import {
  getRecipeDetailsViewModel,
  type RecipeDetailsIngredientItem,
} from "@/features/recipes/application/recipes.use-cases";
import { startBatch } from "@/features/batches/application/batches.use-cases";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  getRecipeDetailsViewModel: jest.fn(),
}));

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  startBatch: jest.fn(),
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({ push: mockPush, back: mockBack }),
  };
});

const mockGetViewModel = getRecipeDetailsViewModel as jest.Mock;
const mockStartBatch = startBatch as jest.Mock;

const PILSNER_ROW = "ingredient-readiness-row-ferm-1-no-timing-0";
const CASCADE_ROW = "ingredient-readiness-row-hop-1-no-timing-1";
const PILSNER_MISSING = "ingredient-readiness-missing-ferm-1-no-timing-0";
const CASCADE_MISSING = "ingredient-readiness-missing-hop-1-no-timing-1";

function buildViewModel(ingredients: RecipeDetailsIngredientItem[]) {
  return {
    recipe: {
      id: "r1",
      name: "Blonde Facile",
      visibility: "public",
      version: 1,
      rootRecipeId: "r1",
      parentRecipeId: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    steps: [],
    equipment: [],
    ingredients,
  };
}

const TWO_INGREDIENTS: RecipeDetailsIngredientItem[] = [
  {
    ingredientId: "ferm-1",
    name: "Pilsner Malt",
    category: "malt",
    amount: 0.9,
    unit: "kg",
    timing: null,
    notes: null,
    ingredient: null,
  },
  {
    ingredientId: "hop-1",
    name: "Cascade",
    category: "hop",
    amount: 5,
    unit: "g",
    timing: null,
    notes: null,
    ingredient: null,
  },
];

function renderScreen(recipeId = "r1") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrewPrepScreen recipeId={recipeId} />
    </QueryClientProvider>,
  );
}

function tickAll() {
  screen.getAllByRole("checkbox").forEach((box) => fireEvent.press(box));
}

// The launch confirmation is a native Alert; grab the "Lancer" button from the
// last Alert.alert call and invoke its onPress to simulate the user confirming.
function confirmLaunchAlert() {
  const calls = (Alert.alert as jest.Mock).mock.calls;
  const buttons = calls[calls.length - 1][2] as Array<{
    text: string;
    onPress?: () => void;
  }>;
  buttons.find((button) => button.text === "Lancer")?.onPress?.();
}

describe("BrewPrepScreen — pre-launch gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockStartBatch.mockResolvedValue({ id: "b1" });
  });

  it("happy: lists ingredients as missing and keeps the launch gated", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel(TWO_INGREDIENTS));

    renderScreen();

    expect(await screen.findByText("Pilsner Malt")).toBeTruthy();
    expect(screen.getByTestId(PILSNER_ROW)).toBeTruthy();
    expect(screen.getByTestId(CASCADE_ROW)).toBeTruthy();
    expect(screen.getByTestId(PILSNER_MISSING)).toBeTruthy();
    expect(screen.getByTestId(CASCADE_MISSING)).toBeTruthy();

    // Gate closed: pressing the disabled CTA must not open the dialog.
    fireEvent.press(screen.getByText("Lancer le brassage"));
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockStartBatch).not.toHaveBeenCalled();
  });

  it("interaction: ticking everything opens the gate (Prêt), unticking re-closes it", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel(TWO_INGREDIENTS));

    renderScreen();
    await screen.findByText("Pilsner Malt");

    tickAll();
    expect(screen.queryByTestId(PILSNER_MISSING)).toBeNull();
    expect(screen.queryByTestId(CASCADE_MISSING)).toBeNull();
    expect(screen.getByText("PRÊT")).toBeTruthy();
    expect(
      screen.getByText("Tu as tous les ingrédients de la recette."),
    ).toBeTruthy();

    // Untick one → gate closes again, item is missing once more.
    fireEvent.press(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByTestId(PILSNER_MISSING)).toBeTruthy();
    expect(screen.queryByText("PRÊT")).toBeNull();
  });

  it("launch: confirming the dialog starts the batch and navigates to it", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel(TWO_INGREDIENTS));

    renderScreen();
    await screen.findByText("Pilsner Malt");

    tickAll();
    fireEvent.press(screen.getByText("Lancer le brassage"));
    expect(Alert.alert).toHaveBeenCalledTimes(1);

    await act(async () => {
      confirmLaunchAlert();
    });

    await waitFor(() => {
      expect(mockStartBatch).toHaveBeenCalledWith("r1");
      expect(mockPush).toHaveBeenCalledWith("/(app)/batches/b1");
    });
  });

  it("sad: a failed launch surfaces the error banner and does not navigate", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel(TWO_INGREDIENTS));
    mockStartBatch.mockRejectedValueOnce(new Error("Backend down"));

    renderScreen();
    await screen.findByText("Pilsner Malt");

    tickAll();
    fireEvent.press(screen.getByText("Lancer le brassage"));
    await act(async () => {
      confirmLaunchAlert();
    });

    expect(await screen.findByText(/Backend down/i)).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("edge: an empty ingredient list shows the empty state but still allows launch", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel([]));

    renderScreen();

    expect(await screen.findByText("Aucun ingrédient listé")).toBeTruthy();
    expect(screen.queryByText("Ce qu'il te manque")).toBeNull();

    // Nothing to check → the gate is vacuously open and the launch proceeds.
    fireEvent.press(screen.getByText("Lancer le brassage"));
    expect(Alert.alert).toHaveBeenCalledTimes(1);
    await act(async () => {
      confirmLaunchAlert();
    });
    await waitFor(() => {
      expect(mockStartBatch).toHaveBeenCalledWith("r1");
      expect(mockPush).toHaveBeenCalledWith("/(app)/batches/b1");
    });
  });

  it("sad: shows a not-found state (not an empty checklist) when the recipe is missing", async () => {
    mockGetViewModel.mockResolvedValue(null);

    renderScreen();

    expect(await screen.findByText("Recette introuvable")).toBeTruthy();
    expect(screen.queryByText("Aucun ingrédient listé")).toBeNull();
  });

  it("sad: shows an error with retry when the recipe fails to load", async () => {
    mockGetViewModel.mockRejectedValue(new Error("network down"));

    renderScreen();

    expect(await screen.findByText("Réessayer")).toBeTruthy();
    expect(screen.queryByText("Pilsner Malt")).toBeNull();
  });
});
