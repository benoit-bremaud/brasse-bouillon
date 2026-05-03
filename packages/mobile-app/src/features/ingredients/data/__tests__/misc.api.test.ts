/**
 * Tests for the misc catalogue api consumer.
 *
 * The module is currently unwired (Issue #624 will integrate
 * `IngredientCategory.misc` into the picker UX), but the
 * mapping logic ships now to keep the mobile mock layer
 * aligned with the API endpoint shipped on PR #899. These
 * tests guard the DTO → MiscProduct mapping contract that
 * the future picker UX will rely on.
 */

import * as httpClient from "@/core/http/http-client";

import {
  MiscProduct,
  getMiscDetailsApi,
  listMiscApi,
} from "@/features/ingredients/data/misc.api";

import { HttpError } from "@/core/http/http-error";

jest.mock("@/core/http/http-client");

const mockedRequest = httpClient.request as jest.MockedFunction<
  typeof httpClient.request
>;

describe("misc.api", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  describe("listMiscApi", () => {
    // Happy path
    it("maps a full catalogue DTO to MiscProduct verbatim", async () => {
      mockedRequest.mockResolvedValue([
        {
          id: "00000000-0000-4000-9000-700000000004",
          name: "Orange Peel, Bitter",
          type: "spice",
          use_at: "boil",
          amount: 0.02218,
          amount_is_weight: false,
          time_min: 5,
          use_for: "Belgian Wit",
          notes: "Écorce d'orange amère séchée.",
          producer_id: null,
        },
      ]);

      const result = await listMiscApi();

      expect(mockedRequest).toHaveBeenCalledWith("/catalog/misc-templates");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject<Partial<MiscProduct>>({
        id: "00000000-0000-4000-9000-700000000004",
        name: "Orange Peel, Bitter",
        miscType: "spice",
        useAt: "boil",
        amount: 0.02218,
        amountIsWeight: false,
        timeMin: 5,
        useFor: "Belgian Wit",
        description: "Écorce d'orange amère séchée.",
      });
    });

    // Sad path — non-array response should yield empty list
    it("returns [] when response is not an array (defensive)", async () => {
      mockedRequest.mockResolvedValue(
        null as unknown as Awaited<ReturnType<typeof httpClient.request>>,
      );

      const result = await listMiscApi();

      expect(result).toEqual([]);
    });

    // Edge — DTOs missing required fields are filtered out
    it("filters out entries missing id or name", async () => {
      mockedRequest.mockResolvedValue([
        { name: "Orphan misc" }, // no id
        { id: "abc" }, // no name
        {
          id: "00000000-0000-4000-9000-700000000005",
          name: "Coriandre",
          type: "spice",
        },
      ]);

      const result = await listMiscApi();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Coriandre");
    });
  });

  describe("getMiscDetailsApi", () => {
    // Happy path
    it("fetches a single misc by UUID and maps it", async () => {
      mockedRequest.mockResolvedValue({
        id: "00000000-0000-4000-9000-700000000008",
        name: "Servomyces (nutriment levure)",
        type: "other",
        use_at: "boil",
        amount: 0.001,
        amount_is_weight: true,
        time_min: 10,
        use_for: "Yeast Health",
        producer_id: "00000000-0000-4000-9000-800000000003",
      });

      const result = await getMiscDetailsApi(
        "00000000-0000-4000-9000-700000000008",
      );

      expect(mockedRequest).toHaveBeenCalledWith(
        "/catalog/misc-templates/00000000-0000-4000-9000-700000000008",
      );
      expect(result?.name).toBe("Servomyces (nutriment levure)");
      expect(result?.miscType).toBe("other");
      expect(result?.amountIsWeight).toBe(true);
      expect(result?.producerId).toBe("00000000-0000-4000-9000-800000000003");
    });

    // Sad path — empty id short-circuits to null without firing a request
    it("returns null when id is empty", async () => {
      const result = await getMiscDetailsApi("");

      expect(result).toBeNull();
      expect(mockedRequest).not.toHaveBeenCalled();
    });

    // Sad path — 404 is gracefully handled, other errors propagate
    it("returns null on 404, propagates other HttpErrors", async () => {
      mockedRequest.mockRejectedValueOnce(
        new HttpError(404, "Not found", "/catalog/misc-templates/missing"),
      );
      const notFound = await getMiscDetailsApi("missing");
      expect(notFound).toBeNull();

      mockedRequest.mockRejectedValueOnce(
        new HttpError(500, "Server error", "/catalog/misc-templates/abc"),
      );
      await expect(getMiscDetailsApi("abc")).rejects.toThrow(HttpError);
    });
  });
});
