import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import {
    getHopDetails,
    listAlternativeHops,
    listHops,
} from "../hops.use-cases";

import { dataSource } from "@/core/data/data-source";

describe("Hops Use Cases", () => {
  let originalUseDemoData: boolean;

  beforeEach(() => {
    originalUseDemoData = dataSource.useDemoData;
    dataSource.useDemoData = true;
  });

  afterEach(() => {
    dataSource.useDemoData = originalUseDemoData;
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
});
