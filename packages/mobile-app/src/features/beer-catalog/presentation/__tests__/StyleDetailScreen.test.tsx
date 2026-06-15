import { render, screen } from "@testing-library/react-native";

import React from "react";

import { useStyle } from "@/features/beer-catalog/application/use-beer-catalog-details";
import { CatalogNotFoundError } from "@/features/beer-catalog/application/beer-catalog.use-cases";
import type { CatalogStyle } from "@/features/beer-catalog/domain/beer-catalog.types";
import { StyleDetailScreen } from "@/features/beer-catalog/presentation/StyleDetailScreen";

const mockBack = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: mockBack,
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/",
}));

jest.mock(
  "@/features/beer-catalog/application/use-beer-catalog-details",
  () => ({
    useBeer: jest.fn(),
    useBrewery: jest.fn(),
    useStyle: jest.fn(),
  }),
);

const mockUseStyle = jest.mocked(useStyle);

type UseStyleResult = ReturnType<typeof useStyle>;

function makeQueryResult(
  overrides: Partial<UseStyleResult> = {},
): UseStyleResult {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    ...overrides,
  } as UseStyleResult;
}

function makeStyle(overrides: Partial<CatalogStyle> = {}): CatalogStyle {
  return {
    id: "style-1",
    slug: "american-ipa",
    name: "American IPA",
    category: "IPA",
    family: "21A",
    abvMin: 5.5,
    abvMax: 7.5,
    ibuMin: 40,
    ibuMax: 70,
    srmMin: 6,
    srmMax: 14,
    ...overrides,
  };
}

describe("StyleDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loaded fiche rows with formatted ranges", () => {
    mockUseStyle.mockReturnValue(makeQueryResult({ data: makeStyle() }));

    render(<StyleDetailScreen styleId="style-1" />);

    expect(screen.getByText("American IPA")).toBeTruthy();
    expect(screen.getByText("Catégorie")).toBeTruthy();
    expect(screen.getByText("IPA")).toBeTruthy();
    expect(screen.getByText("Famille BJCP")).toBeTruthy();
    expect(screen.getByText("21A")).toBeTruthy();
    expect(screen.getByText("Plage d'alcool")).toBeTruthy();
    expect(screen.getByText("5,5–7,5 %")).toBeTruthy();
    expect(screen.getByText("Plage d'amertume (IBU)")).toBeTruthy();
    expect(screen.getByText("40–70")).toBeTruthy();
    expect(screen.getByText("Plage de couleur")).toBeTruthy();
    expect(screen.getByText("EBC 12–28")).toBeTruthy();
  });

  it("skips null ranges instead of rendering empty rows", () => {
    mockUseStyle.mockReturnValue(
      makeQueryResult({
        data: makeStyle({
          category: null,
          family: null,
          abvMin: null,
          abvMax: null,
          ibuMin: null,
          ibuMax: null,
          srmMin: null,
          srmMax: null,
        }),
      }),
    );

    render(<StyleDetailScreen styleId="style-1" />);

    expect(screen.getByText("American IPA")).toBeTruthy();
    expect(screen.queryByText("Catégorie")).toBeNull();
    expect(screen.queryByText("Famille BJCP")).toBeNull();
    expect(screen.queryByText("Plage d'alcool")).toBeNull();
    expect(screen.queryByText("Plage d'amertume (IBU)")).toBeNull();
    expect(screen.queryByText("Plage de couleur")).toBeNull();
  });

  it("shows the not-found copy on CatalogNotFoundError", () => {
    mockUseStyle.mockReturnValue(
      makeQueryResult({
        isError: true,
        error: new CatalogNotFoundError(),
      }),
    );

    render(<StyleDetailScreen styleId="missing" />);

    expect(screen.getByText("Style introuvable.")).toBeTruthy();
    expect(screen.queryByText("Impossible de charger cette fiche.")).toBeNull();
  });
});
