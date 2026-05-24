import { brandHeader } from "@/core/theme/layout";
import { spacing } from "@/core/theme/spacing";

describe("brandHeader layout token", () => {
  // Happy path: the documented contract — the padding that clears the
  // transparent header derives from the header height, so the two cannot
  // drift apart.
  it("derives contentClearance from the header height minus one spacing step", () => {
    expect(brandHeader.contentClearance).toBe(brandHeader.height - spacing.xs);
  });

  // Edge: the compact logo must fit inside the bar with room to spare.
  it("keeps the logo smaller than the header height", () => {
    expect(brandHeader.logoSize).toBeLessThan(brandHeader.height);
  });

  // Sad path guard: every dimension must be a positive, finite number so a
  // bad edit (0, NaN, negative) is caught instead of silently breaking layout.
  it("exposes only positive finite dimensions", () => {
    for (const value of Object.values(brandHeader)) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });
});
