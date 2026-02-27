import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { listIngredientsByCategory } from "@/features/ingredients/application/ingredients.use-cases";
import { listMalts } from "@/features/ingredients/application/malts.use-cases";
import { IngredientCategoryScreen } from "@/features/ingredients/presentation/IngredientCategoryScreen";
import React from "react";

const mockPush = jest.fn();

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

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
  listIngredientsByCategory: jest.fn(),
}));

jest.mock("@/features/ingredients/application/malts.use-cases", () => ({
  listMalts: jest.fn(),
}));

const mockedListIngredientsByCategory =
  listIngredientsByCategory as jest.MockedFunction<
    typeof listIngredientsByCategory
  >;
const mockedListMalts = listMalts as jest.MockedFunction<typeof listMalts>;

type RenderIngredientCategoryScreenOptions = {
  categoryParam?: string;
  searchParam?: string | string[];
  ebcMinParam?: string | string[];
  ebcMaxParam?: string | string[];
};

function renderIngredientCategoryScreen({
  categoryParam = "malt",
  searchParam,
  ebcMinParam,
  ebcMaxParam,
}: RenderIngredientCategoryScreenOptions = {}) {
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
      <IngredientCategoryScreen
        categoryParam={categoryParam}
        searchParam={searchParam}
        ebcMinParam={ebcMinParam}
        ebcMaxParam={ebcMaxParam}
      />
    </QueryClientProvider>,
  );
}

describe("IngredientCategoryScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedListIngredientsByCategory.mockReset();
    mockedListMalts.mockReset();
    mockedListMalts.mockResolvedValue([
      {
        id: "malt-1",
        slug: "pale-ale-malt",
        name: "Pale Ale Malt",
        brand: "Malterie du Château",
        originCountry: "France",
        maltType: "Base malt",
        specGroups: [
          {
            id: "analytical",
            title: "Analytical profile",
            rows: [{ id: "color", label: "Color", value: "6", unit: "EBC" }],
          },
        ],
      },
    ]);
  });

  it("renders themed category title and ingredient row", async () => {
    renderIngredientCategoryScreen({ categoryParam: "malt" });

    expect(await screen.findByText("La Malterie 🌾")).toBeTruthy();
    expect(screen.getByText("Recherche et filtres rapides")).toBeTruthy();
    expect(screen.getByText("Pale Ale Malt")).toBeTruthy();
    expect(screen.getByText("Type: Base malt • EBC: 6")).toBeTruthy();
    expect(mockedListMalts).toHaveBeenCalledWith({
      search: "",
      colorEbcMin: undefined,
      colorEbcMax: undefined,
    });
    expect(mockedListIngredientsByCategory).not.toHaveBeenCalled();
  });

  it("navigates to ingredient details from list item", async () => {
    renderIngredientCategoryScreen({ categoryParam: "malt" });

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Voir la fiche Pale Ale Malt"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/malts/[id]",
      params: {
        id: "malt-1",
        returnTo: "/(app)/ingredients/[category]",
        returnCategory: "malt",
        returnSearch: undefined,
        returnEbcMin: undefined,
        returnEbcMax: undefined,
      },
    });
  });

  it("keeps category details route for non-malt ingredients", async () => {
    mockedListMalts.mockResolvedValueOnce([]);
    mockedListIngredientsByCategory.mockResolvedValueOnce([
      {
        id: "hop-1",
        name: "Citra",
        category: "hop",
        origin: "USA",
        supplier: "Yakima Chief",
        alphaAcid: 12.5,
        betaAcid: 4,
        hopUse: "aroma",
        form: "pellet",
      },
    ]);

    renderIngredientCategoryScreen({ categoryParam: "hop" });

    expect(await screen.findByText("Citra")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Voir la fiche Citra"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: { category: "hop", id: "hop-1" },
    });
    expect(mockedListIngredientsByCategory).toHaveBeenCalledWith("hop", {
      search: "",
      alphaAcidMin: undefined,
    });
  });

  it("applies EBC filters through malt filters", async () => {
    renderIngredientCategoryScreen({ categoryParam: "malt" });

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.changeText(await screen.findByLabelText("EBC min"), "5");
    fireEvent.changeText(await screen.findByLabelText("EBC max"), "10");

    await waitFor(() => {
      expect(mockedListMalts).toHaveBeenLastCalledWith({
        search: "",
        colorEbcMin: 5,
        colorEbcMax: 10,
      });
    });
  });

  it("navigates with return filter context when opening a malt detail", async () => {
    renderIngredientCategoryScreen({
      categoryParam: "malt",
      searchParam: "wheat",
      ebcMinParam: "4",
      ebcMaxParam: "12",
    });

    expect(await screen.findByDisplayValue("wheat")).toBeTruthy();
    expect(screen.getByDisplayValue("4")).toBeTruthy();
    expect(screen.getByDisplayValue("12")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Voir la fiche Pale Ale Malt"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/malts/[id]",
      params: {
        id: "malt-1",
        returnTo: "/(app)/ingredients/[category]",
        returnCategory: "malt",
        returnSearch: "wheat",
        returnEbcMin: "4",
        returnEbcMax: "12",
      },
    });
  });
});
