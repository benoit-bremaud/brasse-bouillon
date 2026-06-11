/**
 * Catalogue data-layer tests: HTTP wiring (paths, auth:false, encyclopedia
 * baseUrl, AbortSignal pass-through), the not-configured fail-fast guard,
 * and the funnel of every transport failure through `rethrowCatalogError`.
 * Mocking style mirrors `scan/data/__tests__/beers-import.api.test.ts`.
 */
import { env } from "@/core/config/env";
import { HttpError } from "@/core/http/http-error";

import {
  CATALOG_PER_PAGE,
  fetchBeerById,
  fetchBeersPage,
  fetchBreweryById,
  fetchStyleById,
  searchBeersPage,
} from "@/features/beer-catalog/data/beer-catalog.api";
import {
  CatalogNotFoundError,
  CatalogUnavailableError,
} from "@/features/beer-catalog/data/beer-catalog.errors";
import type {
  BeerReadDto,
  BreweryReadDto,
  PageDto,
  StyleReadDto,
} from "@/features/beer-catalog/data/beer-catalog.mapper";

const mockRequest = jest.fn();

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

jest.mock("@/core/config/env", () => ({
  env: {
    apiUrl: "http://localhost:3000",
    encyclopediaUrl: "http://test-enc.local:8000",
    encyclopediaUrlIsConfigured: true,
    useDemoData: false,
  },
}));

const mockedEnv = env as unknown as {
  apiUrl: string;
  encyclopediaUrl: string;
  encyclopediaUrlIsConfigured: boolean;
  useDemoData: boolean;
};

function buildBeerDto(overrides: Partial<BeerReadDto> = {}): BeerReadDto {
  return {
    id: "beer-1",
    name: "Pelforth Brune",
    slug: "pelforth-brune",
    brewery_id: "brewery-1",
    style_id: "style-1",
    brewery_name: "Pelforth",
    style_name: "Brune",
    abv: "6.5",
    ibu_min: 20,
    ibu_max: 28,
    srm_min: 30,
    srm_max: 30,
    description: "Brune intense",
    is_active: true,
    is_verified: true,
    source: "openfoodfacts",
    ean_code: "3760231860119",
    legal_denomination: "biere",
    country_of_origin: "FR",
    allergens: ["gluten"],
    alcohol_group: 3,
    created_at: "2026-05-02T10:00:00.000Z",
    updated_at: "2026-05-02T10:00:00.000Z",
    ...overrides,
  };
}

function buildBreweryDto(
  overrides: Partial<BreweryReadDto> = {},
): BreweryReadDto {
  return {
    id: "brewery-1",
    name: "Pelforth",
    slug: "pelforth",
    brewery_type: "industrial",
    city: "Mons-en-Barœul",
    country: "FR",
    founded_year: 1914,
    website_url: "https://pelforth.example",
    description: "Brasserie du Nord",
    ...overrides,
  };
}

function buildStyleDto(overrides: Partial<StyleReadDto> = {}): StyleReadDto {
  return {
    id: "style-1",
    name: "Brune",
    slug: "brune",
    category: "Dark European Lager",
    family: "lager",
    abv_min: "4.5",
    abv_max: "6.0",
    ibu_min: 20,
    ibu_max: 30,
    srm_min: 17,
    srm_max: 30,
    ...overrides,
  };
}

function buildPageDto(items: BeerReadDto[]): PageDto<BeerReadDto> {
  return { items, meta: { total: items.length, page: 1, per_page: 20 } };
}

function buildAbortError(): Error {
  const error = new Error("Aborted");
  error.name = "AbortError";
  return error;
}

