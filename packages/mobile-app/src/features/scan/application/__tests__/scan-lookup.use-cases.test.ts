import { dataSource } from "@/core/data/data-source";
import { HttpError } from "@/core/http/http-error";
import {
  ScanLookupBeerNotFoundError,
  ScanLookupInvalidBarcodeError,
  ScanLookupNotABeerError,
  ScanLookupServiceUnavailableError,
  lookupBeerByBarcode,
} from "@/features/scan/application/scan-lookup.use-cases";
import { importBeerByEan as fetchImportFromEncyclopedia } from "@/features/scan/data/beers-import.api";
import { lookupBeerByBarcode as fetchLookupFromApi } from "@/features/scan/data/scan-lookup.api";

jest.mock("@/core/data/data-source", () => ({
  dataSource: { useDemoData: false },
}));

jest.mock("@/features/scan/data/scan-lookup.api", () => ({
  lookupBeerByBarcode: jest.fn(),
}));

jest.mock("@/features/scan/data/beers-import.api", () => ({
  importBeerByEan: jest.fn(),
}));

const mockFetchLookup = fetchLookupFromApi as jest.MockedFunction<
  typeof fetchLookupFromApi
>;
const mockFetchImport = fetchImportFromEncyclopedia as jest.MockedFunction<
  typeof fetchImportFromEncyclopedia
>;

