/**
 * Use-case orchestration tests: list/search are pure pass-throughs to the
 * data layer; detail getters short-circuit to null on blank ids WITHOUT
 * hitting the data layer (so screens can render a stable "missing" state
 * for malformed routes instead of firing a doomed request).
 */
import {
  fetchBeerById,
  fetchBeersPage,
  fetchBreweryById,
  fetchStyleById,
  searchBeersPage,
} from "@/features/beer-catalog/data/beer-catalog.api";

import {
  getBeer,
  getBrewery,
  getStyle,
  listBeers,
  searchBeers,
} from "@/features/beer-catalog/application/beer-catalog.use-cases";

jest.mock("@/features/beer-catalog/data/beer-catalog.api", () => ({
  fetchBeersPage: jest.fn(),
  searchBeersPage: jest.fn(),
  fetchBeerById: jest.fn(),
  fetchBreweryById: jest.fn(),
  fetchStyleById: jest.fn(),
}));

const mockFetchBeersPage = fetchBeersPage as jest.MockedFunction<
  typeof fetchBeersPage
>;
const mockSearchBeersPage = searchBeersPage as jest.MockedFunction<
  typeof searchBeersPage
>;
const mockFetchBeerById = fetchBeerById as jest.MockedFunction<
  typeof fetchBeerById
>;
const mockFetchBreweryById = fetchBreweryById as jest.MockedFunction<
  typeof fetchBreweryById
>;
const mockFetchStyleById = fetchStyleById as jest.MockedFunction<
  typeof fetchStyleById
>;

describe("beer-catalog.use-cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("happy: pass-throughs", () => {
    it("listBeers forwards page and signal to fetchBeersPage and returns its result", async () => {
      const page = { items: [], meta: { total: 0, page: 3, perPage: 20 } };
      mockFetchBeersPage.mockResolvedValueOnce(page);
      const controller = new AbortController();

      const result = await listBeers(3, controller.signal);

      expect(mockFetchBeersPage).toHaveBeenCalledTimes(1);
      expect(mockFetchBeersPage).toHaveBeenCalledWith(3, controller.signal);
      expect(result).toBe(page);
    });

    it("searchBeers forwards q, page and signal to searchBeersPage and returns its result", async () => {
      const page = { items: [], meta: { total: 0, page: 2, perPage: 20 } };
      mockSearchBeersPage.mockResolvedValueOnce(page);
      const controller = new AbortController();

      const result = await searchBeers("ipa", 2, controller.signal);

      expect(mockSearchBeersPage).toHaveBeenCalledWith(
        "ipa",
        2,
        controller.signal,
      );
      expect(result).toBe(page);
    });
  });

  describe("happy: detail getters delegate on a non-blank id", () => {
    it("getBeer delegates to fetchBeerById with id and signal", async () => {
      const detail = {} as Awaited<ReturnType<typeof fetchBeerById>>;
      mockFetchBeerById.mockResolvedValueOnce(detail);
      const controller = new AbortController();

      const result = await getBeer("beer-1", controller.signal);

      expect(mockFetchBeerById).toHaveBeenCalledWith(
        "beer-1",
        controller.signal,
      );
      expect(result).toBe(detail);
    });

    it("getBrewery delegates to fetchBreweryById", async () => {
      const brewery = {} as Awaited<ReturnType<typeof fetchBreweryById>>;
      mockFetchBreweryById.mockResolvedValueOnce(brewery);

      const result = await getBrewery("brewery-1");

      expect(mockFetchBreweryById).toHaveBeenCalledWith("brewery-1", undefined);
      expect(result).toBe(brewery);
    });

    it("getStyle delegates to fetchStyleById", async () => {
      const style = {} as Awaited<ReturnType<typeof fetchStyleById>>;
      mockFetchStyleById.mockResolvedValueOnce(style);

      const result = await getStyle("style-1");

      expect(mockFetchStyleById).toHaveBeenCalledWith("style-1", undefined);
      expect(result).toBe(style);
    });
  });

  describe("sad: blank ids return null without calling the data layer", () => {
    it.each([
      ["empty string", ""],
      ["whitespace only", "  "],
    ])("getBeer(%s) → null, data layer untouched", async (_label, id) => {
      const result = await getBeer(id);

      expect(result).toBeNull();
      expect(mockFetchBeerById).not.toHaveBeenCalled();
    });

    it.each([
      ["empty string", ""],
      ["whitespace only", "  "],
    ])("getBrewery(%s) → null, data layer untouched", async (_label, id) => {
      const result = await getBrewery(id);

      expect(result).toBeNull();
      expect(mockFetchBreweryById).not.toHaveBeenCalled();
    });

    it.each([
      ["empty string", ""],
      ["whitespace only", "  "],
    ])("getStyle(%s) → null, data layer untouched", async (_label, id) => {
      const result = await getStyle(id);

      expect(result).toBeNull();
      expect(mockFetchStyleById).not.toHaveBeenCalled();
    });
  });

  describe("edge: data-layer rejections propagate untouched", () => {
    it("listBeers does not swallow a data-layer rejection", async () => {
      const failure = new Error("CatalogUnavailableError stand-in");
      mockFetchBeersPage.mockRejectedValueOnce(failure);

      await expect(listBeers(1)).rejects.toBe(failure);
    });
  });
});
