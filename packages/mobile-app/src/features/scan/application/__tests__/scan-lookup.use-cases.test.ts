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

describe("scan-lookup.use-cases / lookupBeerByBarcode", () => {
  beforeEach(() => {
    mockFetchLookup.mockReset();
    mockFetchImport.mockReset();
    dataSource.useDemoData = false;
  });

  describe("input normalisation", () => {
    it("trims whitespace and strips non-digits before hitting the API", async () => {
      mockFetchLookup.mockResolvedValueOnce({
        item: { barcode: "5060277380019" } as never,
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("  5060-277 380019  ");

      expect(mockFetchLookup).toHaveBeenCalledWith("5060277380019");
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode is empty", async () => {
      await expect(lookupBeerByBarcode("")).rejects.toBeInstanceOf(
        ScanLookupInvalidBarcodeError,
      );
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode has no digit", async () => {
      await expect(lookupBeerByBarcode("   abc---  ")).rejects.toBeInstanceOf(
        ScanLookupInvalidBarcodeError,
      );
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode is too short (< 8 digits)", async () => {
      await expect(lookupBeerByBarcode("1234567")).rejects.toBeInstanceOf(
        ScanLookupInvalidBarcodeError,
      );
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("throws ScanLookupInvalidBarcodeError when the barcode is too long (> 14 digits)", async () => {
      await expect(
        lookupBeerByBarcode("123456789012345"),
      ).rejects.toBeInstanceOf(ScanLookupInvalidBarcodeError);
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });

    it("accepts an 8-digit barcode (lower bound — EAN-8)", async () => {
      mockFetchLookup.mockResolvedValueOnce({
        item: { barcode: "12345678" } as never,
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("12345678");

      expect(mockFetchLookup).toHaveBeenCalledWith("12345678");
    });

    it("accepts a 14-digit barcode (upper bound — GTIN-14)", async () => {
      mockFetchLookup.mockResolvedValueOnce({
        item: { barcode: "12345678901234" } as never,
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("12345678901234");

      expect(mockFetchLookup).toHaveBeenCalledWith("12345678901234");
    });
  });

  describe("demo mode", () => {
    beforeEach(() => {
      dataSource.useDemoData = true;
    });

    it("returns the matching demo entry without hitting the network", async () => {
      const result = await lookupBeerByBarcode("5060277380019");

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
      expect(mockFetchLookup).not.toHaveBeenCalled();
    });
  });

  describe("real API mode — error mapping", () => {
    it("falls back to ScanLookupBeerNotFoundError when both NestJS and Python return 404 (ADR-0005)", async () => {
      mockFetchLookup.mockRejectedValueOnce(
        new HttpError(404, "Beer not found"),
      );
      mockFetchImport.mockRejectedValueOnce(
        new HttpError(404, "EAN unknown to OFF"),
      );

      await expect(lookupBeerByBarcode("1234567890123")).rejects.toBeInstanceOf(
        ScanLookupBeerNotFoundError,
      );
      expect(mockFetchImport).toHaveBeenCalledWith("1234567890123");
    });

    it("translates a 503 HttpError to ScanLookupServiceUnavailableError", async () => {
      mockFetchLookup.mockRejectedValueOnce(
        new HttpError(503, "OFF unreachable"),
      );

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBeInstanceOf(
        ScanLookupServiceUnavailableError,
      );
    });

    it("translates a 422 NOT_A_BEER HttpError to ScanLookupNotABeerError carrying the product name (Issue #798)", async () => {
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

    it("re-throws a 422 HttpError that is NOT NOT_A_BEER (other validation errors)", async () => {
      const validationError = new HttpError(422, "Some other 422", {
        statusCode: 422,
        message: "Validation failed",
      });
      mockFetchLookup.mockRejectedValueOnce(validationError);

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBe(
        validationError,
      );
    });

    it("re-throws HttpError for other statuses (401, 429, 500…)", async () => {
      const rateLimited = new HttpError(429, "Too many requests");
      mockFetchLookup.mockRejectedValueOnce(rateLimited);

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBe(
        rateLimited,
      );
    });

    it("re-throws non-HttpError exceptions untouched (network failures)", async () => {
      const networkError = new Error("Network request failed");
      mockFetchLookup.mockRejectedValueOnce(networkError);

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBe(
        networkError,
      );
    });

    it("returns the API result when the call succeeds", async () => {
      mockFetchLookup.mockResolvedValueOnce({
        item: {
          id: "id-1",
          barcode: "5060277380019",
          name: "Punk IPA",
        } as never,
        source: "cache_miss_fetched",
        rawPayloadAvailable: true,
      });

      const result = await lookupBeerByBarcode("5060277380019");

      expect(result.item.name).toBe("Punk IPA");
      expect(result.source).toBe("cache_miss_fetched");
      expect(result.rawPayloadAvailable).toBe(true);
    });
  });

  describe("encyclopedia fallback (ADR-0005)", () => {
    it("returns the Python result when NestJS 404s and Python finds the beer", async () => {
      const expectedResult = {
        item: {
          barcode: "3760298280016",
          name: "Page 24 Réserve Hildegarde",
        } as never,
        source: "cache_miss_fetched" as const,
        rawPayloadAvailable: false,
      };
      mockFetchLookup.mockRejectedValueOnce(new HttpError(404, "Not found"));
      mockFetchImport.mockResolvedValueOnce(expectedResult);

      const result = await lookupBeerByBarcode("3760298280016");

      expect(result).toBe(expectedResult);
      expect(mockFetchLookup).toHaveBeenCalledWith("3760298280016");
      expect(mockFetchImport).toHaveBeenCalledWith("3760298280016");
    });

    it("translates a Python 503 during fallback to ScanLookupServiceUnavailableError", async () => {
      mockFetchLookup.mockRejectedValueOnce(new HttpError(404, "Not found"));
      mockFetchImport.mockRejectedValueOnce(
        new HttpError(503, "OFF unreachable"),
      );

      await expect(lookupBeerByBarcode("1234567890123")).rejects.toBeInstanceOf(
        ScanLookupServiceUnavailableError,
      );
    });

    it("does not call Python when NestJS returns a non-404 error", async () => {
      mockFetchLookup.mockRejectedValueOnce(new HttpError(503, "NestJS down"));

      await expect(lookupBeerByBarcode("1234567890123")).rejects.toBeInstanceOf(
        ScanLookupServiceUnavailableError,
      );
      expect(mockFetchImport).not.toHaveBeenCalled();
    });

    it("does not call Python when NestJS succeeds (warm path stays single-backend)", async () => {
      const directResult = {
        item: { barcode: "5060277380019" } as never,
        source: "cache_hit_fresh" as const,
        rawPayloadAvailable: false,
      };
      mockFetchLookup.mockResolvedValueOnce(directResult);

      const result = await lookupBeerByBarcode("5060277380019");

      expect(result).toBe(directResult);
      expect(mockFetchImport).not.toHaveBeenCalled();
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
