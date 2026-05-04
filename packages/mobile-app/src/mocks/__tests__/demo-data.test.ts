import {
  demoEquivalentRecipes,
  demoRecipes,
  getDemoEquivalentRecipes,
} from "@/mocks/demo-data";

const PUNK_IPA_BARCODE = "5060277380019";

describe("demoEquivalentRecipes (Issue #911)", () => {
  describe("Punk IPA — 🏆 Recette officielle + 🧪 Équivalentes split", () => {
    it("returns the official BrewDog DIY Dog clone above 3 community alternatives", () => {
      const matches = getDemoEquivalentRecipes(PUNK_IPA_BARCODE);

      // The audit on 2026-05-04 caught that the section "🏆 Recette
      // officielle" was always empty because no demo entry carried
      // `isOfficial: true`. This guards against regressing into that
      // state — Beat 4 of the 90s soutenance demo script depends on
      // exactly one official + 3 community alternatives.
      expect(matches).toHaveLength(4);
      const officials = matches.filter((m) => m.isOfficial === true);
      expect(officials).toHaveLength(1);
      expect(officials[0].name).toBe("BrewDog DIY Dog Punk IPA");
      expect(officials[0].brewer).toBe("BrewDog");
      const equivalents = matches.filter((m) => m.isOfficial !== true);
      expect(equivalents).toHaveLength(3);
    });

    it("links the official entry to a resolvable demoRecipes row so the import flow lands a real recipe", () => {
      const matches = getDemoEquivalentRecipes(PUNK_IPA_BARCODE);
      const official = matches.find((m) => m.isOfficial === true);

      expect(official).toBeDefined();
      const recipe = demoRecipes.find((r) => r.id === official?.recipeId);
      expect(recipe).toBeDefined();
      expect(recipe?.name).toBe("BrewDog DIY Dog Punk IPA");
    });

    it("references the public seed UUID so backend-mode import resolves the same recipe", () => {
      const matches = getDemoEquivalentRecipes(PUNK_IPA_BARCODE);
      const official = matches.find((m) => m.isOfficial === true);

      // The backend seed `public-recipes.seed.ts` reserves the
      // `...000b` slot for the official BrewDog DIY Dog entry.
      expect(official?.publicRecipeId).toBe(
        "00000000-0000-4000-8000-00000000000b",
      );
    });
  });

  describe("other barcodes", () => {
    it("returns an empty array for an unknown barcode (sad path of the matching algorithm)", () => {
      expect(getDemoEquivalentRecipes("0000000000000")).toEqual([]);
    });

    it("keeps the non-Punk-IPA entries free of official flags (matching algo regression guard)", () => {
      // Only the Punk IPA bottle has a per-beer brewer-endorsed
      // clone shipped today (Issue #911 KISS scope). Other bottles
      // intentionally surface only community alternatives until
      // their respective official clones land via #780.
      const otherBarcodes = Object.keys(demoEquivalentRecipes).filter(
        (b) => b !== PUNK_IPA_BARCODE,
      );
      for (const barcode of otherBarcodes) {
        const matches = getDemoEquivalentRecipes(barcode);
        const officials = matches.filter((m) => m.isOfficial === true);
        expect(officials).toHaveLength(0);
      }
    });
  });
});
