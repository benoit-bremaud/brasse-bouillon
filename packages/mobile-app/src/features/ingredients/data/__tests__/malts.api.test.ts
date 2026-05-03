/**
 * Tests for the malts catalogue api consumer (Issue #887).
 * Guards the DTO → MaltProduct mapping. Note: API table is
 * `fermentables` for BeerXML alignment; mobile keeps "malt"
 * for the brewer's mental model.
 */

import * as httpClient from "@/core/http/http-client";

import {
  getMaltDetailsApi,
  listMaltsApi,
} from "@/features/ingredients/data/malts.api";

import { HttpError } from "@/core/http/http-error";

jest.mock("@/core/http/http-client");

const mockedRequest = httpClient.request as jest.MockedFunction<
  typeof httpClient.request
>;

describe("malts.api", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  describe("listMaltsApi", () => {
    it("maps a full catalog DTO + builds Color & Enzymes specGroups", async () => {
      mockedRequest.mockResolvedValue([
        {
          id: "uuid-pilsen",
          name: "Pilsner Malt",
          type: "grain",
          origin: "Germany",
          color_ebc_typical: 3,
          potential_gravity_typical: 1.038,
          yield_percent_typical: 80,
          diastatic_power_lintner: 110,
          max_in_batch_percent: 100,
          recommend_mash: true,
          notes: "Classic German base malt.",
          producer_id: null,
        },
      ]);

      const result = await listMaltsApi();

      expect(mockedRequest).toHaveBeenCalledWith("/catalog/fermentables");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "uuid-pilsen",
        name: "Pilsner Malt",
        originCountry: "Germany",
        maltType: "grain",
      });
      // Color & yield group with the parsed-by-use-case "Color (EBC)" label
      const colorGroup = result[0].specGroups.find(
        (g) => g.id === "malt-color-group",
      );
      expect(
        colorGroup?.rows.find((r) => r.label === "Color (EBC)")?.value,
      ).toBe("3");
      // Enzymes group
      const enzymesGroup = result[0].specGroups.find(
        (g) => g.id === "malt-enzymes-group",
      );
      expect(enzymesGroup?.rows[0]?.label).toBe("Diastatic power");
    });

    it("returns [] when response is not an array", async () => {
      mockedRequest.mockResolvedValue(
        null as unknown as Awaited<ReturnType<typeof httpClient.request>>,
      );
      expect(await listMaltsApi()).toEqual([]);
    });

    it("filters DTOs missing id or name", async () => {
      mockedRequest.mockResolvedValue([
        { name: "no-id" },
        { id: "uuid", name: "Munich" },
      ]);
      const result = await listMaltsApi();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Munich");
    });
  });

  describe("getMaltDetailsApi", () => {
    it("returns null when id is empty", async () => {
      expect(await getMaltDetailsApi("")).toBeNull();
      expect(mockedRequest).not.toHaveBeenCalled();
    });

    it("fetches by UUID and maps", async () => {
      mockedRequest.mockResolvedValue({
        id: "uuid",
        name: "Vienna",
        type: "grain",
      });
      const result = await getMaltDetailsApi("uuid");
      expect(mockedRequest).toHaveBeenCalledWith("/catalog/fermentables/uuid");
      expect(result?.name).toBe("Vienna");
    });

    it("returns null on 404, propagates other HttpErrors", async () => {
      mockedRequest.mockRejectedValueOnce(
        new HttpError(404, "Not found", "/catalog/fermentables/missing"),
      );
      expect(await getMaltDetailsApi("missing")).toBeNull();

      mockedRequest.mockRejectedValueOnce(
        new HttpError(500, "Server error", "/catalog/fermentables/abc"),
      );
      await expect(getMaltDetailsApi("abc")).rejects.toThrow(HttpError);
    });
  });
});
