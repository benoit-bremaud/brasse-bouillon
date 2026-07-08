import { listPublishedAcademyArticles } from "../../../domain";
import {
  AcademySourceArticle,
  AcademySourceCorpus,
  validateAcademySourceCorpus,
} from "../";

const sources = [
  {
    id: "palmer-2017",
    kind: "book",
    title: "How to Brew",
    authors: ["John J. Palmer"],
    publisher: "Brewers Publications",
    url: "https://www.howtobrew.com/",
    accessed_at: "2026-07-03",
    year: 2017,
    notes: "General homebrewing reference.",
  },
  {
    id: "bjcp-2021",
    kind: "standard",
    title: "BJCP Beer Style Guidelines",
    authors: ["Beer Judge Certification Program"],
    publisher: "BJCP",
    url: "https://www.bjcp.org/bjcp-style-guidelines/",
    accessed_at: "2026-07-03",
    year: 2021,
    notes: "Style and sensory reference.",
  },
] as const;

const glossaryTerms = [
  {
    slug: "ibu",
    label: "IBU",
    aliases: ["International Bitterness Units"],
    short_definition: "Bitterness estimate used for beer recipes.",
    detailed_definition:
      "IBU expresses the estimated concentration of bittering compounds from hops in beer.",
    related_terms: ["acide-alpha"],
    source_ids: ["palmer-2017"],
  },
  {
    slug: "acide-alpha",
    label: "Acide alpha",
    aliases: ["alpha acid"],
    short_definition: "Hop resin contributing to beer bitterness.",
    detailed_definition:
      "Alpha acids are hop compounds that isomerize during boiling and contribute bitterness.",
    related_terms: ["ibu"],
    source_ids: ["palmer-2017"],
  },
] as const;

const houblonsArticle: AcademySourceArticle = {
  filePath: "docs/academy/ingredients/houblons.md",
  slug: "houblons",
  frontMatter: {
    title: "Houblons",
    summary: "Reference guide for hop roles in brewing.",
    category: "ingredients",
    level: "beginner",
    status: "published",
    version: "1.0.0",
    estimated_read_time_minutes: 6,
    tags: ["ingredients", "bitterness", "aroma"],
    updated_at: "2026-07-03",
    related_articles: ["levures"],
    related_glossary_terms: ["ibu", "acide-alpha"],
    related_calculators: [
      {
        slug: "houblons",
        label: "Hop calculator",
        reason: "Estimate bitterness from hop additions.",
        target_slug: "houblons",
      },
    ],
    learning_objectives: ["Identify the main brewing roles of hops."],
    prerequisites: [],
    teaches: ["hop-bitterness", "hop-aroma"],
    sensitive: false,
    risk_topics: [],
    source_ids: ["palmer-2017"],
    review: {
      confidence_level: "reviewed",
      reviewed_by: "Academy editorial review",
      reviewed_at: "2026-07-03",
      notes: ["Initial pilot article review."],
    },
  },
  sections: [
    {
      id: "role-du-houblon",
      title: "Role du houblon",
      blocks: [
        {
          id: "role-intro",
          type: "paragraph",
          text: "Hops bring bitterness, aroma, flavor, and some preservative effects.",
          sourceIds: ["palmer-2017"],
        },
        {
          id: "ibu-reference",
          type: "glossaryReference",
          termSlug: "ibu",
          label: "IBU",
          sourceIds: ["palmer-2017"],
        },
      ],
    },
  ],
};

const levuresArticle: AcademySourceArticle = {
  filePath: "docs/academy/ingredients/levures.md",
  slug: "levures",
  frontMatter: {
    title: "Levures et fermentation",
    summary: "Reference guide for fermentation vocabulary.",
    category: "fermentation",
    level: "beginner",
    status: "draft",
    version: "0.1.0",
    estimated_read_time_minutes: 5,
    tags: ["fermentation", "yeast"],
    updated_at: "2026-07-03",
    related_articles: ["houblons"],
    related_glossary_terms: [],
    related_calculators: [],
    learning_objectives: ["Explain what yeast changes during fermentation."],
    prerequisites: [],
    teaches: ["fermentation-basics"],
    sensitive: false,
    risk_topics: [],
    source_ids: ["palmer-2017"],
    review: null,
  },
  sections: [
    {
      id: "fermentation",
      title: "Fermentation",
      blocks: [
        {
          id: "fermentation-intro",
          type: "paragraph",
          text: "Yeast transforms wort sugars into alcohol, carbon dioxide, and aroma compounds.",
          sourceIds: ["palmer-2017"],
        },
      ],
    },
  ],
};

function makeSourceCorpus(
  articles: readonly AcademySourceArticle[] = [houblonsArticle, levuresArticle],
): AcademySourceCorpus {
  return {
    articles,
    glossaryTerms,
    sources,
    calculatorSlugs: ["houblons", "levures", "eau"],
  };
}

describe("Academy source validation", () => {
  it("hydrates editorial source files into a valid domain corpus", () => {
    const result = validateAcademySourceCorpus(makeSourceCorpus());

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
    expect(result.corpus?.articles[0]?.metadata.sources[0]?.id).toBe(
      "palmer-2017",
    );
    expect(result.corpus?.articles[0]?.metadata.estimatedReadTimeMinutes).toBe(
      6,
    );
  });

  it("rejects source ids missing from the editorial registry", () => {
    const invalidArticle: AcademySourceArticle = {
      ...houblonsArticle,
      frontMatter: {
        ...houblonsArticle.frontMatter,
        source_ids: ["missing-source"],
      },
    };

    const result = validateAcademySourceCorpus(
      makeSourceCorpus([invalidArticle, levuresArticle]),
    );

    expect(result.valid).toBe(false);
    expect(result.corpus).toBeNull();
    expect(result.issues.map((issue) => issue.code)).toContain(
      "academySource.source.unknown",
    );
  });

  it("rejects article slugs that drift from their Markdown file name", () => {
    const invalidArticle: AcademySourceArticle = {
      ...houblonsArticle,
      slug: "wrong-slug",
    };

    const result = validateAcademySourceCorpus(
      makeSourceCorpus([invalidArticle, levuresArticle]),
    );

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "academySource.articleSlug.filePathMismatch",
    );
  });

  it("keeps published sensitive source content behind review metadata", () => {
    const sensitiveArticle: AcademySourceArticle = {
      ...houblonsArticle,
      frontMatter: {
        ...houblonsArticle.frontMatter,
        sensitive: true,
        risk_topics: ["sanitation"],
        review: null,
      },
    };

    const result = validateAcademySourceCorpus(
      makeSourceCorpus([sensitiveArticle, levuresArticle]),
    );

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "article.publishedSensitive.review.required",
    );
  });

  it("keeps draft source articles out of the published article list", () => {
    const result = validateAcademySourceCorpus(makeSourceCorpus());

    expect(result.corpus).not.toBeNull();
    expect(listPublishedAcademyArticles(result.corpus?.articles ?? [])).toEqual(
      [result.corpus?.articles[0]],
    );
  });
});
