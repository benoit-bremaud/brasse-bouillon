import { env } from "@/core/config/env";
import { HttpError } from "@/core/http/http-error";
import { importBeerByEan } from "@/features/scan/data/beers-import.api";

const mockRequest = jest.fn();

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

jest.mock("@/core/config/env", () => ({
  env: {
    apiUrl: "http://localhost:3000",
    encyclopediaUrl: "http://test-encyclopedia.local:8000",
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

type PythonBeerReadDto = {
  id: string;
  name: string;
  slug: string;
  brewery_id: string | null;
  style_id: string | null;
  brewery_name: string | null;
  style_name: string | null;
  abv: string | null;
  ibu_min: number | null;
  ibu_max: number | null;
  srm_min: number | null;
  srm_max: number | null;
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
    brewery_name: "Pelforth",
    style_name: "Brune",
    abv: "6.5",
    ibu_min: 22,
    ibu_max: 22,
    srm_min: 30,
    srm_max: 30,
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
    mockedEnv.encyclopediaUrlIsConfigured = true;
    mockedEnv.encyclopediaUrl = "http://test-encyclopedia.local:8000";
  });

  describe("encyclopedia URL guard (Codex P1 #871)", () => {
    it("throws HttpError(503) without hitting the network when the URL is not explicitly configured", async () => {
      mockedEnv.encyclopediaUrlIsConfigured = false;

      const rejected = await importBeerByEan("3760231860119").catch(
        (e: unknown) => e,
      );

      expect(rejected).toBeInstanceOf(HttpError);
      expect((rejected as HttpError).status).toBe(503);
      expect((rejected as HttpError).message).toMatch(
        /not configured.*EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL/i,
      );
      expect(mockRequest).not.toHaveBeenCalled();
    });
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

    it("re-throws when the http-client throws (let HttpError bubble up)", async () => {
      const httpError = new Error("HTTP 503");
      mockRequest.mockRejectedValueOnce(httpError);

      await expect(importBeerByEan("3760231860119")).rejects.toBe(httpError);
    });
  });

  describe("source heuristic (200 vs 201 — no HTTP status visibility)", () => {
    it("treats a row created within the last few seconds as cache_miss_fetched (just imported)", async () => {
      const justCreated = new Date(Date.now() - 1_000).toISOString();
      mockRequest.mockResolvedValueOnce(
        buildDto({ created_at: justCreated, updated_at: justCreated }),
      );

      const result = await importBeerByEan("3760231860119");

      expect(result.source).toBe("cache_miss_fetched");
    });

    it("treats a row created long ago as cache_hit_fresh (DB hit, no upstream fetch)", async () => {
      mockRequest.mockResolvedValueOnce(
        buildDto({ created_at: "2026-04-01T08:00:00.000Z" }),
      );

      const result = await importBeerByEan("3760231860119");

      expect(result.source).toBe("cache_hit_fresh");
    });

    it("falls back to cache_hit_fresh when created_at cannot be parsed", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ created_at: "not-a-date" }));

      const result = await importBeerByEan("3760231860119");

      expect(result.source).toBe("cache_hit_fresh");
    });
  });

  describe("rawPayloadAvailable (Python persists EntitySource.raw_data only for OFF imports)", () => {
    it("returns true when the source is openfoodfacts", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ source: "openfoodfacts" }));

      const result = await importBeerByEan("3760231860119");

      expect(result.rawPayloadAvailable).toBe(true);
    });

    it("returns false when the source is internal (no upstream payload to keep)", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ source: "internal" }));

      const result = await importBeerByEan("3760231860119");

      expect(result.rawPayloadAvailable).toBe(false);
    });

    it("returns false when the source is community", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ source: "community" }));

      const result = await importBeerByEan("3760231860119");

      expect(result.rawPayloadAvailable).toBe(false);
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
      // BeerRead exposes no actual OFF fetch timestamp — see mapper
      // comment. We surface null rather than misrepresent updated_at.
      expect(item.fetchedAt).toBeNull();
    });

    it("uses the server-resolved brewery_name / style_name when present", async () => {
      mockRequest.mockResolvedValueOnce(
        buildDto({ brewery_name: "BrewDog", style_name: "India Pale Ale" }),
      );

      const { item } = await importBeerByEan("3760231860119");

      expect(item.brewery).toBe("BrewDog");
      expect(item.style).toBe("India Pale Ale");
    });

    it("falls back to placeholders when brewery_name / style_name are null", async () => {
      mockRequest.mockResolvedValueOnce(
        buildDto({ brewery_name: null, style_name: null }),
      );

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
      mockRequest.mockResolvedValueOnce(buildDto({ srm_min: 10, srm_max: 10 }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.colorEbc).toBe(20); // 10 * 1.97 = 19.7 → 20
      expect(item.isColorEbcEstimated).toBe(true);
    });

    it("returns null colorEbc and unflagged estimation when srm is null", async () => {
      mockRequest.mockResolvedValueOnce(
        buildDto({ srm_min: null, srm_max: null }),
      );

      const { item } = await importBeerByEan("3760231860119");

      expect(item.colorEbc).toBeNull();
      expect(item.colorEbcMin).toBeNull();
      expect(item.colorEbcMax).toBeNull();
      expect(item.isColorEbcEstimated).toBe(false);
    });

    it("propagates ibu null without estimation", async () => {
      mockRequest.mockResolvedValueOnce(
        buildDto({ ibu_min: null, ibu_max: null }),
      );

      const { item } = await importBeerByEan("3760231860119");

      expect(item.ibu).toBeNull();
      expect(item.ibuMin).toBeNull();
      expect(item.ibuMax).toBeNull();
      expect(item.isIbuEstimated).toBe(false);
    });

    it("collapses an exact IBU interval (min === max) to the value, not estimated", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ ibu_min: 20, ibu_max: 20 }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.ibu).toBe(20);
      expect(item.ibuMin).toBe(20);
      expect(item.ibuMax).toBe(20);
      expect(item.isIbuEstimated).toBe(false);
    });

    it("keeps IBU bounds and uses the rounded midpoint when min !== max (flagged estimated)", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ ibu_min: 20, ibu_max: 28 }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.ibuMin).toBe(20);
      expect(item.ibuMax).toBe(28);
      expect(item.ibu).toBe(24); // round((20 + 28) / 2)
      expect(item.isIbuEstimated).toBe(true);
    });

    it("maps an SRM interval to EBC bounds plus a midpoint-derived scalar", async () => {
      mockRequest.mockResolvedValueOnce(buildDto({ srm_min: 4, srm_max: 8 }));

      const { item } = await importBeerByEan("3760231860119");

      expect(item.colorEbcMin).toBe(8); // round(4 * 1.97)
      expect(item.colorEbcMax).toBe(16); // round(8 * 1.97)
      expect(item.colorEbc).toBe(12); // srmToEbc(midpoint 6) = round(11.82)
      expect(item.isColorEbcEstimated).toBe(true);
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
