/**
 * Tests for the hops catalogue api consumer (Issue #887).
 * Guards the DTO → HopProduct mapping (specGroups built from
 * flat catalog fields) that the picker UX relies on.
 */

import * as httpClient from "@/core/http/http-client";

import {
  getHopDetailsApi,
  listHopsApi,
} from "@/features/ingredients/data/hops.api";

import { HttpError } from "@/core/http/http-error";

jest.mock("@/core/http/http-client");

const mockedRequest = httpClient.request as jest.MockedFunction<
  typeof httpClient.request
>;

describe("hops.api", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  describe("listHopsApi", () => {
    // Happy path
    it("maps a full catalog DTO + builds Acids & Format specGroups", async () => {
      mockedRequest.mockResolvedValue([
        {
          id: "00000000-0000-4000-9000-000000000000",
          name: "Citra",
          origin: "United States",
          alpha_acid_typical: 12,
          beta_acid_typical: 4,
          hop_stability_index: 30,
          usage_type: "aroma",
          form: "pellet",
          notes: "Tropical fruit notes.",
          producer_id: null,
        },
      ]);

      const result = await listHopsApi();

      expect(mockedRequest).toHaveBeenCalledWith("/catalog/hops");
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "00000000-0000-4000-9000-000000000000",
        name: "Citra",
        originCountry: "United States",
        hopType: "aroma",
        description: "Tropical fruit notes.",
      });
      // Acids & stability group
      const acidsGroup = result[0].specGroups.find(
        (g) => g.id === "hop-acids-group",
      );
      expect(acidsGroup).toBeDefined();
      expect(acidsGroup?.rows.find((r) => r.label === "Alpha")?.value).toBe(
        "12",
      );
      // Format group
      const formatGroup = result[0].specGroups.find(
        (g) => g.id === "hop-format-group",
      );
      expect(formatGroup?.rows[0]?.value).toBe("pellet");
    });

    // Sad path
    it("returns [] when response is not an array", async () => {
      mockedRequest.mockResolvedValue(
        null as unknown as Awaited<ReturnType<typeof httpClient.request>>,
      );
      expect(await listHopsApi()).toEqual([]);
    });

    // Edge — missing required fields filtered out
    it("filters DTOs missing id or name", async () => {
      mockedRequest.mockResolvedValue([
        { name: "no-id" },
        { id: "abc" },
        { id: "uuid", name: "Cascade" },
      ]);
      const result = await listHopsApi();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Cascade");
    });
  });

  describe("getHopDetailsApi", () => {
    it("returns null when id is empty", async () => {
      expect(await getHopDetailsApi("")).toBeNull();
      expect(mockedRequest).not.toHaveBeenCalled();
    });

    it("fetches by UUID and maps", async () => {
      mockedRequest.mockResolvedValue({
        id: "uuid",
        name: "Saaz",
        usage_type: "aroma",
      });
      const result = await getHopDetailsApi("uuid");
      expect(mockedRequest).toHaveBeenCalledWith("/catalog/hops/uuid");
      expect(result?.name).toBe("Saaz");
    });

    it("returns null on 404, propagates other HttpErrors", async () => {
      mockedRequest.mockRejectedValueOnce(
        new HttpError(404, "Not found", "/catalog/hops/missing"),
      );
      expect(await getHopDetailsApi("missing")).toBeNull();

      mockedRequest.mockRejectedValueOnce(
        new HttpError(500, "Server error", "/catalog/hops/abc"),
      );
      await expect(getHopDetailsApi("abc")).rejects.toThrow(HttpError);
    });
  });
});
