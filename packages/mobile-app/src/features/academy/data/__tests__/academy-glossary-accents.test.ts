import { academyCorpus } from "../generated/academy-corpus.generated";
import type { GlossaryTerm } from "../../domain";

function findGlossaryTerm(slug: string): GlossaryTerm {
  const term = academyCorpus.glossaryTerms.find((entry) => entry.slug === slug);

  if (!term) {
    throw new Error(`Glossary term not found in corpus: ${slug}`);
  }

  return term;
}

/**
 * Guards the Academy glossary against accent-stripped French. The user-facing
 * copy must carry correct accents (the article prose does), so the glossary it
 * links to must match. Each row asserts the accented form is present AND the
 * accent-less form is absent, on a representative sample of pre-existing and
 * history terms.
 */
const ACCENT_EXPECTATIONS: ReadonlyArray<{
  readonly slug: string;
  readonly field: "shortDefinition" | "detailedDefinition";
  readonly expected: string;
  readonly forbidden: string;
}> = [
  {
    slug: "ibu",
    field: "shortDefinition",
    expected: "utilisée dans les recettes de bière",
    forbidden: "utilisee dans les recettes de biere",
  },
  {
    slug: "malt",
    field: "shortDefinition",
    expected: "Céréale germée puis séchée",
    forbidden: "Cereale germee puis sechee",
  },
  {
    slug: "srm",
    field: "shortDefinition",
    expected: "Échelle américaine",
    forbidden: "Echelle americaine",
  },
  {
    slug: "empatage",
    field: "shortDefinition",
    expected: "grains concassés sont mélangés à l'eau",
    forbidden: "grains concasses sont melanges a l'eau",
  },
  {
    slug: "reinheitsgebot",
    field: "shortDefinition",
    expected: "Réglementation bavaroise",
    forbidden: "Reglementation bavaroise",
  },
  {
    slug: "reinheitsgebot",
    field: "detailedDefinition",
    expected: "contrôle du marché",
    forbidden: "controle du marche",
  },
  {
    slug: "lager",
    field: "detailedDefinition",
    expected: "maîtrise de la levure",
    forbidden: "maitrise de la levure",
  },
  {
    slug: "bappir",
    field: "shortDefinition",
    expected: "Préparation céréalière mésopotamienne",
    forbidden: "Preparation cerealiere mesopotamienne",
  },
  {
    slug: "cervoise",
    field: "shortDefinition",
    expected: "Boisson fermentée à base de céréales",
    forbidden: "Boisson fermentee a base de cereales",
  },
  {
    slug: "gruit",
    field: "shortDefinition",
    expected: "Mélange de plantes aromatiques utilisé",
    forbidden: "Melange de plantes aromatiques utilise",
  },
];

describe("Academy glossary — French accents", () => {
  it.each(ACCENT_EXPECTATIONS)(
    "keeps $slug.$field correctly accented",
    ({ slug, field, expected, forbidden }) => {
      const definition = findGlossaryTerm(slug)[field];

      expect(definition).toContain(expected);
      expect(definition).not.toContain(forbidden);
    },
  );
});
