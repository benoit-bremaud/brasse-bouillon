import { FlatList } from "react-native";

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import type { FlatListProps } from "react-native";

import type { BeerListItemVM } from "@/features/beer-catalog/application/beer-catalog.view-model";
import { useBeerCatalogPagination } from "@/features/beer-catalog/application/use-beer-catalog-pagination";
import type { CatalogBeer } from "@/features/beer-catalog/domain/beer-catalog.types";
import { BeerCatalogBrowseScreen } from "@/features/beer-catalog/presentation/BeerCatalogBrowseScreen";
import { BROWSE_EMPTY_TITLE } from "@/features/beer-catalog/presentation/beer-catalog.constants";

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
      replace: jest.fn(),
      back: jest.fn(),
    }),
    usePathname: () => "/",
  };
});

jest.mock(
  "@/features/beer-catalog/application/use-beer-catalog-pagination",
  () => {
    const actual = jest.requireActual(
      "@/features/beer-catalog/application/use-beer-catalog-pagination",
    );
    return {
      ...actual,
      useBeerCatalogPagination: jest.fn(),
    };
  },
);

const mockedUseBeerCatalogPagination =
  useBeerCatalogPagination as jest.MockedFunction<
    typeof useBeerCatalogPagination
  >;

type PaginationResult = ReturnType<typeof useBeerCatalogPagination>;

interface PaginationOverrides {
  beers?: CatalogBeer[];
  total?: number;
  isLoading?: boolean;
  isFetching?: boolean;
  isFetched?: boolean;
  isFetchingNextPage?: boolean;
  isFetchNextPageError?: boolean;
  hasNextPage?: boolean;
  error?: Error | null;
}

const mockFetchNextPage = jest.fn();
const mockRefetch = jest.fn();

function buildPaginationResult(
  overrides: PaginationOverrides = {},
): PaginationResult {
  const {
    beers = [],
    total = beers.length,
    isLoading = false,
    isFetching = false,
    isFetched = true,
    isFetchingNextPage = false,
    isFetchNextPageError = false,
    hasNextPage = false,
    error = null,
  } = overrides;

  return {
    data: isLoading ? undefined : { beers, total },
    isLoading,
    isFetching,
    isFetched,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    fetchNextPage: mockFetchNextPage,
    error,
    refetch: mockRefetch,
  } as unknown as PaginationResult;
}

function buildCatalogBeer(overrides: Partial<CatalogBeer> = {}): CatalogBeer {
  return {
    id: "b-1",
    slug: "la-chouffe",
    name: "La Chouffe",
    breweryId: null,
    styleId: null,
    breweryName: "Brasserie d'Achouffe",
    styleName: "Belgian Strong Golden Ale",
    abv: 8,
    ibuMin: 20,
    ibuMax: 25,
    srmMin: 6,
    srmMax: 8,
    description: null,
    ...overrides,
  };
}

function getBrowseListProps(): FlatListProps<BeerListItemVM> {
  return screen.UNSAFE_getByType(FlatList)
    .props as FlatListProps<BeerListItemVM>;
}

describe("BeerCatalogBrowseScreen (UC1)", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockFetchNextPage.mockReset();
    mockRefetch.mockReset();
    mockedUseBeerCatalogPagination.mockReset();
  });

  // happy: initial load shows the full-screen loader and no rows yet.
  it("happy: shows the loader and no rows during the initial load", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({
        isLoading: true,
        isFetching: true,
        isFetched: false,
      }),
    );

    render(<BeerCatalogBrowseScreen />);

    expect(screen.getByTestId("beer-mug-loader")).toBeTruthy();
    expect(screen.queryByText("La Chouffe")).toBeNull();
  });

  // happy: loaded list renders the rows and a tap navigates to the fiche.
  it("happy: renders the rows and navigates to the beer fiche on tap", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({
        beers: [
          buildCatalogBeer(),
          buildCatalogBeer({
            id: "b-2",
            slug: "rochefort-10",
            name: "Rochefort 10",
          }),
        ],
      }),
    );

    render(<BeerCatalogBrowseScreen />);

    expect(screen.getByText("La Chouffe")).toBeTruthy();
    expect(screen.getByText("Rochefort 10")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir la bière La Chouffe"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/beer-catalog/beer/b-1");
  });

  // sad: an empty settled catalogue shows the empty-state card.
  it("sad: shows the empty-state card when the catalogue is empty", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(buildPaginationResult({}));

    render(<BeerCatalogBrowseScreen />);

    expect(screen.getByText(BROWSE_EMPTY_TITLE)).toBeTruthy();
  });

  // sad: a settled initial error shows the full-screen error card and
  // its retry triggers a refetch.
  it("sad: shows the full-screen error and retries via refetch", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({ error: new Error("Boom") }),
    );

    render(<BeerCatalogBrowseScreen />);

    expect(screen.getByText("Boom")).toBeTruthy();
    expect(screen.queryByTestId("catalog-footer-error")).toBeNull();

    fireEvent.press(screen.getByText("Réessayer"));

    expect(mockRefetch).toHaveBeenCalled();
  });

  // happy: fetching the next page shows the footer spinner under the rows.
  it("happy: shows the footer spinner while fetching the next page", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({
        beers: [buildCatalogBeer()],
        isFetching: true,
        isFetchingNextPage: true,
        hasNextPage: true,
      }),
    );

    render(<BeerCatalogBrowseScreen />);

    expect(screen.getByTestId("catalog-footer-loading")).toBeTruthy();
    expect(screen.getByText("La Chouffe")).toBeTruthy();
  });

  // sad: a next-page error keeps the list visible (NO full-screen error,
  // conception 05/07 Error vs NextPageError) and the inline footer retry
  // calls fetchNextPage.
  it("sad: keeps the list on a next-page error and retries inline", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({
        beers: [buildCatalogBeer()],
        error: new Error("next page failed"),
        isFetchNextPageError: true,
        hasNextPage: true,
      }),
    );

    render(<BeerCatalogBrowseScreen />);

    expect(screen.getByTestId("catalog-footer-error")).toBeTruthy();
    expect(screen.getByText("La Chouffe")).toBeTruthy();
    // The full-screen error card (which would echo the error message)
    // must NOT be shown for a next-page failure.
    expect(screen.queryByText("next page failed")).toBeNull();

    fireEvent.press(screen.getByText("Réessayer"));

    expect(mockFetchNextPage).toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  // edge: onEndReached is guarded — no fetch without a next page or while
  // one is already in flight; it fires once the guard opens.
  it("edge: guards onEndReached on hasNextPage and isFetchingNextPage", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({
        beers: [buildCatalogBeer()],
        hasNextPage: false,
      }),
    );

    render(<BeerCatalogBrowseScreen />);

    getBrowseListProps().onEndReached?.({ distanceFromEnd: 0 });
    expect(mockFetchNextPage).not.toHaveBeenCalled();

    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({
        beers: [buildCatalogBeer()],
        isFetching: true,
        isFetchingNextPage: true,
        hasNextPage: true,
      }),
    );
    screen.rerender(<BeerCatalogBrowseScreen />);

    getBrowseListProps().onEndReached?.({ distanceFromEnd: 0 });
    expect(mockFetchNextPage).not.toHaveBeenCalled();

    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({
        beers: [buildCatalogBeer()],
        hasNextPage: true,
      }),
    );
    screen.rerender(<BeerCatalogBrowseScreen />);

    getBrowseListProps().onEndReached?.({ distanceFromEnd: 0 });
    expect(mockFetchNextPage).toHaveBeenCalledTimes(1);
  });
});