describe("beer-catalog.api", () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockedEnv.encyclopediaUrlIsConfigured = true;
    mockedEnv.encyclopediaUrl = "http://test-enc.local:8000";
  });

  describe("happy: HTTP wiring + mapping", () => {
    it("fetchBeersPage GETs /beers with 1-based page and per_page=20, no auth, encyclopedia baseUrl, forwarded signal", async () => {
      mockRequest.mockResolvedValueOnce(buildPageDto([buildBeerDto()]));
      const controller = new AbortController();

      const page = await fetchBeersPage(2, controller.signal);

      expect(mockRequest).toHaveBeenCalledTimes(1);
      const [path, options] = mockRequest.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(path).toBe(`/beers?page=2&per_page=${CATALOG_PER_PAGE}`);
      expect(options).toEqual({
        auth: false,
        baseUrl: "http://test-enc.local:8000",
        signal: controller.signal,
      });
      // Mapped result, not the raw DTO.
      expect(page.items[0].abv).toBe(6.5);
      expect(page.meta.perPage).toBe(20);
    });

    it("searchBeersPage GETs /beers/search with the query URL-encoded", async () => {
      mockRequest.mockResolvedValueOnce(buildPageDto([]));

      await searchBeersPage("kölsch & co", 1);

      const [path] = mockRequest.mock.calls[0] as [string];
      expect(path).toBe(
        `/beers/search?q=k%C3%B6lsch%20%26%20co&page=1&per_page=${CATALOG_PER_PAGE}`,
      );
    });

    it("fetchBeerById GETs /beers/{id} and returns the mapped detail", async () => {
      mockRequest.mockResolvedValueOnce(buildBeerDto());
      const controller = new AbortController();

      const detail = await fetchBeerById("beer-1", controller.signal);

      const [path, options] = mockRequest.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(path).toBe("/beers/beer-1");
      expect(options).toEqual({
        auth: false,
        baseUrl: "http://test-enc.local:8000",
        signal: controller.signal,
      });
      expect(detail.eanCode).toBe("3760231860119");
      expect(detail.isVerified).toBe(true);
    });

    it("fetchBreweryById GETs /breweries/{id} and renames website_url → website", async () => {
      mockRequest.mockResolvedValueOnce(buildBreweryDto());

      const brewery = await fetchBreweryById("brewery-1");

      const [path] = mockRequest.mock.calls[0] as [string];
      expect(path).toBe("/breweries/brewery-1");
      expect(brewery.website).toBe("https://pelforth.example");
    });

    it("fetchStyleById GETs /styles/{id} and parses the abv Decimal strings", async () => {
      mockRequest.mockResolvedValueOnce(buildStyleDto());

      const style = await fetchStyleById("style-1");

      const [path] = mockRequest.mock.calls[0] as [string];
      expect(path).toBe("/styles/style-1");
      expect(style.abvMin).toBe(4.5);
      expect(style.abvMax).toBe(6);
    });

    it("URL-encodes ids interpolated into detail paths", async () => {
      mockRequest.mockResolvedValueOnce(buildBeerDto());

      await fetchBeerById("a/b c");

      const [path] = mockRequest.mock.calls[0] as [string];
      expect(path).toBe("/beers/a%2Fb%20c");
    });
  });

  describe("sad: transport failures funneled to named catalogue errors", () => {
    it("HttpError 404 → CatalogNotFoundError carrying the message", async () => {
      mockRequest.mockRejectedValueOnce(new HttpError(404, "Beer not found"));

      const rejected = await fetchBeerById("missing").catch((e: unknown) => e);

      expect(rejected).toBeInstanceOf(CatalogNotFoundError);
      expect((rejected as CatalogNotFoundError).message).toBe("Beer not found");
    });

    it("HttpError 503 → CatalogUnavailableError", async () => {
      mockRequest.mockRejectedValueOnce(
        new HttpError(503, "Service unavailable"),
      );

      await expect(fetchBeersPage(1)).rejects.toBeInstanceOf(
        CatalogUnavailableError,
      );
    });

    it("plain network TypeError → CatalogUnavailableError", async () => {
      mockRequest.mockRejectedValueOnce(
        new TypeError("Network request failed"),
      );

      const rejected = await searchBeersPage("ipa", 1).catch((e: unknown) => e);

      expect(rejected).toBeInstanceOf(CatalogUnavailableError);
      expect((rejected as CatalogUnavailableError).message).toBe(
        "Network request failed",
      );
    });
  });

  describe("edge: not-configured guard and abort pass-through", () => {
    it("rejects with CatalogUnavailableError (not-configured message) without hitting the network when the encyclopedia URL is missing", async () => {
      mockedEnv.encyclopediaUrlIsConfigured = false;

      const rejected = await fetchBeersPage(1).catch((e: unknown) => e);

      expect(rejected).toBeInstanceOf(CatalogUnavailableError);
      expect((rejected as CatalogUnavailableError).message).toMatch(
        /not configured.*EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL/i,
      );
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it("applies the guard to detail reads too", async () => {
      mockedEnv.encyclopediaUrlIsConfigured = false;

      await expect(fetchStyleById("style-1")).rejects.toBeInstanceOf(
        CatalogUnavailableError,
      );
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it("rethrows an AbortError untouched so TanStack can recognise its own cancellation", async () => {
      const abortError = buildAbortError();
      mockRequest.mockRejectedValueOnce(abortError);

      const rejected = await fetchBeersPage(1).catch((e: unknown) => e);

      expect(rejected).toBe(abortError);
      expect((rejected as Error).name).toBe("AbortError");
      expect(rejected).not.toBeInstanceOf(CatalogUnavailableError);
    });
  });
});
