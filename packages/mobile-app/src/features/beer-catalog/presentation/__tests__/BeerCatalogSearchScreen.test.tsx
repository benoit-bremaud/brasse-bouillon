import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { useBeerCatalogPagination } from "@/features/beer-catalog/application/use-beer-catalog-pagination";
import { SEARCH_DEBOUNCE_MS } from "@/features/beer-catalog/application/use-debounced-value";
import type { CatalogBeer } from "@/features/beer-catalog/domain/beer-catalog.types";
import { BeerCatalogSearchScreen } from "@/features/beer-catalog/presentation/BeerCatalogSearchScreen";
import {
  SEARCH_EMPTY_TITLE,
  SEARCH_PROMPT_TITLE,
} from "@/features/beer-catalog/presentation/beer-catalog.constants";

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

function typeAndSettle(text: string) {
  fireEvent.changeText(screen.getByTestId("beer-search-input"), text);
  act(() => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });
}

describe("BeerCatalogSearchScreen (UC2)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPush.mockReset();
    mockFetchNextPage.mockReset();
    mockRefetch.mockReset();
    mockedUseBeerCatalogPagination.mockReset();
    mockedUseBeerCatalogPagination.mockReturnValue(buildPaginationResult({}));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // happy: with an empty term the prompt invites the user to type and
  // no list is rendered; the hook receives the (disabled) empty query.
  it("happy: shows the prompt and no list while the term is empty", () => {
    render(<BeerCatalogSearchScreen />);

    expect(screen.getByText(SEARCH_PROMPT_TITLE)).toBeTruthy();
    expect(screen.queryByTestId("beer-catalog-search-list")).toBeNull();
    expect(mockedUseBeerCatalogPagination).toHaveBeenCalledWith({
      mode: "search",
      query: "",
    });
  });

  // happy: the query only reaches the hook once the debounce settles —
  // an intermediate keystroke is never propagated.
  it("happy: debounces the term before it reaches the hook", () => {
    render(<BeerCatalogSearchScreen />);

    const input = screen.getByTestId("beer-search-input");

    fireEvent.changeText(input, "chou");
    act(() => {
      jest.advanceTimersByTime(100);
    });
    fireEvent.changeText(input, "chouffe");

    // The rearmed timer has not elapsed yet: still the initial query.
    expect(mockedUseBeerCatalogPagination).not.toHaveBeenCalledWith({
      mode: "search",
      query: "chou",
    });
    expect(mockedUseBeerCatalogPagination).toHaveBeenLastCalledWith({
      mode: "search",
      query: "",
    });

    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(mockedUseBeerCatalogPagination).toHaveBeenLastCalledWith({
      mode: "search",
      query: "chouffe",
    });
    expect(mockedUseBeerCatalogPagination).not.toHaveBeenCalledWith({
      mode: "search",
      query: "chou",
    });
  });

  // sad: a settled term with zero results shows the term-specific
  // empty state.
  it("sad: shows the no-result empty state for a settled term", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({ beers: [] }),
    );

    render(<BeerCatalogSearchScreen />);
    typeAndSettle("stout");

    expect(screen.getByText(SEARCH_EMPTY_TITLE("stout"))).toBeTruthy();
    expect(screen.queryByTestId("beer-catalog-search-list")).toBeNull();
  });

  // happy: results render as rows and a tap navigates to the beer fiche.
  it("happy: renders the results and navigates to the beer fiche on tap", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({ beers: [buildCatalogBeer()] }),
    );

    render(<BeerCatalogSearchScreen />);
    typeAndSettle("chouffe");

    expect(screen.getByText("La Chouffe")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir la bière La Chouffe"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/beer-catalog/beer/b-1");
  });

  // edge: clearing the field resets the screen to the prompt once the
  // debounce settles (results disappear with the list).
  it("edge: resets to the prompt when the term is cleared", () => {
    mockedUseBeerCatalogPagination.mockReturnValue(
      buildPaginationResult({ beers: [buildCatalogBeer()] }),
    );

    render(<BeerCatalogSearchScreen />);
    typeAndSettle("chouffe");

    expect(screen.getByText("La Chouffe")).toBeTruthy();

    fireEvent.press(screen.getByTestId("beer-search-clear"));
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(screen.getByText(SEARCH_PROMPT_TITLE)).toBeTruthy();
    expect(screen.queryByText("La Chouffe")).toBeNull();
    expect(screen.queryByTestId("beer-catalog-search-list")).toBeNull();
  });
});
