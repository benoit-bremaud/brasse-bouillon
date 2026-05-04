import { parseGlossaryTerms } from "@/core/text/glossary-auto-linker";
import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

const ENTRIES: ReadonlyArray<GlossaryEntry> = [
  {
    term: "mash",
    displayLabel: "Empâtage",
    definition: "Étape de brassage.",
    category: "brewing-process",
    aliases: ["empâtage", "mashing"],
  },
  {
    term: "hop",
    displayLabel: "Houblon",
    definition: "Fleur.",
    category: "ingredient",
    aliases: ["houblon"],
  },
  {
    term: "dry hop",
    displayLabel: "Houblonnage à cru",
    definition: "Ajout post-fermentation.",
    category: "brewing-process",
  },
  {
    term: "ipa",
    displayLabel: "IPA",
    definition: "India Pale Ale.",
    category: "style",
  },
];

describe("parseGlossaryTerms (Issue #783)", () => {
  it("happy: returns [] for empty text", () => {
    expect(parseGlossaryTerms("", ENTRIES)).toEqual([]);
  });

  it("happy: returns a single text node when no glossary term matches", () => {
    const result = parseGlossaryTerms(
      "juste du texte sans terme connu",
      ENTRIES,
    );
    expect(result).toEqual([
      { type: "text", value: "juste du texte sans terme connu" },
    ]);
  });

  it("happy: detects a single canonical term in the middle of a sentence", () => {
    const result = parseGlossaryTerms("On lance le mash à 65°C.", ENTRIES);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: "text", value: "On lance le " });
    expect(result[1].type).toBe("term");
    if (result[1].type === "term") {
      expect(result[1].value).toBe("mash");
      expect(result[1].entry.displayLabel).toBe("Empâtage");
    }
    expect(result[2]).toEqual({ type: "text", value: " à 65°C." });
  });

  it("happy: detects a term at the very start of the string", () => {
    const result = parseGlossaryTerms("Mash 60min puis sparge.", ENTRIES);
    expect(result[0].type).toBe("term");
    if (result[0].type === "term") {
      // Original casing is preserved.
      expect(result[0].value).toBe("Mash");
      expect(result[0].entry.term).toBe("mash");
    }
  });

  it("happy: detects a term at the very end of the string", () => {
    const result = parseGlossaryTerms("On finit par un dry hop", ENTRIES);
    const last = result[result.length - 1];
    expect(last.type).toBe("term");
    if (last.type === "term") {
      expect(last.value).toBe("dry hop");
    }
  });

  it("happy: resolves an alias to the canonical entry (FR variants)", () => {
    const result = parseGlossaryTerms("L'empâtage dure 60 minutes.", ENTRIES);
    const termNode = result.find((node) => node.type === "term");
    expect(termNode?.type).toBe("term");
    if (termNode?.type === "term") {
      // The surface is the alias as it appeared in the text.
      expect(termNode.value).toBe("empâtage");
      // But the entry it resolves to is the canonical mash.
      expect(termNode.entry.term).toBe("mash");
    }
  });

  it("edge: case-insensitive matching preserves the original casing in the node", () => {
    const result = parseGlossaryTerms("MASH puis Mash puis mash.", ENTRIES);
    const termNodes = result.filter((node) => node.type === "term");
    expect(termNodes).toHaveLength(3);
    if (termNodes[0].type === "term") expect(termNodes[0].value).toBe("MASH");
    if (termNodes[1].type === "term") expect(termNodes[1].value).toBe("Mash");
    if (termNodes[2].type === "term") expect(termNodes[2].value).toBe("mash");
    // All three resolve to the same entry.
    for (const node of termNodes) {
      if (node.type === "term") {
        expect(node.entry.displayLabel).toBe("Empâtage");
      }
    }
  });

  it("edge: longer multi-word surfaces win over single-word substrings (dry hop > hop)", () => {
    const result = parseGlossaryTerms("Le dry hop est un hop tardif.", ENTRIES);
    const termNodes = result.filter((node) => node.type === "term");
    expect(termNodes).toHaveLength(2);
    if (termNodes[0].type === "term") {
      expect(termNodes[0].value).toBe("dry hop");
      expect(termNodes[0].entry.term).toBe("dry hop");
    }
    if (termNodes[1].type === "term") {
      expect(termNodes[1].value).toBe("hop");
      expect(termNodes[1].entry.term).toBe("hop");
    }
  });

  it("edge: enforces word boundaries (`mashing` must not light up as `mash`)", () => {
    // "mashing" is itself a known alias of `mash`, so it lights up
    // — but the surrounding text must not bleed in. Test guards
    // against the bug where a regex-based naive matcher would
    // include the trailing "ing".
    const result = parseGlossaryTerms("Le mashing dure 60min.", ENTRIES);
    const termNode = result.find((node) => node.type === "term");
    expect(termNode?.type).toBe("term");
    if (termNode?.type === "term") {
      expect(termNode.value).toBe("mashing");
    }
  });

  it("edge: rejects substring matches that are not at word boundaries", () => {
    // "moppy" contains "hop" as a substring but is not a standalone
    // word — must not be wrapped.
    const result = parseGlossaryTerms("This is hopelessly broken.", ENTRIES);
    const termNodes = result.filter((node) => node.type === "term");
    expect(termNodes).toHaveLength(0);
  });

  it("edge: handles accented surfaces correctly (Unicode word boundaries)", () => {
    // "L'empâtage" — the apostrophe before is a non-letter so it's
    // a valid boundary; the trailing space is also a valid boundary.
    const result = parseGlossaryTerms("L'empâtage commence.", ENTRIES);
    const termNode = result.find((node) => node.type === "term");
    expect(termNode?.type).toBe("term");
    if (termNode?.type === "term") {
      expect(termNode.value).toBe("empâtage");
    }
  });

  it("edge: empty entries array short-circuits to a single text node", () => {
    const result = parseGlossaryTerms("On lance le mash.", []);
    expect(result).toEqual([{ type: "text", value: "On lance le mash." }]);
  });
});
