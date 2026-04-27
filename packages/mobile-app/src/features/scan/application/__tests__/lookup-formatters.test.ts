import {
  abvToStrengthWord,
  ebcToColorWord,
  ibuToBitternessWord,
} from "@/features/scan/application/lookup-formatters";

describe("lookup-formatters", () => {
  describe("ebcToColorWord", () => {
    it.each([
      [0, "Très claire"],
      [3, "Très claire"],
      [6, "Très claire"],
      [7, "Blonde"],
      [10, "Blonde"],
      [11, "Ambrée"],
      [14, "Ambrée"],
      [18, "Ambrée"],
      [19, "Cuivrée"],
      [30, "Cuivrée"],
      [31, "Brune"],
      [45, "Brune"],
      [46, "Brune foncée"],
      [70, "Brune foncée"],
      [81, "Noire"],
      [200, "Noire"],
    ])("returns %s for EBC %d", (ebc, expected) => {
      expect(ebcToColorWord(ebc)).toBe(expected);
    });

    it("returns Inconnu for null", () => {
      expect(ebcToColorWord(null)).toBe("Inconnu");
    });

    it("returns Inconnu for NaN", () => {
      expect(ebcToColorWord(Number.NaN)).toBe("Inconnu");
    });

    it("returns Inconnu for negative input (defensive)", () => {
      expect(ebcToColorWord(-5)).toBe("Inconnu");
    });
  });

  describe("ibuToBitternessWord", () => {
    it.each([
      [0, "Très peu amère"],
      [10, "Très peu amère"],
      [11, "Légèrement amère"],
      [20, "Légèrement amère"],
      [25, "Légèrement amère"],
      [26, "Modérément amère"],
      [35, "Modérément amère"],
      [40, "Modérément amère"],
      [41, "Marquée"],
      [60, "Marquée"],
      [61, "Intense"],
      [90, "Intense"],
      [91, "Extrême"],
      [120, "Extrême"],
    ])("returns %s for IBU %d", (ibu, expected) => {
      expect(ibuToBitternessWord(ibu)).toBe(expected);
    });

    it("returns Inconnu for null", () => {
      expect(ibuToBitternessWord(null)).toBe("Inconnu");
    });

    it("returns Inconnu for NaN", () => {
      expect(ibuToBitternessWord(Number.NaN)).toBe("Inconnu");
    });

    it("returns Inconnu for negative input (defensive)", () => {
      expect(ibuToBitternessWord(-1)).toBe("Inconnu");
    });
  });

  describe("abvToStrengthWord", () => {
    it.each([
      [0, "Sans alcool"],
      [0.4, "Sans alcool"],
      [0.5, "Légère"],
      [3.5, "Légère"],
      [3.6, "De session"],
      [5.4, "De session"],
      [5.5, "De session"],
      [5.6, "Standard"],
      [7.5, "Standard"],
      [7.6, "Forte"],
      [10, "Forte"],
      [10.1, "Très forte"],
      [12.5, "Très forte"],
    ])("returns %s for ABV %s%%", (abv, expected) => {
      expect(abvToStrengthWord(abv)).toBe(expected);
    });

    it("returns Inconnu for null", () => {
      expect(abvToStrengthWord(null)).toBe("Inconnu");
    });

    it("returns Inconnu for NaN", () => {
      expect(abvToStrengthWord(Number.NaN)).toBe("Inconnu");
    });

    it("returns Inconnu for negative input (defensive)", () => {
      expect(abvToStrengthWord(-1)).toBe("Inconnu");
    });
  });
});
