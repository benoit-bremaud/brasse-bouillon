import {
  getHopDetailsApi,
  listHopsApi,
} from "@/features/ingredients/data/hops.api";
import {
  getHopDetails,
  listAlternativeHops,
  listHops,
} from "../hops.use-cases";

import { dataSource } from "@/core/data/data-source";
import { HopProduct } from "@/features/ingredients/domain/hop.types";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/ingredients/data/hops.api", () => ({
  listHopsApi: jest.fn(),
  getHopDetailsApi: jest.fn(),
}));

const mockedListHopsApi = listHopsApi as jest.MockedFunction<
  typeof listHopsApi
>;
const mockedGetHopDetailsApi = getHopDetailsApi as jest.MockedFunction<
  typeof getHopDetailsApi
>;

describe("Hops Use Cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedListHopsApi.mockReset();
    mockedGetHopDetailsApi.mockReset();
  });

  describe("listHops", () => {
    it("should return all hops when no filters are applied", async () => {
      const hops = await listHops();

      expect(hops).toBeDefined();
      expect(Array.isArray(hops)).toBe(true);
      expect(hops.length).toBeGreaterThan(0);
    });

    it("should filter hops by search term", async () => {
      const hops = await listHops({ search: "Citra" });

      expect(hops).toBeDefined();
      expect(hops.some((hop) => hop.name.includes("Citra"))).toBe(true);
    });

    it("should handle string filter as search term", async () => {
      const hops = await listHops("Saaz");

      expect(hops).toBeDefined();
      expect(hops.some((hop) => hop.name.includes("Saaz"))).toBe(true);
    });
  });

  describe("getHopDetails", () => {
    it("should return hop details for valid ID", async () => {
      const hop = await getHopDetails("hop-1");

      expect(hop).toBeDefined();
      expect(hop?.id).toBe("hop-1");
      expect(hop?.name).toBeDefined();
      expect(hop?.specGroups).toBeDefined();
      expect(Array.isArray(hop?.specGroups)).toBe(true);
    });

    it("should return null for invalid ID", async () => {
      const hop = await getHopDetails("invalid-id");

      expect(hop).toBeNull();
    });

    it("should return null for empty ID", async () => {
      const hop = await getHopDetails("");

      expect(hop).toBeNull();
    });

    it("should use live details API when demo data is disabled", async () => {
      dataSource.useDemoData = false;
      mockedGetHopDetailsApi.mockResolvedValue({
        id: "hop-live-1",
        slug: "live-citra",
        name: "Live Citra",
        brand: "Live Hops",
        hopType: "Dual-purpose",
        specGroups: [],
      });

      const hop = await getHopDetails("hop-live-1");

      expect(mockedGetHopDetailsApi).toHaveBeenCalledWith("hop-live-1");
      expect(hop).toMatchObject({ id: "hop-live-1" });
    });
  });

  describe("listAlternativeHops", () => {
    it("should return alternative hops for valid ID", async () => {
      const alternatives = await listAlternativeHops("hop-1");

      expect(alternatives).toBeDefined();
      expect(Array.isArray(alternatives)).toBe(true);
      expect(alternatives.every((alt) => alt.id !== "hop-1")).toBe(true);
    });

    it("should limit results to specified count", async () => {
      const alternatives = await listAlternativeHops("hop-1", 2);

      expect(alternatives.length).toBeLessThanOrEqual(2);
    });

    it("should return empty array for invalid ID", async () => {
      const alternatives = await listAlternativeHops("invalid-id");

      expect(alternatives).toEqual([]);
    });

    it("should return empty array for empty ID", async () => {
      const alternatives = await listAlternativeHops("");

      expect(alternatives).toEqual([]);
    });
  });

  describe("live API mode", () => {
    it("should use live list API when demo data is disabled", async () => {
      dataSource.useDemoData = false;

      const liveHops: HopProduct[] = [
        {
          id: "hop-live-1",
          slug: "live-citra",
          name: "Live Citra",
          brand: "Live Hops",
          hopType: "Dual-purpose",
          specGroups: [
            {
              id: "hop-live-1-analytical",
              title: "Analytical profile",
              rows: [
                {
                  id: "hop-live-1-alpha",
                  label: "Alpha acids",
                  value: "12-14",
                  unit: "%",
                },
              ],
            },
          ],
        },
        {
          id: "hop-live-2",
          slug: "live-saaz",
          name: "Live Saaz",
          brand: "Live Hops",
          hopType: "Noble aroma",
          specGroups: [
            {
              id: "hop-live-2-analytical",
              title: "Analytical profile",
              rows: [
                {
                  id: "hop-live-2-alpha",
                  label: "Alpha acids",
                  value: "3.5-4.5",
                  unit: "%",
                },
              ],
            },
          ],
        },
      ];
      mockedListHopsApi.mockResolvedValue(liveHops);

      const filtered = await listHops({ search: "citra", alphaAcidMin: 12.5 });

      expect(mockedListHopsApi).toHaveBeenCalledTimes(1);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toMatchObject({ id: "hop-live-1" });
    });
  });
});
