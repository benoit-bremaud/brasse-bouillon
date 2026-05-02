import { env } from "@/core/config/env";
import { importBeerByEan } from "@/features/scan/data/beers-import.api";

const mockRequest = jest.fn();

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

type PythonBeerReadDto = {
  id: string;
  name: string;
  slug: string;
  brewery_id: string | null;
  style_id: string | null;
  abv: string | null;
  ibu: number | null;
  srm: number | null;
  description: string | null;
  is_active: boolean;
  is_verified: boolean;
  source: "openfoodfacts" | "internal" | "community";
  ean_code: string | null;
  legal_denomination: string | null;
  country_of_origin: string | null;
  allergens: string[] | null;
  alcohol_group: number | null;
  created_at: string;
  updated_at: string;
};

function buildDto(
  overrides: Partial<PythonBeerReadDto> = {},
): PythonBeerReadDto {
  return {
    id: "ddc4c2bc-6f5b-4c2f-9f4d-7e0e0a8b1c2d",
    name: "Pelforth Brune",
    slug: "pelforth-brune",
    brewery_id: "b1d2c3e4-1111-2222-3333-444455556666",
    style_id: "5d6e7f80-aaaa-bbbb-cccc-ddddeeee0001",
    abv: "6.5",
    ibu: 22,
    srm: 30,
    description: "Brune intense",
    is_active: true,
    is_verified: false,
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

describe("beers-import.api / importBeerByEan", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  describe("HTTP wiring", () => {
    it("POSTs /beers/import-by-ean to the encyclopedia backend with the EAN body and no auth", async () => {
      mockRequest.mockResolvedValueOnce(buildDto());

      await importBeerByEan("3760231860119");

      expect(mockRequest).toHaveBeenCalledTimes(1);
      const [path, options] = mockRequest.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(path).toBe("/beers/import-by-ean");
      expect(options).toMatchObject({
        method: "POST",
        body: { ean: "3760231860119" },
        auth: false,
        baseUrl: env.encyclopediaUrl,
      });
    });

    it("returns a ScanLookupResult with cache_miss_fetched source and rawPayloadAvailable=false", async () => {
      mockRequest.mockResolvedValueOnce(buildDto());

      const result = await importBeerByEan("3760231860119");

      expect(result.source).toBe("cache_miss_fetched");
      expect(result.rawPayloadAvailable).toBe(false);
      expect(result.item.barcode).toBe("3760231860119");
    });

    it("re-throws when the http-client throws (let HttpError bubble up)", async () => {
      const httpError = new Error("HTTP 503");
      mockRequest.mockRejectedValueOnce(httpError);

      await expect(importBeerByEan("3760231860119")).rejects.toBe(httpError);
    });
  });

  describe("DTO → ScanCatalogItem mapping", () => {
    it("maps name, description and timestamps and uses the queried EAN as barcode", async () => {
      mockRequest.mockResolvedValueOnce(
        buildDto({
          name: "Goudale Ambrée",
          description: "Ambrée typée",
          created_at: "2026-04-01T08:00:00.000Z",
          updated_at: "2026-04-15T09:00:00.000Z",
        }),
      );

      const { item } = await importBeerByEan("3760298280016");

      expect(item.barcode).toBe("3760298280016");
      expect(item.name).toBe("Goudale Ambrée");
      expect(item.notesSource).toBe("Ambrée typée");
      expect(item.createdAt).toBe("2026-04-01T08:00:00.000Z");
      expect(item.updatedAt).toBe("2026-04-15T09:00:00.000Z");
      expect(item.fetchedAt).toBe("2026-04-15T09:00:00.000Z");
    });

    it("substitutes 'Brasserie inconnue' / 'Style inconnu' placeholders (FK UUIDs not yet enriched)", async () => {
      mockRequest.mockResolvedValueOnce(buildDto());

      const { item } = await importBeerByEan("3760231860119");

      expect(item.brewery).toBe("Brasserie inconnue");
      expect(item.style).toBe("Style inconnu");
      expect(item.fermentationType).toBe("");
      expect(item.aromaticTags).toBeNull();
      expect(item.isStyleEstimated).toBe(true);
    });

    it("parses Decimal-as-string abv into a number", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ abv: "5.4" }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.abv).toBe(5.4);
      expect(item.isAbvEstimated).toBe(false);
    });

    it("preserves null abv when the source has no value", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ abv: null }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.abv).toBeNull();
    });

    it("converts SRM to EBC (factor 1.97, rounded) and flags color as estimated", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ srm: 10 }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.colorEbc).toBe(20); // 10 * 1.97 = 19.7 → 20
      expect(item.isColorEbcEstimated).toBe(true);
    });

    it("returns null colorEbc and unflagged estimation when srm is null", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ srm: null }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.colorEbc).toBeNull();
      expect(item.isColorEbcEstimated).toBe(false);
    });

    it("propagates ibu null without estimation", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ ibu: null }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.ibu).toBeNull();
      expect(item.isIbuEstimated).toBe(false);
    });
  });

  describe("source → origin mapping", () => {
    it("maps Python 'openfoodfacts' to ScanCatalogItem origin 'openfoodfacts'", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ source: "openfoodfacts" }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.origin).toBe("openfoodfacts");
    });

    it("maps Python 'internal' to 'seed' (closest NestJS analogue)", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ source: "internal" }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.origin).toBe("seed");
    });

    it("maps Python 'community' to 'manual' (placeholder until community origin lands)", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ source: "community" }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.origin).toBe("manual");
    });
  });
});
