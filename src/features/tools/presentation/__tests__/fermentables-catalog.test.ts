import { fermentableMaltCatalog, getMaltById } from "@/features/tools/data";

describe("fermentables-catalog", () => {
  it("exports a non-empty catalog of fermentable malts", () => {
    expect(fermentableMaltCatalog).toBeDefined();
    expect(fermentableMaltCatalog.length).toBeGreaterThan(0);
  });

  it("has malts with required properties", () => {
    fermentableMaltCatalog.forEach((malt) => {
      expect(malt).toHaveProperty("id");
      expect(malt).toHaveProperty("name");
      expect(malt).toHaveProperty("ppg");
      expect(malt).toHaveProperty("efm");

      expect(typeof malt.id).toBe("string");
      expect(typeof malt.name).toBe("string");
      expect(typeof malt.ppg).toBe("number");
      expect(typeof malt.efm).toBe("number");

      expect(malt.id.length).toBeGreaterThan(0);
      expect(malt.name.length).toBeGreaterThan(0);
      expect(malt.ppg).toBeGreaterThan(0);
      expect(malt.efm).toBeGreaterThan(0);
    });
  });

  it("has reasonable PPG values for malts", () => {
    fermentableMaltCatalog.forEach((malt) => {
      // PPG should be between 20-50 for most malts/sugars
      expect(malt.ppg).toBeGreaterThanOrEqual(20);
      expect(malt.ppg).toBeLessThanOrEqual(50);
    });
  });

  it("has reasonable EFM values for malts", () => {
    fermentableMaltCatalog.forEach((malt) => {
      // EFM should be between 50-100% for most fermentables
      expect(malt.efm).toBeGreaterThanOrEqual(50);
      expect(malt.efm).toBeLessThanOrEqual(100);
    });
  });

  it("has unique IDs for all malts", () => {
    const ids = fermentableMaltCatalog.map((malt) => malt.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it("includes common base malts", () => {
    const maltNames = fermentableMaltCatalog.map((malt) =>
      malt.name.toLowerCase(),
    );

    // Should include basic brewing malts
    expect(maltNames.some((name) => name.includes("pilsner"))).toBe(true);
    expect(maltNames.some((name) => name.includes("pale"))).toBe(true);
    expect(maltNames.some((name) => name.includes("munich"))).toBe(true);
  });

  describe("getMaltById", () => {
    it("returns the correct malt for valid ID", () => {
      const firstMalt = fermentableMaltCatalog[0];
      const foundMalt = getMaltById(firstMalt.id);

      expect(foundMalt).toEqual(firstMalt);
    });

    it("returns undefined for invalid ID", () => {
      const foundMalt = getMaltById("non-existent-id");

      expect(foundMalt).toBeUndefined();
    });

    it("returns undefined for empty ID", () => {
      const foundMalt = getMaltById("");

      expect(foundMalt).toBeUndefined();
    });

    it("works with all catalog IDs", () => {
      fermentableMaltCatalog.forEach((malt) => {
        const foundMalt = getMaltById(malt.id);
        expect(foundMalt).toEqual(malt);
      });
    });
  });

  it("has expected catalog structure with known malts", () => {
    // Verify some specific malts exist with expected values
    const pilsner = getMaltById("pilsner");
    expect(pilsner).toBeDefined();
    expect(pilsner?.name).toBe("Pilsner");
    expect(pilsner?.ppg).toBe(37.5);
    expect(pilsner?.efm).toBe(82);

    const munich = getMaltById("munich");
    expect(munich).toBeDefined();
    expect(munich?.name).toBe("Munich");

    const dextrose = getMaltById("dextrose");
    expect(dextrose).toBeDefined();
    expect(dextrose?.efm).toBe(100); // Simple sugar should have 100% EFM
  });
});
