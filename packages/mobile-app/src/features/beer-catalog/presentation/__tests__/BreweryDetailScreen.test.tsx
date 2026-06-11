import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { Linking } from "react-native";

import { useBrewery } from "@/features/beer-catalog/application/use-beer-catalog-details";
import { CatalogNotFoundError } from "@/features/beer-catalog/data/beer-catalog.errors";
import type { CatalogBrewery } from "@/features/beer-catalog/domain/beer-catalog.types";
import { BreweryDetailScreen } from "@/features/beer-catalog/presentation/BreweryDetailScreen";

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

const mockUseBrewery = jest.mocked(useBrewery);

type UseBreweryResult = ReturnType<typeof useBrewery>;

function makeQueryResult(
  overrides: Partial<UseBreweryResult> = {},
): UseBreweryResult {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    ...overrides,
  } as UseBreweryResult;
}

function makeBrewery(overrides: Partial<CatalogBrewery> = {}): CatalogBrewery {
  return {
    id: "brewery-1",
    slug: "brewdog",
    name: "BrewDog",
    breweryType: "micro",
    city: "Ellon",
    country: "Écosse",
    foundedYear: 2007,
    website: "https://www.brewdog.com",
    description: "Punk brewing since 2007.",
    ...overrides,
  };
}

describe("BreweryDetailScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the loaded fiche rows", () => {
    mockUseBrewery.mockReturnValue(makeQueryResult({ data: makeBrewery() }));

    render(<BreweryDetailScreen breweryId="brewery-1" />);

    expect(screen.getByText("BrewDog")).toBeTruthy();
    expect(screen.getByText("Type")).toBeTruthy();
    expect(screen.getByText("micro")).toBeTruthy();
    expect(screen.getByText("Localisation")).toBeTruthy();
    expect(screen.getByText("Ellon, Écosse")).toBeTruthy();
    expect(screen.getByText("Fondée en 2007")).toBeTruthy();
    expect(screen.getByText("Site web")).toBeTruthy();
    expect(screen.getByText("https://www.brewdog.com")).toBeTruthy();
    expect(screen.getByText("Description")).toBeTruthy();
    expect(screen.getByText("Punk brewing since 2007.")).toBeTruthy();
  });

  it("skips null fields instead of rendering empty rows", () => {
    mockUseBrewery.mockReturnValue(
      makeQueryResult({
        data: makeBrewery({
          breweryType: null,
          city: null,
          country: null,
          foundedYear: null,
          website: null,
          description: null,
        }),
      }),
    );

    render(<BreweryDetailScreen breweryId="brewery-1" />);

    expect(screen.getByText("BrewDog")).toBeTruthy();
    expect(screen.queryByText("Type")).toBeNull();
    expect(screen.queryByText("Localisation")).toBeNull();
    expect(screen.queryByText("Fondée en 2007")).toBeNull();
    expect(screen.queryByText("Site web")).toBeNull();
    expect(screen.queryByText("Description")).toBeNull();
  });

  it("opens the brewery website when tapping the website row", () => {
    const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    mockUseBrewery.mockReturnValue(makeQueryResult({ data: makeBrewery() }));

    render(<BreweryDetailScreen breweryId="brewery-1" />);

    fireEvent.press(screen.getByRole("link"));
    expect(openURLSpy).toHaveBeenCalledWith("https://www.brewdog.com");
  });

  it("shows the not-found copy on CatalogNotFoundError", () => {
    mockUseBrewery.mockReturnValue(
      makeQueryResult({
        isError: true,
        error: new CatalogNotFoundError(),
      }),
    );

    render(<BreweryDetailScreen breweryId="missing" />);

    expect(screen.getByText("Brasserie introuvable.")).toBeTruthy();
    expect(screen.queryByText("Impossible de charger cette fiche.")).toBeNull();
  });

  it("shows the error card with a working retry on a generic error", () => {
    const refetch = jest.fn();
    mockUseBrewery.mockReturnValue(
      makeQueryResult({
        isError: true,
        error: new Error(""),
        refetch,
      }),
    );

    render(<BreweryDetailScreen breweryId="brewery-1" />);

    expect(screen.getByText("Impossible de charger cette fiche.")).toBeTruthy();

    fireEvent.press(screen.getByText("Réessayer"));
    expect(refetch).toHaveBeenCalled();
  });
});
