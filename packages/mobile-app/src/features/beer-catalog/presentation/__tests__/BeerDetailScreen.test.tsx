import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";

import { useBeer } from "@/features/beer-catalog/application/use-beer-catalog-details";
import { CatalogNotFoundError } from "@/features/beer-catalog/application/beer-catalog.use-cases";
import type { CatalogBeerDetail } from "@/features/beer-catalog/domain/beer-catalog.types";
import { BeerDetailScreen } from "@/features/beer-catalog/presentation/BeerDetailScreen";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
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

const mockUseBeer = jest.mocked(useBeer);

type UseBeerResult = ReturnType<typeof useBeer>;

function makeQueryResult(
  overrides: Partial<UseBeerResult> = {},
): UseBeerResult {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    isPlaceholderData: false,
    refetch: jest.fn(),
    ...overrides,
  } as UseBeerResult;
}

function makeBeerDetail(
  overrides: Partial<CatalogBeerDetail> = {},
): CatalogBeerDetail {
  return {
    id: "beer-1",
    slug: "punk-ipa",
    name: "Punk IPA",
    breweryId: "brewery-1",
    styleId: "style-1",
    breweryName: "BrewDog",
    styleName: "American IPA",
    abv: 5.6,
    ibuMin: 35,
    ibuMax: 40,
    srmMin: 8,
    srmMax: 12,
    description: "A post-modern classic.",
    eanCode: "5056025400000",
    legalDenomination: "Bière blonde",
    countryOfOrigin: "Écosse",
    allergens: ["gluten", "orge"],
    alcoholGroup: 3,
    isVerified: true,
    source: "openfoodfacts",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("BeerDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the full fiche with hero, stats, legal block and provenance", () => {
    mockUseBeer.mockReturnValue(makeQueryResult({ data: makeBeerDetail() }));

    render(<BeerDetailScreen beerId="beer-1" />);

    expect(screen.getByText("Punk IPA")).toBeTruthy();
    expect(screen.getByText("BrewDog · American IPA")).toBeTruthy();
    expect(screen.getByText("Brasserie")).toBeTruthy();
    expect(screen.getByText("BrewDog")).toBeTruthy();
    expect(screen.getByText("5,6 %")).toBeTruthy();
    expect(screen.getByText("35–40")).toBeTruthy();
    expect(screen.getByText("EBC 16–24")).toBeTruthy();
    expect(screen.getByText("VÉRIFIÉE")).toBeTruthy();
    expect(screen.getByText("Mentions légales")).toBeTruthy();
    expect(screen.getByText("Bière blonde")).toBeTruthy();
    expect(screen.getByText("gluten, orge")).toBeTruthy();
    expect(screen.getByText("Provenance")).toBeTruthy();
    expect(screen.getByText("Open Food Facts")).toBeTruthy();
  });

  it("navigates to the brewery and style fiches when tapping their rows", () => {
    mockUseBeer.mockReturnValue(makeQueryResult({ data: makeBeerDetail() }));

    render(<BeerDetailScreen beerId="beer-1" />);

    fireEvent.press(screen.getByText("BrewDog"));
    expect(mockPush).toHaveBeenCalledWith(
      "/(app)/beer-catalog/brewery/brewery-1",
    );

    fireEvent.press(screen.getByText("American IPA"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/beer-catalog/style/style-1");
  });

  it("renders a plain, non-pressable fallback when the brewery is unresolved", () => {
    mockUseBeer.mockReturnValue(
      makeQueryResult({
        data: makeBeerDetail({ breweryId: null, breweryName: null }),
      }),
    );

    render(<BeerDetailScreen beerId="beer-1" />);

    const fallback = screen.getByText("Brasserie inconnue");
    expect(fallback).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Brasserie inconnue" }),
    ).toBeNull();

    fireEvent.press(fallback);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("holds the detail-only sections while showing placeholder list data", () => {
    mockUseBeer.mockReturnValue(
      makeQueryResult({
        data: makeBeerDetail(),
        isPlaceholderData: true,
        isFetching: true,
      }),
    );

    render(<BeerDetailScreen beerId="beer-1" />);

    expect(screen.getByText("Punk IPA")).toBeTruthy();
    expect(screen.queryByText("Mentions légales")).toBeNull();
    expect(screen.queryByText("Provenance")).toBeNull();
    expect(screen.queryByText("VÉRIFIÉE")).toBeNull();
  });

  it("shows the not-found copy on CatalogNotFoundError instead of the error card", () => {
    mockUseBeer.mockReturnValue(
      makeQueryResult({
        isError: true,
        error: new CatalogNotFoundError(),
      }),
    );

    render(<BeerDetailScreen beerId="missing" />);

    expect(screen.getByText("Bière introuvable.")).toBeTruthy();
    expect(screen.queryByText("Impossible de charger cette fiche.")).toBeNull();
    expect(screen.queryByText("Réessayer")).toBeNull();
  });

  it("shows the error card with a working retry on a generic error", () => {
    const refetch = jest.fn();
    mockUseBeer.mockReturnValue(
      makeQueryResult({
        isError: true,
        error: new Error(""),
        refetch,
      }),
    );

    render(<BeerDetailScreen beerId="beer-1" />);

    expect(screen.getByText("Impossible de charger cette fiche.")).toBeTruthy();

    fireEvent.press(screen.getByText("Réessayer"));
    expect(refetch).toHaveBeenCalled();
  });
});