// Encyclopedia-first (cutover #1186, finishing ADR-0005):
// `fetchImportFromEncyclopedia` is the PRIMARY backend; `fetchLookupFromApi`
// (legacy NestJS) is the transitional fallback, reached only when the
// encyclopedia is unavailable (503).
describe("scan-lookup.use-cases / lookupBeerByBarcode", () => {
  beforeEach(() => {
    mockFetchLookup.mockReset();
    mockFetchImport.mockReset();
    dataSource.useDemoData = false;
  });

  describe("input normalisation", () => {
    it("trims whitespace and strips non-digits before hitting the encyclopedia", async () => {
      mockFetchImport.mockResolvedValueOnce({
        item: { barcode: "5060277380019" } as never,
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("  5060-277 380019  ");

      expect(mockFetchImport).toHaveBeenCalledWith("5060277380019");
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode is empty", async () => {
      await expect(lookupBeerByBarcode("")).rejects.toBeInstanceOf(
        ScanLookupInvalidBarcodeError,
      );
      expect(mockFetchImport).not.toHaveBeenCalled();
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode has no digit", async () => {
      await expect(lookupBeerByBarcode("   abc---  ")).rejects.toBeInstanceOf(
        ScanLookupInvalidBarcodeError,
      );
      expect(mockFetchImport).not.toHaveBeenCalled();
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode is too short (< 8 digits)", async () => {
      await expect(lookupBeerByBarcode("1234567")).rejects.toBeInstanceOf(
        ScanLookupInvalidBarcodeError,
      );
      expect(mockFetchImport).not.toHaveBeenCalled();
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode is too long (> 14 digits)", async () => {
      await expect(
        lookupBeerByBarcode("123456789012345"),
      ).rejects.toBeInstanceOf(ScanLookupInvalidBarcodeError);
      expect(mockFetchImport).not.toHaveBeenCalled();
    });

    it("accepts an 8-digit barcode (lower bound — EAN-8)", async () => {
      mockFetchImport.mockResolvedValueOnce({
        item: { barcode: "12345678" } as never,
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("12345678");

      expect(mockFetchImport).toHaveBeenCalledWith("12345678");
    });

    it("accepts a 14-digit barcode (upper bound — GTIN-14)", async () => {
      mockFetchImport.mockResolvedValueOnce({
        item: { barcode: "12345678901234" } as never,
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("12345678901234");

      expect(mockFetchImport).toHaveBeenCalledWith("12345678901234");
    });
  });

  describe("demo mode", () => {
    beforeEach(() => {
      dataSource.useDemoData = true;
    });

    it("returns the matching demo entry without hitting the network", async () => {
      const result = await lookupBeerByBarcode("5060277380019");

      expect(mockFetchImport).not.toHaveBeenCalled();
      expect(mockFetchLookup).not.toHaveBeenCalled();
      expect(result.item.name).toBe("Punk IPA");
      expect(result.item.brewery).toBe("BrewDog");
      expect(result.source).toBe("cache_hit_fresh");
      expect(result.rawPayloadAvailable).toBe(false);
    });

    it("throws ScanLookupBeerNotFoundError when the demo catalogue has no match", async () => {
      await expect(lookupBeerByBarcode("0000000000000")).rejects.toBeInstanceOf(
        ScanLookupBeerNotFoundError,
      );
      expect(mockFetchImport).not.toHaveBeenCalled();
    });
  });

  describe("encyclopedia-first — primary path", () => {
    it("returns the encyclopedia result when it resolves the barcode", async () => {
      const expected = {
        item: {
          id: "id-1",
          barcode: "5060277380019",
          name: "Punk IPA",
        } as never,
        source: "cache_miss_fetched" as const,
        rawPayloadAvailable: true,
      };
      mockFetchImport.mockResolvedValueOnce(expected);

      const result = await lookupBeerByBarcode("5060277380019");

      expect(result).toBe(expected);
      expect(mockFetchImport).toHaveBeenCalledWith("5060277380019");
    });

    it("does not call NestJS when the encyclopedia succeeds (warm path)", async () => {
      mockFetchImport.mockResolvedValueOnce({
        item: { barcode: "5060277380019" } as never,
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("5060277380019");

      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("maps an encyclopedia 404 to ScanLookupBeerNotFoundError without falling back to NestJS", async () => {
      mockFetchImport.mockRejectedValueOnce(
        new HttpError(404, "EAN unknown to DB and OFF"),
      );

      await expect(lookupBeerByBarcode("1234567890123")).rejects.toBeInstanceOf(
        ScanLookupBeerNotFoundError,
      );
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("re-throws an encyclopedia 422 (other validation, not NOT_A_BEER) untouched", async () => {
      const validationError = new HttpError(422, "Some other 422", {
        statusCode: 422,
        message: "Validation failed",
      });
      mockFetchImport.mockRejectedValueOnce(validationError);

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBe(
        validationError,
      );
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("re-throws other encyclopedia statuses (429, 401, 500…) without falling back", async () => {
      const rateLimited = new HttpError(429, "Too many requests");
      mockFetchImport.mockRejectedValueOnce(rateLimited);

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBe(
        rateLimited,
      );
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("re-throws non-HttpError exceptions untouched (network failures)", async () => {
      const networkError = new Error("Network request failed");
      mockFetchImport.mockRejectedValueOnce(networkError);

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBe(
        networkError,
      );
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });
  });

  describe("NestJS fallback (transitional — only on encyclopedia 503)", () => {
    it("falls back to NestJS when the encyclopedia is unavailable (503) and returns its result", async () => {
      const fallbackResult = {
        item: { barcode: "3770012913076", name: "Biere A la fut IPA" } as never,
        source: "cache_miss_fetched" as const,
        rawPayloadAvailable: false,
      };
      mockFetchImport.mockRejectedValueOnce(
        new HttpError(503, "encyclopedia unavailable"),
      );
      mockFetchLookup.mockResolvedValueOnce(fallbackResult);

      const result = await lookupBeerByBarcode("3770012913076");

      expect(result).toBe(fallbackResult);
      expect(mockFetchImport).toHaveBeenCalledWith("3770012913076");
      expect(mockFetchLookup).toHaveBeenCalledWith("3770012913076");
    });

    it("maps a NestJS 404 during fallback to ScanLookupBeerNotFoundError", async () => {
      mockFetchImport.mockRejectedValueOnce(
        new HttpError(503, "encyclopedia unavailable"),
      );
      mockFetchLookup.mockRejectedValueOnce(new HttpError(404, "Not found"));

      await expect(lookupBeerByBarcode("1234567890123")).rejects.toBeInstanceOf(
        ScanLookupBeerNotFoundError,
      );
    });

    it("maps a NestJS 503 during fallback to ScanLookupServiceUnavailableError", async () => {
      mockFetchImport.mockRejectedValueOnce(
        new HttpError(503, "encyclopedia unavailable"),
      );
      mockFetchLookup.mockRejectedValueOnce(new HttpError(503, "NestJS down too"));

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBeInstanceOf(
        ScanLookupServiceUnavailableError,
      );
    });

    it("translates a NestJS 422 NOT_A_BEER during fallback to ScanLookupNotABeerError with the product name (#798)", async () => {
      mockFetchImport.mockRejectedValueOnce(
        new HttpError(503, "encyclopedia unavailable"),
      );
      mockFetchLookup.mockRejectedValueOnce(
        new HttpError(422, "Not a beer", {
          statusCode: 422,
          errorCode: "NOT_A_BEER",
          barcode: "5449000000996",
          productName: "Coca-Cola Original",
        }),
      );

      const rejected = await lookupBeerByBarcode("5449000000996").catch(
        (e: unknown) => e,
      );

      expect(rejected).toBeInstanceOf(ScanLookupNotABeerError);
      expect((rejected as ScanLookupNotABeerError).productName).toBe(
        "Coca-Cola Original",
      );
      expect((rejected as ScanLookupNotABeerError).barcode).toBe(
        "5449000000996",
      );
    });
  });

  describe("custom error classes", () => {
    it("ScanLookupBeerNotFoundError exposes the queried barcode", () => {
      const err = new ScanLookupBeerNotFoundError("5060277380019");
      expect(err.barcode).toBe("5060277380019");
      expect(err.name).toBe("ScanLookupBeerNotFoundError");
    });

    it("ScanLookupServiceUnavailableError exposes the queried barcode", () => {
      const err = new ScanLookupServiceUnavailableError("5060277380019");
      expect(err.barcode).toBe("5060277380019");
      expect(err.name).toBe("ScanLookupServiceUnavailableError");
    });

    it("ScanLookupInvalidBarcodeError truncates very long input in the message", () => {
      const err = new ScanLookupInvalidBarcodeError("a".repeat(200));
      expect(err.message.length).toBeLessThan(120);
      expect(err.name).toBe("ScanLookupInvalidBarcodeError");
    });
  });
});
