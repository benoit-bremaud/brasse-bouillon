import { getIngredientDetails } from "@/features/ingredients/application/ingredients.use-cases";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { MiscDetailsScreen } from "@/features/ingredients/presentation/MiscDetailsScreen";
import type { Ingredient } from "@/features/ingredients/domain/ingredient.types";
import React from "react";

const mockPush = jest.fn();

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

jest.mock("@/features/ingredients/application/ingredients.use-cases", () => ({
  getIngredientDetails: jest.fn(),
}));

const mockedGetIngredientDetails = getIngredientDetails as jest.MockedFunction<
  typeof getIngredientDetails
>;

type RenderMiscDetailsScreenOptions = {
  miscIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
  returnCategoryParam?: string | string[];
  returnSearchParam?: string | string[];
};

function buildMiscIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id: "misc-whirlfloc-uuid",
    name: "Whirlfloc",
    category: "misc",
    miscType: "fining",
    useAt: "boil",
    useFor: "Clarté",
    timeMin: 15,
    notes: "Clarifiant utilisé en fin d'ébullition.",
    ...overrides,
  } as Ingredient;
}

function renderMiscDetailsScreen({
  miscIdParam = "misc-whirlfloc-uuid",
  returnToParam,
  returnRecipeIdParam,
  returnCategoryParam,
  returnSearchParam,
}: RenderMiscDetailsScreenOptions = {}) {
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
      <MiscDetailsScreen
        miscIdParam={miscIdParam}
        returnToParam={returnToParam}
        returnRecipeIdParam={returnRecipeIdParam}
        returnCategoryParam={returnCategoryParam}
        returnSearchParam={returnSearchParam}
      />
    </QueryClientProvider>,
  );
}

describe("MiscDetailsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedGetIngredientDetails.mockReset();
  });

  it("shows the loading state before the misc data resolves", () => {
    // A deferred query that never resolves on its own — enough to observe
    // the in-flight state without racing the assertion against resolution.
    mockedGetIngredientDetails.mockReturnValue(new Promise(() => {}));

    renderMiscDetailsScreen({ miscIdParam: "misc-whirlfloc-uuid" });

    expect(screen.getByTestId("beer-mug-loader")).toBeTruthy();
  });

  it("renders the misc fiche fields", async () => {
    mockedGetIngredientDetails.mockResolvedValue(buildMiscIngredient());

    renderMiscDetailsScreen({ miscIdParam: "misc-whirlfloc-uuid" });

    expect(await screen.findByText("Whirlfloc")).toBeTruthy();
    expect(screen.getByText("Accessoire de brassage")).toBeTruthy();
    expect(screen.getByText("Type")).toBeTruthy();
    // getMiscTypeLabel("fining") → "Clarifiant" (real translation module,
    // not mocked — it is the app's own domain, not a boundary).
    expect(screen.getByText("Clarifiant")).toBeTruthy();
    expect(screen.getByText("Ajout")).toBeTruthy();
    // getMiscUseLabel("boil") → "Ébullition".
    expect(screen.getByText("Ébullition")).toBeTruthy();
    expect(screen.getByText("Rôle")).toBeTruthy();
    expect(screen.getByText("Clarté")).toBeTruthy();
    expect(screen.getByText("Durée")).toBeTruthy();
    expect(screen.getByText("15 min")).toBeTruthy();
    expect(screen.getByText("À quoi ça sert")).toBeTruthy();
    expect(
      screen.getByText("Clarifiant utilisé en fin d'ébullition."),
    ).toBeTruthy();
  });

  it("shows the not-found state when the misc id does not resolve", async () => {
    mockedGetIngredientDetails.mockResolvedValueOnce(null);

    renderMiscDetailsScreen({ miscIdParam: "misc-missing" });

    expect(await screen.findByText("Accessoire introuvable")).toBeTruthy();
    expect(
      screen.getByText(
        "Cet accessoire n'existe pas ou n'est plus au catalogue.",
      ),
    ).toBeTruthy();
  });

  it("shows an error card when the query fails", async () => {
    // getErrorMessage surfaces the error's own message (falling back to the
    // generic copy only when the error has none) — same contract asserted
    // on the sibling EquipmentScreen sad-path test.
    mockedGetIngredientDetails.mockRejectedValue(
      new Error("Catalogue injoignable"),
    );

    renderMiscDetailsScreen({ miscIdParam: "misc-whirlfloc-uuid" });

    expect(await screen.findByText("Catalogue injoignable")).toBeTruthy();
  });

  // Regression guard for the bug fixed alongside this test: a hand-rolled
  // whitelist in `normalizeIngredientCategory` (malt/hop/yeast only) used to
  // silently drop "misc", so `buildIngredientCategoryBackNavigationParams`
  // returned null and "Retour" fell through to pushing the raw, unresolved
  // `returnTo` template string ("/(app)/ingredients/[category]") instead of
  // a route with params. `normalizeIngredientCategory` now delegates to the
  // shared `isIngredientCategory` guard, so misc is recognized again.
  it("navigates back to the filtered Accessoires list, preserving the misc category", async () => {
    mockedGetIngredientDetails.mockResolvedValue(buildMiscIngredient());

    renderMiscDetailsScreen({
      miscIdParam: "misc-whirlfloc-uuid",
      returnToParam: "/(app)/ingredients/[category]",
      returnCategoryParam: "misc",
      returnSearchParam: "whirlfloc",
    });

    expect(await screen.findByText("Whirlfloc")).toBeTruthy();

    fireEvent.press(screen.getByText("Retour"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: {
        category: "misc",
        search: "whirlfloc",
      },
    });
  });

  // Edge — no return context at all still resolves to a real route, not a
  // dangling template.
  it("falls back to the shop when no return context is provided", async () => {
    mockedGetIngredientDetails.mockResolvedValue(buildMiscIngredient());

    renderMiscDetailsScreen({ miscIdParam: "misc-whirlfloc-uuid" });

    expect(await screen.findByText("Whirlfloc")).toBeTruthy();

    fireEvent.press(screen.getByText("Retour"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/shop");
  });
});
