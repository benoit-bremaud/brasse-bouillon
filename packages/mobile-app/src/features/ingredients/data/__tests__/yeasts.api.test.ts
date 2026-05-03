/**
 * Tests for the yeasts catalogue api consumer (Issue #887).
 * Guards the DTO → YeastProduct mapping post Issue #904
 * (laboratory column dropped, product_id renamed to
 * product_code, producer_id is now the sole producer FK).
 */

import * as httpClient from "@/core/http/http-client";

import {
  getYeastDetailsApi,
  listYeastsApi,
} from "@/features/ingredients/data/yeasts.api";

import { HttpError } from "@/core/http/http-error";

jest.mock("@/core/http/http-client");

const mockedRequest = httpClient.request as jest.MockedFunction<
  typeof httpClient.request
>;

describe("yeasts.api", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  describe("listYeastsApi", () => {
    it("maps a full catalog DTO + builds Fermentation & Product specGroups", async () => {
      mockedRequest.mockResolvedValue([
        {
          id: "uuid-us05",
          name: "Safale US-05",
          type: "ale",
          form: "dry",
          product_code: "US-05",
          min_temperature_c: 15,
          max_temperature_c: 22,
          flocculation: "medium",
          attenuation_percent_typical: 78,
          notes: "American ale yeast.",
          producer_id: "uuid-fermentis",
        },
      ]);

      const result = await listYeastsApi();

      expect(mockedRequest).toHaveBeenCalledWith("/catalog/yeasts");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "uuid-us05",
        name: "Safale US-05",
        yeastType: "ale",
        description: "American ale yeast.",
      });
      // Fermentation group with Temperature + Attenuation rows
      const fermentationGroup = result[0].specGroups.find(
        (g) => g.id === "yeast-fermentation-group",
      );
      expect(
        fermentationGroup?.rows.find((r) => r.label === "Temperature")?.value,
      ).toBe("15-22");
      expect(
        fermentationGroup?.rows.find((r) => r.label === "Attenuation")?.value,
      ).toBe("78");
      // Product group with product_code (NOT product_id post #904)
      const productGroup = result[0].specGroups.find(
        (g) => g.id === "yeast-product-group",
      );
      expect(
        productGroup?.rows.find((r) => r.label === "Product code")?.value,
      ).toBe("US-05");
    });

    it("handles temperature with only one bound (min OR max alone)", async () => {
      mockedRequest.mockResolvedValue([
        {
          id: "uuid",
          name: "Half-temp yeast",
          type: "ale",
          min_temperature_c: 18,
          max_temperature_c: null,
        },
      ]);
      const result = await listYeastsApi();
      const tempRow = result[0].specGroups
        .find((g) => g.id === "yeast-fermentation-group")
        ?.rows.find((r) => r.label === "Temperature");
      expect(tempRow?.value).toBe("18");
    });

    it("returns [] when response is not an array", async () => {
      mockedRequest.mockResolvedValue(
        null as unknown as Awaited<ReturnType<typeof httpClient.request>>,
      );
      expect(await listYeastsApi()).toEqual([]);
    });

    it("filters DTOs missing id or name", async () => {
      mockedRequest.mockResolvedValue([
        { name: "no-id" },
        { id: "uuid", name: "WLP002" },
      ]);
      const result = await listYeastsApi();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("WLP002");
    });
  });

  describe("getYeastDetailsApi", () => {
    it("returns null when id is empty", async () => {
      expect(await getYeastDetailsApi("")).toBeNull();
      expect(mockedRequest).not.toHaveBeenCalled();
    });

    it("fetches by UUID and maps", async () => {
      mockedRequest.mockResolvedValue({
        id: "uuid",
        name: "S-04",
        type: "ale",
      });
      const result = await getYeastDetailsApi("uuid");
      expect(mockedRequest).toHaveBeenCalledWith("/catalog/yeasts/uuid");
      expect(result?.name).toBe("S-04");
    });

    it("returns null on 404, propagates other HttpErrors", async () => {
      mockedRequest.mockRejectedValueOnce(
        new HttpError(404, "Not found", "/catalog/yeasts/missing"),
      );
      expect(await getYeastDetailsApi("missing")).toBeNull();

      mockedRequest.mockRejectedValueOnce(
        new HttpError(500, "Server error", "/catalog/yeasts/abc"),
      );
      await expect(getYeastDetailsApi("abc")).rejects.toThrow(HttpError);
    });
  });
});
