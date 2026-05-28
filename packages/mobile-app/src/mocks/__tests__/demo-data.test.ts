import {
  demoEquivalentRecipes,
  demoRecipes,
  demoScanCatalog,
  getDemoEquivalentRecipes,
} from "@/mocks/demo-data";

const PUNK_IPA_BARCODE = "5060277380019";
// DE 0,33L bottle EAN alias for the same beer (Issue #807 — physical
// verification before soutenance blanche).
const PUNK_IPA_BARCODE_DE_ALIAS = "4260649360279";
// UK 0,33L bottle EAN — 3rd physical Punk IPA SKU scanned for the
// 2026-05-27 soutenance. Same beer → same official clone + equivalents.
const PUNK_IPA_BARCODE_UK_ALIAS = "5056025440494";

// Physical bottles scanned for the 2026-05-27 soutenance, identified
// via our OpenFoodFacts client and wired into the demo catalogue so the
// scan flow surfaces a beer card + equivalent recipes offline.
const SCANNED_DEMO_BARCODES_NO_OFFICIAL = [
  "5410769100081", // La Chouffe 0,33L alias
  "5411551300818", // Bush Caractère
  "3770012913076", // À la fût IPA
  "54050051", // Pauwel Kwak
  "5056025475885", // BrewDog Wingman
];

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

    it("keeps non-Punk-IPA bottles free of official flags (matching algo regression guard)", () => {
      // Only the Punk IPA bottle has a per-beer brewer-endorsed
      // clone shipped today (Issue #911 KISS scope). Other bottles
      // intentionally surface only community alternatives until
      // their respective official clones land via #780. Both Punk
      // IPA EAN variants (UK 0,5L + DE 0,33L) are exempt as they
      // route to the same beer (Issue #807).
      const punkIpaBarcodes = new Set([
        PUNK_IPA_BARCODE,
        PUNK_IPA_BARCODE_DE_ALIAS,
        PUNK_IPA_BARCODE_UK_ALIAS,
      ]);
      const otherBarcodes = Object.keys(demoEquivalentRecipes).filter(
        (b) => !punkIpaBarcodes.has(b),
      );
      for (const barcode of otherBarcodes) {
        const matches = getDemoEquivalentRecipes(barcode);
        const officials = matches.filter((m) => m.isOfficial === true);
        expect(officials).toHaveLength(0);
      }
    });
  });

  describe("Punk IPA EAN aliases (Issue #807)", () => {
    it("routes the DE 0,33L EAN to the same matches as the UK 0,5L canonical EAN", () => {
      // The mobile demo flips into demo mode via login trigger
      // credentials (PR #823) — physical bottles brought to the
      // soutenance must scan to the same result regardless of which
      // SKU EAN the jury hands over. This guards against
      // accidentally drifting the alias away from the canonical
      // entry in a future edit.
      const canonical = getDemoEquivalentRecipes(PUNK_IPA_BARCODE);
      const alias = getDemoEquivalentRecipes(PUNK_IPA_BARCODE_DE_ALIAS);
      expect(alias).toEqual(canonical);
      expect(alias).toHaveLength(4);
      expect(alias.find((m) => m.isOfficial === true)?.name).toBe(
        "BrewDog DIY Dog Punk IPA",
      );
    });

    it("routes the UK 0,33L bottle EAN to the same matches as the canonical EAN", () => {
      // 3rd physical Punk IPA SKU scanned for the 2026-05-27 soutenance.
      const canonical = getDemoEquivalentRecipes(PUNK_IPA_BARCODE);
      const alias = getDemoEquivalentRecipes(PUNK_IPA_BARCODE_UK_ALIAS);
      expect(alias).toEqual(canonical);
      expect(alias.find((m) => m.isOfficial === true)?.name).toBe(
        "BrewDog DIY Dog Punk IPA",
      );
    });
  });

  describe("scanned demo bottles (soutenance 2026-05-27)", () => {
    it.each(SCANNED_DEMO_BARCODES_NO_OFFICIAL)(
      "surfaces 3 selectable equivalents and no official clone for %s",
      (barcode) => {
        // These beers carry no official BrewDog DIY Dog clone — the
        // scan flow must still propose 3 community equivalents the user
        // can open, never an empty "🏆 Recette officielle" section.
        const matches = getDemoEquivalentRecipes(barcode);

        expect(matches).toHaveLength(3);
        expect(matches.filter((m) => m.isOfficial === true)).toHaveLength(0);
        matches.forEach((m) => expect(m.recipeId).toBeTruthy());
      },
    );

    it("links every equivalent recipe to a resolvable demoRecipes row", () => {
      // Guards the import CTA: tapping an equivalent must land on a real
      // recipe, not a dangling id.
      const recipeIds = new Set(demoRecipes.map((r) => r.id));

      for (const barcode of SCANNED_DEMO_BARCODES_NO_OFFICIAL) {
        for (const match of getDemoEquivalentRecipes(barcode)) {
          expect(recipeIds.has(match.recipeId)).toBe(true);
        }
      }
    });
  });
});

describe("demoScanCatalog — offline lookup for scanned bottles", () => {
  const ALL_SCANNED_BARCODES = [
    PUNK_IPA_BARCODE_UK_ALIAS,
    ...SCANNED_DEMO_BARCODES_NO_OFFICIAL,
  ];

  it.each(ALL_SCANNED_BARCODES)(
    "resolves %s to a catalogue entry so the demo lookup succeeds offline",
    (barcode) => {
      // demoScanCatalog is the only source the demo-mode lookup reads
      // (no backend). Each scanned bottle must resolve here or the scan
      // shows "not in catalogue".
      const item = demoScanCatalog[barcode];

      expect(item).toBeDefined();
      expect(item.barcode).toBe(barcode);
      expect(item.name.length).toBeGreaterThan(0);
    },
  );

  it("flags IBU and EBC as estimated when they are style-based guesses", () => {
    // notesSource on these entries states IBU/EBC are estimates — the
    // technical-sheet UI badge relies on isIbuEstimated / isColorEbcEstimated.
    const estimatedBottles = [
      "5411551300818", // Bush Caractère
      "3770012913076", // À la fût IPA
      "54050051", // Pauwel Kwak
      "5056025475885", // BrewDog Wingman
    ];

    for (const barcode of estimatedBottles) {
      const item = demoScanCatalog[barcode];
      expect(item.isIbuEstimated).toBe(true);
      expect(item.isColorEbcEstimated).toBe(true);
    }
  });
});
