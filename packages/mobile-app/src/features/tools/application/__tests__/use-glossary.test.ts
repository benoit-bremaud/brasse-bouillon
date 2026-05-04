import {
  buildGlossaryReturn,
  useGlossary,
} from "@/features/tools/application/use-glossary";
import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";
import { renderHook } from "@testing-library/react-native";

const ENTRY_MASH: GlossaryEntry = {
  term: "mash",
  displayLabel: "Empâtage",
  definition: "Étape de brassage où l'on mélange le malt avec l'eau chaude.",
  category: "brewing-process",
  aliases: ["empâtage", "mashing"],
};

const ENTRY_HOP: GlossaryEntry = {
  term: "hop",
  displayLabel: "Houblon",
  definition: "Fleur de Humulus lupulus.",
  category: "ingredient",
  aliases: ["houblon"],
};

const ENTRY_DRY_HOP: GlossaryEntry = {
  term: "dry hop",
  displayLabel: "Houblonnage à cru",
  definition: "Ajout de houblons aromatiques après la fermentation primaire.",
  category: "brewing-process",
  aliases: ["houblonnage à cru"],
};

describe("buildGlossaryReturn (Issue #783)", () => {
  it("happy: indexes entries by canonical term and resolves them via getByTerm", () => {
    const result = buildGlossaryReturn([ENTRY_MASH, ENTRY_HOP]);

    expect(result.entries.size).toBe(2);
    expect(result.getByTerm("mash")).toBe(ENTRY_MASH);
    expect(result.getByTerm("hop")).toBe(ENTRY_HOP);
    expect(result.isReady).toBe(true);
  });

  it("happy: resolves by alias too (FR + EN variants)", () => {
    const result = buildGlossaryReturn([ENTRY_MASH]);

    expect(result.getByTerm("empâtage")).toBe(ENTRY_MASH);
    expect(result.getByTerm("mashing")).toBe(ENTRY_MASH);
  });

  it("happy: lookup is case-insensitive on both canonical and alias", () => {
    const result = buildGlossaryReturn([ENTRY_MASH]);

    expect(result.getByTerm("MASH")).toBe(ENTRY_MASH);
    expect(result.getByTerm("Mash")).toBe(ENTRY_MASH);
    expect(result.getByTerm("EMPÂTAGE")).toBe(ENTRY_MASH);
  });

  it("sad: getByTerm returns undefined for unknown terms", () => {
    const result = buildGlossaryReturn([ENTRY_MASH]);

    expect(result.getByTerm("unknown-term")).toBeUndefined();
    expect(result.getByTerm("")).toBeUndefined();
  });

  it("edge: allMatchableTerms is ordered by descending length so multi-word wins over single-word", () => {
    const result = buildGlossaryReturn([ENTRY_HOP, ENTRY_DRY_HOP]);

    // Both entries plus their aliases, sorted by length desc.
    // "houblonnage à cru" (17) > "dry hop" (7) > "houblon" (7) > "hop" (3)
    const lengths = result.allMatchableTerms.map((term) => term.length);
    const sortedDesc = [...lengths].sort((a, b) => b - a);
    expect(lengths).toEqual(sortedDesc);
    // Ensure "dry hop" appears before "hop" specifically.
    const dryHopIndex = result.allMatchableTerms.indexOf("dry hop");
    const hopIndex = result.allMatchableTerms.indexOf("hop");
    expect(dryHopIndex).toBeLessThan(hopIndex);
  });
});

describe("useGlossary (Issue #783)", () => {
  it("happy: exposes the static glossary const through the hook with a non-empty entries map", () => {
    const { result } = renderHook(() => useGlossary());

    // The static glossary ships ~35 entries — assert a floor instead
    // of a strict count so adding terms doesn't break the test.
    expect(result.current.entries.size).toBeGreaterThanOrEqual(30);
    expect(result.current.isReady).toBe(true);
    // Sanity: a known canonical term resolves.
    expect(result.current.getByTerm("mash")?.displayLabel).toBe("Empâtage");
  });
});
