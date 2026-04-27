import { colors } from "@/core/theme";
import {
  ebcToHex,
  foregroundOnEbc,
} from "@/features/scan/application/lookup-color";

describe("lookup-color", () => {
  describe("ebcToHex", () => {
    it("returns a hex string for known EBC values", () => {
      const result = ebcToHex(14);
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    it("snaps to the nearest palette stop (Punk IPA EBC 14 -> amber)", () => {
      // EBC 14 sits between stops 12 and 16; 14 is closer to 12 by 2
      // vs 16 by 2 — tie broken by first-seen, so the loop returns
      // the first match. The exact stop is implementation detail
      // — what matters is the hex is in the amber band.
      const hex = ebcToHex(14);
      expect(hex).toMatch(/^#(C1|D5)/i);
    });

    it("returns a darker hex for higher EBC (Rochefort 10 EBC 70)", () => {
      const lightHex = ebcToHex(8);
      const darkHex = ebcToHex(70);
      // crude darkness check: parse R component from #RRGGBB
      const lightR = parseInt(lightHex.slice(1, 3), 16);
      const darkR = parseInt(darkHex.slice(1, 3), 16);
      expect(darkR).toBeLessThan(lightR);
    });

    it("returns the brand primary token when EBC is null", () => {
      expect(ebcToHex(null)).toBe(colors.brand.primary);
    });

    it("returns the brand primary token when EBC is NaN", () => {
      expect(ebcToHex(Number.NaN)).toBe(colors.brand.primary);
    });

    it("returns the brand primary token when EBC is negative (defensive)", () => {
      expect(ebcToHex(-5)).toBe(colors.brand.primary);
    });

    it("clamps very high EBC values to the darkest stop", () => {
      const hex = ebcToHex(999);
      expect(hex).toBe("#26110A");
    });
  });

  describe("foregroundOnEbc", () => {
    it("returns the dark text token for pale beers (EBC <= 18)", () => {
      expect(foregroundOnEbc(8)).toBe(colors.neutral.textPrimary);
      expect(foregroundOnEbc(18)).toBe(colors.neutral.textPrimary);
    });

    it("returns the white token for amber-and-darker beers (EBC > 18)", () => {
      expect(foregroundOnEbc(19)).toBe(colors.neutral.white);
      expect(foregroundOnEbc(70)).toBe(colors.neutral.white);
    });

    it("returns the white token when EBC is null (fallback hero is brand brown)", () => {
      expect(foregroundOnEbc(null)).toBe(colors.neutral.white);
    });

    it("returns the white token on NaN or negative input (defensive)", () => {
      expect(foregroundOnEbc(Number.NaN)).toBe(colors.neutral.white);
      expect(foregroundOnEbc(-1)).toBe(colors.neutral.white);
    });
  });
});
