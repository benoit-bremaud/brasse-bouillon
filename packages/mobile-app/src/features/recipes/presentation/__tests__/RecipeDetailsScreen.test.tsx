import React from "react";
import { Alert, type AlertButton } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { RecipeDetailsScreen } from "@/features/recipes/presentation/RecipeDetailsScreen";
import {
  deleteRecipeFromCarnet,
  getRecipeDetailsViewModel,
  importRecipeFromCommunity,
} from "@/features/recipes/application/recipes.use-cases";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

type SliderMockProps = {
  testID?: string;
  value: number;
  onSlidingComplete?: (value: number) => void;
};

jest.mock("@react-native-community/slider", () => {
  const RN = jest.requireActual("react-native");
  const ReactActual = jest.requireActual("react");

  return {
    __esModule: true,
    default: function MockSlider(props: SliderMockProps) {
      const { testID, value, onSlidingComplete } = props;
      return ReactActual.createElement(
        RN.Pressable,
        {
          testID,
          accessibilityRole: "slider",
          onPress: () => {
            if (typeof onSlidingComplete === "function") {
              onSlidingComplete(value + 20);
            }
          },
        },
        ReactActual.createElement(RN.Text, null, "slider value=" + value),
      );
    },
  };
});

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

const baseViewModel = {
  recipe: {
    id: "r1",
    // Private recipe → owned by the current user, so the API projects ownerId.
    ownerId: "u1",
    name: "Test Recipe",
    description: "Test description",
    visibility: "private",
    version: 1,
    rootRecipeId: "r1",
    parentRecipeId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    stats: {
      ibu: 35,
      abv: 5.4,
      og: 1.052,
      fg: 1.011,
      volumeLiters: 20,
    },
  },
  ingredients: [
    {
      ingredientId: "hop-1",
      name: "Citra",
      category: "hop",
      amount: 25,
      unit: "g",
      timing: "boil - 10 min",
      notes: null,
      ingredient: {
        id: "hop-1",
        name: "Citra",
        category: "hop",
      },
    },
  ],
  equipment: [
    {
      equipmentId: "eq-1",
      role: "Mash & boil",
      notes: null,
      equipment: {
        id: "eq-1",
        name: "Braumeister 20L",
        type: "all-in-one",
        volumeLiters: 20,
      },
    },
  ],
  steps: [
    {
      recipeId: "r1",
      stepOrder: 0,
      label: "Mash",
      type: "mash",
      description: "Hold at 67°C",
    },
  ],
};

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  getRecipeDetailsViewModel: jest.fn(),
  importRecipeFromCommunity: jest.fn(),
  deleteRecipeFromCarnet: jest.fn(),
}));

// A PUBLIC recipe the current user does NOT own: the API strips ownerId, so the
// detail screen should offer « Ajouter à mon carnet » (import) instead of the
// prepare / delete actions.
const publicViewModel = {
  ...baseViewModel,
  recipe: {
    ...baseViewModel.recipe,
    ownerId: undefined,
    visibility: "public",
  },
};

function renderRecipeDetails(recipeId = "r1") {
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
      <RecipeDetailsScreen recipeId={recipeId} />
    </QueryClientProvider>,
  );
}

function switchToTab(tabId: string) {
  fireEvent.press(screen.getByTestId(`recipe-detail-tab-${tabId}`));
}

