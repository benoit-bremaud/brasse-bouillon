import { lookupBeerByBarcode } from "@/features/scan/data/scan-lookup.api";

const mockRequest = jest.fn();

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

describe("scan-lookup.api / lookupBeerByBarcode", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  describe("happy path", () => {
    it("calls the backend with the URL-encoded EAN", async () => {
      mockRequest.mockResolvedValueOnce({
        item: {
          id: "id-1",
          barcode: "5060277380019",
          name: "Punk IPA",
          brewery: "BrewDog",
          style: "IPA",
          abv: 5.4,
          ibu: 35,
          color_ebc: 14,
          fermentation_type: "ale",
          aromatic_tags: "tropical, citrus, pine",
          notes_source: "BrewDog DIY Dog 2019",
          is_abv_estimated: false,
          is_ibu_estimated: false,
          is_color_ebc_estimated: false,
          is_style_estimated: false,
          source: "seed",
          fetched_at: null,
          created_at: "2026-04-27T00:00:00.000Z",
          updated_at: "2026-04-27T00:00:00.000Z",
        },
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      const result = await lookupBeerByBarcode("5060277380019");

      expect(mockRequest).toHaveBeenCalledWith("/scan/lookup/5060277380019");
      expect(result.item.barcode).toBe("5060277380019");
      expect(result.item.name).toBe("Punk IPA");
      expect(result.source).toBe("cache_hit_fresh");
    });

    it("normalises snake_case backend fields to camelCase domain shape", async () => {
      mockRequest.mockResolvedValueOnce({
        item: {
          id: "id-2",
          barcode: "5410702000133",
          name: "La Chouffe",
          brewery: "Brasserie d Achouffe",
          style: "Belgian Strong Pale Ale",
          abv: 8.0,
          ibu: 20,
          color_ebc: 14,
          fermentation_type: "ale",
          aromatic_tags: "banana, clove",
          notes_source: "datasheet",
          is_abv_estimated: false,
          is_ibu_estimated: true,
          is_color_ebc_estimated: true,
          is_style_estimated: false,
          source: "openfoodfacts",
          fetched_at: "2026-04-27T01:00:00.000Z",
          created_at: "2026-04-27T00:00:00.000Z",
          updated_at: "2026-04-27T01:00:00.000Z",
        },
        source: "cache_hit_stale",
        rawPayloadAvailable: true,
      });

      const result = await lookupBeerByBarcode("5410702000133");

      expect(result.item.colorEbc).toBe(14);
      expect(result.item.fermentationType).toBe("ale");
      expect(result.item.aromaticTags).toBe("banana, clove");
      expect(result.item.notesSource).toBe("datasheet");
      expect(result.item.isAbvEstimated).toBe(false);
      expect(result.item.isIbuEstimated).toBe(true);
      expect(result.item.isColorEbcEstimated).toBe(true);
      expect(result.item.isStyleEstimated).toBe(false);
      expect(result.item.origin).toBe("openfoodfacts");
      expect(result.item.fetchedAt).toBe("2026-04-27T01:00:00.000Z");
      expect(result.source).toBe("cache_hit_stale");
      expect(result.rawPayloadAvailable).toBe(true);
    });
  });

  describe("sad path — backend returned nullable fields", () => {
    it("propagates null abv / ibu / colorEbc / aromaticTags / notesSource / fetchedAt", async () => {
      mockRequest.mockResolvedValueOnce({
        item: {
          id: "id-3",
          barcode: "1234567890123",
          name: "Mystery Beer",
          brewery: "Unknown Brewery",
          style: "Unknown",
          abv: null,
          ibu: null,
          color_ebc: null,
          fermentation_type: "unknown",
          aromatic_tags: null,
          notes_source: null,
          is_abv_estimated: true,
          is_ibu_estimated: true,
          is_color_ebc_estimated: true,
          is_style_estimated: true,
          source: "openfoodfacts",
          fetched_at: null,
          created_at: "2026-04-27T00:00:00.000Z",
          updated_at: "2026-04-27T00:00:00.000Z",
        },
        source: "cache_miss_fetched",
        rawPayloadAvailable: true,
      });

      const result = await lookupBeerByBarcode("1234567890123");

      expect(result.item.abv).toBeNull();
      expect(result.item.ibu).toBeNull();
      expect(result.item.colorEbc).toBeNull();
      expect(result.item.aromaticTags).toBeNull();
      expect(result.item.notesSource).toBeNull();
      expect(result.item.fetchedAt).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("URL-encodes a barcode containing path-traversal characters", async () => {
      mockRequest.mockResolvedValueOnce({
        item: {
          id: "id-x",
          barcode: "weird",
          name: "x",
          brewery: "x",
          style: "x",
          fermentation_type: "ale",
          is_abv_estimated: false,
          is_ibu_estimated: false,
          is_color_ebc_estimated: false,
          is_style_estimated: false,
          source: "manual",
          created_at: "2026-04-27T00:00:00.000Z",
          updated_at: "2026-04-27T00:00:00.000Z",
        },
        source: "cache_hit_fresh",
        rawPayloadAvailable: false,
      });

      await lookupBeerByBarcode("../../etc/passwd");

      const url = mockRequest.mock.calls[0][0] as string;
      expect(url).not.toContain("/../");
      expect(url).toContain("..%2F..%2Fetc%2Fpasswd");
    });

    it("re-throws when the http-client throws (let HttpError bubble up)", async () => {
      const networkError = new Error("Network request failed");
      mockRequest.mockRejectedValueOnce(networkError);

      await expect(lookupBeerByBarcode("5060277380019")).rejects.toBe(
        networkError,
      );
    });
  });
});