describe("RecipeDetailsScreen — 5-tab redesigned layout (Issue #740 v2)", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    (getRecipeDetailsViewModel as jest.Mock).mockReset();
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValue(baseViewModel);
    (importRecipeFromCommunity as jest.Mock).mockReset();
    (importRecipeFromCommunity as jest.Mock).mockResolvedValue({
      recipeId: "r-owned-9",
      name: "Imported recipe",
    });
    (deleteRecipeFromCarnet as jest.Mock).mockReset();
    (deleteRecipeFromCarnet as jest.Mock).mockResolvedValue(undefined);
  });

  // Restore jest.spyOn spies (the Alert.alert spy in the delete test) even when
  // an assertion throws, so the spy never leaks into later tests.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the side rail and lands on Overview by default", async () => {
    renderRecipeDetails();

    expect(await screen.findByTestId("recipe-detail-side-rail")).toBeTruthy();
    expect(screen.getByTestId("recipe-detail-tab-overview")).toBeTruthy();
    expect(screen.getByTestId("recipe-detail-tab-ingredients")).toBeTruthy();
    expect(screen.getByTestId("recipe-detail-tab-water")).toBeTruthy();
    expect(screen.getByTestId("recipe-detail-tab-brewing")).toBeTruthy();
    expect(screen.getByTestId("recipe-detail-tab-reviews")).toBeTruthy();
    expect(screen.getByTestId("recipe-overview-tab")).toBeTruthy();
    expect(screen.getByText("Test Recipe")).toBeTruthy();
    expect(screen.getByText("En un coup d'œil")).toBeTruthy();
  });

  it("shows the equipment checklist on the Overview tab", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");

    expect(screen.getByText("Matériel requis")).toBeTruthy();
    expect(screen.getByTestId("recipe-equipment-checklist-eq-1")).toBeTruthy();
    expect(screen.getByText("Braumeister 20L")).toBeTruthy();
  });

  it("opens the brew preparation screen from the sticky CTA", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    fireEvent.press(screen.getByText("Préparer mon brassin"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/recipes/[id]/prepare",
      params: { id: "r1" },
    });
  });

  it("F23: a public recipe shows « Ajouter à mon carnet » and imports on press, then lands on the owned copy", async () => {
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValue(publicViewModel);
    renderRecipeDetails("pub-1");

    fireEvent.press(await screen.findByText("Ajouter à mon carnet"));

    await waitFor(() =>
      expect(importRecipeFromCommunity).toHaveBeenCalledWith("pub-1"),
    );
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: "/(app)/recipes/[id]",
        params: { id: "r-owned-9" },
      }),
    );
    // The prepare action is not offered for a recipe the user does not own yet.
    expect(screen.queryByText("Préparer mon brassin")).toBeNull();
  });

  it("F23: an owned recipe does not show the import CTA (it shows prepare)", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    expect(screen.getByText("Préparer mon brassin")).toBeTruthy();
    expect(screen.queryByText("Ajouter à mon carnet")).toBeNull();
  });

  it("F24: an owned recipe offers delete and removes it on confirm", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    fireEvent.press(screen.getByLabelText("Supprimer cette recette"));

    // The tap opens a confirmation dialog rather than deleting immediately.
    expect(alertSpy).toHaveBeenCalled();
    expect(deleteRecipeFromCarnet).not.toHaveBeenCalled();

    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    buttons.find((button) => button.text === "Supprimer")?.onPress?.();

    await waitFor(() =>
      expect(deleteRecipeFromCarnet).toHaveBeenCalledWith("r1"),
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/recipes"));
  });

  it("F24: a public recipe the user does not own offers no delete action", async () => {
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValue(publicViewModel);
    renderRecipeDetails("pub-1");

    await screen.findByText("Ajouter à mon carnet");
    expect(screen.queryByLabelText("Supprimer cette recette")).toBeNull();
  });

  it("F24: surfaces an alert and does not navigate when the delete fails (sad path)", async () => {
    (deleteRecipeFromCarnet as jest.Mock).mockRejectedValueOnce(
      new Error("boom"),
    );
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    fireEvent.press(screen.getByLabelText("Supprimer cette recette"));

    // Confirm the deletion in the first dialog.
    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    buttons.find((button) => button.text === "Supprimer")?.onPress?.();

    // The failure surfaces a second alert and never navigates away.
    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(2));
    expect(mockReplace).not.toHaveBeenCalledWith("/recipes");
  });

  it("switches to the Ingredients tab and shows the ingredient list", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("ingredients");

    expect(screen.getByTestId("recipe-ingredients-tab")).toBeTruthy();
    expect(screen.getByText("Volume cible")).toBeTruthy();
    expect(screen.getAllByText("Ingrédients").length).toBeGreaterThan(0);
    expect(screen.getByText("Citra")).toBeTruthy();
    expect(screen.getByText("Hops")).toBeTruthy();
  });

  it("scales ingredient quantities when the volume slider changes", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("ingredients");

    expect(screen.getByText("25 g • boil - 10 min")).toBeTruthy();

    // Mock slider bumps the value by +20 on press, so 20 + 20 = 40 L target.
    fireEvent.press(screen.getByTestId("recipe-target-volume-slider"));

    expect(screen.getByText("50 g • boil - 10 min")).toBeTruthy();
    expect(
      screen.getByTestId("recipe-target-volume-readout"),
    ).toHaveTextContent("40 L");
  });

  it("reflects the scaled target volume on the Overview at-a-glance card", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("ingredients");
    fireEvent.press(screen.getByTestId("recipe-target-volume-slider"));
    switchToTab("overview");

    expect(screen.getByText("40 L")).toBeTruthy();
  });

  it("opens hop details with recipe return context", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("ingredients");

    fireEvent.press(screen.getByLabelText("Open ingredient details for Citra"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: {
        category: "hop",
        id: "hop-1",
        returnTo: "/(app)/recipes/[id]",
        returnRecipeId: "r1",
      },
    });
  });

  it("opens malt details with the dedicated malt route", async () => {
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValueOnce({
      ...baseViewModel,
      ingredients: [
        {
          ingredientId: "malt-1",
          name: "Pale Ale Malt",
          category: "malt",
          amount: 4.2,
          unit: "kg",
          timing: "mash",
          notes: null,
          ingredient: {
            id: "malt-1",
            name: "Pale Ale Malt",
            category: "malt",
          },
        },
      ],
    });

    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("ingredients");
    await screen.findByText("Pale Ale Malt");

    fireEvent.press(
      screen.getByLabelText("Open ingredient details for Pale Ale Malt"),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/malts/[id]",
      params: {
        id: "malt-1",
        returnTo: "/(app)/recipes/[id]",
        returnRecipeId: "r1",
      },
    });
  });

  it("opens the shop from the Ingredients tab inline action", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("ingredients");

    fireEvent.press(
      screen.getByLabelText(
        "Ouvrir la boutique depuis la liste des ingrédients",
      ),
    );

    expect(mockPush).toHaveBeenCalledWith("/(app)/shop");
  });

  it("renders the Water tab with profile and salt additions", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("water");

    expect(screen.getByTestId("recipe-water-tab")).toBeTruthy();
    expect(screen.getByText("Profil eau")).toBeTruthy();
    expect(screen.getByText("Ajouter pour matcher")).toBeTruthy();
  });

  it("navigates to the water calculator from the Water tab", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("water");

    fireEvent.press(screen.getByText("Comparer dans le Calculateur Eau"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "eau" },
    });
  });

  it("renders the Brewing tab with the process preview modes", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("brewing");

    expect(screen.getByTestId("recipe-brewing-tab")).toBeTruthy();
    expect(screen.getByText("Aperçu du process")).toBeTruthy();

    // Process modes are labelled in French (#1172).
    expect(screen.getByText("Phases de brassage")).toBeTruthy();
    expect(screen.getByText("Étapes de la recette")).toBeTruthy();
    expect(screen.getByText("Condensé")).toBeTruthy();
    // The default "phases" view shows French brewing-phase titles.
    expect(screen.getByText("🪣 EMPÂTAGE")).toBeTruthy();

    // The active mode chip exposes its selected state to screen readers
    // (#1172, Copilot review).
    expect(
      screen.getByTestId("recipe-process-filter-phases").props
        .accessibilityState.selected,
    ).toBe(true);
    expect(
      screen.getByTestId("recipe-process-filter-recipe").props
        .accessibilityState.selected,
    ).toBe(false);

    fireEvent.press(screen.getByTestId("recipe-process-filter-recipe"));
    expect(screen.getByText("1. Mash")).toBeTruthy();
    expect(screen.getByText("Hold at 67°C")).toBeTruthy();
    // The step-type chip renders the French label, not the raw enum.
    expect(screen.getByText("Empâtage")).toBeTruthy();

    fireEvent.press(screen.getByTestId("recipe-process-filter-compact"));
    expect(screen.getByText("Étapes recette : 1")).toBeTruthy();
    expect(screen.getByText("Ingrédients : 1")).toBeTruthy();
    expect(screen.getByText("Matériel : 1")).toBeTruthy();
    // Selection state follows the active mode.
    expect(
      screen.getByTestId("recipe-process-filter-compact").props
        .accessibilityState.selected,
    ).toBe(true);
  });

  it("shows the empty-state hint on the Brewing recipe view when the recipe has no steps", async () => {
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValue({
      ...baseViewModel,
      steps: [],
    });
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("brewing");
    fireEvent.press(screen.getByTestId("recipe-process-filter-recipe"));

    expect(
      screen.getByText("Pas d'étapes renseignées pour cette recette."),
    ).toBeTruthy();
  });

  it("renders a step without a description on the Brewing recipe view", async () => {
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValue({
      ...baseViewModel,
      steps: [
        {
          recipeId: "r1",
          stepOrder: 0,
          label: "Empâtage maison",
          type: "mash",
          description: null,
        },
      ],
    });
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("brewing");
    fireEvent.press(screen.getByTestId("recipe-process-filter-recipe"));

    expect(screen.getByText("1. Empâtage maison")).toBeTruthy();
    expect(screen.getByText("Empâtage")).toBeTruthy();
    // No description row for a step that has none.
    expect(screen.queryByText("Hold at 67°C")).toBeNull();
  });

  it("hides the sticky CTA on the Notes & Reviews tab", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    expect(screen.getByTestId("recipe-sticky-cta")).toBeTruthy();

    switchToTab("reviews");

    expect(screen.queryByTestId("recipe-sticky-cta")).toBeNull();
    expect(screen.getByTestId("recipe-reviews-tab")).toBeTruthy();
  });

  it("navigates back to My Recipes from the header action", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");

    fireEvent.press(screen.getByLabelText("Retour à mes recettes"));

    expect(mockReplace).toHaveBeenCalledWith("/recipes");
  });

  it("shows the not-found state when recipeId is missing", async () => {
    renderRecipeDetails("");

    expect(await screen.findByText("Recette introuvable")).toBeTruthy();
    expect(getRecipeDetailsViewModel as jest.Mock).not.toHaveBeenCalled();
  });

  it("shows the placeholder on the Notes & Reviews tab", async () => {
    renderRecipeDetails();

    await screen.findByTestId("recipe-overview-tab");
    switchToTab("reviews");

    expect(screen.getByTestId("recipe-reviews-tab")).toBeTruthy();
    expect(
      screen.getByText(
        /Les notes par axe \(goût, difficulté, coût, fidélité au style\)/i,
      ),
    ).toBeTruthy();
  });

  // Issue #740 v0.1 acceptance criteria: a recipe imported from the
  // scan flow must visibly carry its provenance. We assert the badge
  // appears when `importProvenance` is present on the recipe.
  it("renders the provenance badge for imported recipes on Overview", async () => {
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValueOnce({
      ...baseViewModel,
      recipe: {
        ...baseViewModel.recipe,
        importProvenance: "BrewDog DIY Dog",
      },
    });

    renderRecipeDetails();

    expect(await screen.findByTestId("recipe-provenance-badge")).toBeTruthy();
    expect(screen.getByText(/Importée • BrewDog DIY Dog/)).toBeTruthy();
  });
});
