import {
  AcademyArticle,
  AcademyCorpus,
  AcademyValidationContext,
  GlossaryTerm,
  SourceReference,
  listPublishedAcademyArticles,
  validateAcademyArticle,
  validateAcademyCorpus,
  validateGlossaryTerm,
} from "../index";

const bjcpSource: SourceReference = {
  id: "bjcp-2021",
  kind: "standard",
  title: "Beer Judge Certification Program Style Guidelines",
  authors: ["BJCP"],
  publisher: "Beer Judge Certification Program",
  url: "https://www.bjcp.org/",
  accessedAt: "2026-07-03",
  year: 2021,
  notes: null,
};

const validationContext: AcademyValidationContext = {
  knownArticleSlugs: new Set(["houblons", "levures", "eau"]),
  knownGlossarySlugs: new Set(["ibu", "acide-alpha"]),
  knownCalculatorSlugs: new Set(["houblons", "levures", "eau"]),
};

const validArticle: AcademyArticle = {
  slug: "houblons",
  metadata: {
    title: "Houblons",
    summary: "Understand the role of hops in beer.",
    category: "ingredients",
    level: "beginner",
    status: "published",
    version: "1.0.0",
    estimatedReadTimeMinutes: 10,
    tags: ["houblon", "ibu"],
    updatedAt: "2026-07-03",
    relatedArticles: ["levures"],
    relatedGlossaryTerms: ["ibu"],
    relatedCalculators: [
      {
        slug: "houblons",
        label: "IBU calculator",
        reason: "Connect bitterness theory to recipe calculation.",
        target: { type: "calculator", slug: "houblons" },
      },
    ],
    learningObjectives: ["Understand bitterness basics."],
    prerequisites: [],
    teaches: ["ibu"],
    sensitive: true,
    riskTopics: ["amertume", "dosage"],
    sources: [bjcpSource],
    review: {
      confidenceLevel: "reviewed",
      reviewedBy: "benoit-bremaud",
      reviewedAt: "2026-07-03",
      notes: ["Pilot article reviewed for the generated Academy baseline."],
    },
  },
  body: {
    sections: [
      {
        id: "role-du-houblon",
        title: "Hop role",
        blocks: [
          {
            id: "role-intro",
            type: "paragraph",
            text: "Hops bring bitterness, aroma, and stability.",
            sourceIds: ["bjcp-2021"],
          },
          {
            id: "ibu-ref",
            type: "glossaryReference",
            termSlug: "ibu",
            label: "IBU",
            sourceIds: [],
          },
          {
            id: "ibu-calculator",
            type: "calculatorCta",
            calculatorSlug: "houblons",
            title: "Calculate bitterness",
            description: "Open the IBU calculator.",
            sourceIds: [],
          },
        ],
      },
    ],
  },
};

describe("Academy domain validation", () => {
  it("accepts a sourced and reviewed published article", () => {
    const result = validateAcademyArticle(validArticle, validationContext);

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects sensitive published content without sources or review metadata", () => {
    const article: AcademyArticle = {
      ...validArticle,
      metadata: {
        ...validArticle.metadata,
        sources: [],
        review: null,
      },
    };

    const result = validateAcademyArticle(article, validationContext);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "article.sensitive.sources.required",
        "article.sensitive.review.required",
        "article.block.source.unknown",
      ]),
    );
  });

  it("rejects unknown semantic links", () => {
    const article: AcademyArticle = {
      ...validArticle,
      metadata: {
        ...validArticle.metadata,
        relatedArticles: ["malt"],
        relatedGlossaryTerms: ["dry-hop"],
        relatedCalculators: [
          {
            slug: "malt",
            label: "Malt calculator",
            reason: "Invalid target fixture.",
            target: { type: "calculator", slug: "malt" },
          },
        ],
      },
    };

    const result = validateAcademyArticle(article, validationContext);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "article.relatedArticle.unknown",
        "article.relatedGlossaryTerm.unknown",
        "article.relatedCalculator.unknown",
        "article.relatedCalculatorTarget.unknown",
      ]),
    );
  });

  it("rejects malformed render blocks", () => {
    const article: AcademyArticle = {
      ...validArticle,
      body: {
        sections: [
          {
            id: "role-du-houblon",
            title: "Hop role",
            blocks: [
              {
                id: "broken-table",
                type: "table",
                caption: null,
                columns: ["Nom", "Valeur"],
                rows: [["IBU"]],
                sourceIds: [],
              },
            ],
          },
        ],
      },
    };

    const result = validateAcademyArticle(article, validationContext);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "article.block.table.rowSize.invalid",
    );
  });

  it("keeps draft articles out of the published list", () => {
    const draftArticle: AcademyArticle = {
      ...validArticle,
      slug: "eau",
      metadata: {
        ...validArticle.metadata,
        status: "draft",
        title: "Eau",
      },
    };

    const published = listPublishedAcademyArticles([
      validArticle,
      draftArticle,
    ]);

    expect(published).toEqual([validArticle]);
  });

  it("validates glossary terms against the source registry", () => {
    const term: GlossaryTerm = {
      slug: "ibu",
      label: "IBU",
      aliases: ["International Bitterness Units"],
      shortDefinition: "Bitterness measurement unit.",
      detailedDefinition: "Index used to approximate hop bitterness.",
      relatedTerms: ["acide-alpha"],
      sources: [bjcpSource],
    };

    const result = validateGlossaryTerm(term, new Set(["bjcp-2021"]));

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects glossary terms that reference unknown sources", () => {
    const term: GlossaryTerm = {
      slug: "ibu",
      label: "IBU",
      aliases: [],
      shortDefinition: "Bitterness measurement unit.",
      detailedDefinition: "Index used to approximate hop bitterness.",
      relatedTerms: [],
      sources: [bjcpSource],
    };

    const result = validateGlossaryTerm(term, new Set(["palmer-2017"]));

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "glossary.source.unknown",
    );
  });

  it("accepts a coherent Academy corpus", () => {
    const standaloneArticle: AcademyArticle = {
      ...validArticle,
      metadata: {
        ...validArticle.metadata,
        relatedArticles: [],
      },
    };
    const corpus: AcademyCorpus = {
      articles: [standaloneArticle],
      glossaryTerms: [
        {
          slug: "ibu",
          label: "IBU",
          aliases: ["International Bitterness Units"],
          shortDefinition: "Bitterness measurement unit.",
          detailedDefinition:
            "Index used to approximate hop bitterness in beer.",
          relatedTerms: ["acide-alpha"],
          sources: [bjcpSource],
        },
      ],
      sources: [bjcpSource],
      calculatorSlugs: ["houblons", "levures", "eau"],
    };

    const result = validateAcademyCorpus(corpus);

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects duplicate corpus identifiers", () => {
    const duplicateArticle: AcademyArticle = {
      ...validArticle,
      metadata: {
        ...validArticle.metadata,
        title: "Duplicate hops",
      },
    };
    const corpus: AcademyCorpus = {
      articles: [validArticle, duplicateArticle],
      glossaryTerms: [
        {
          slug: "ibu",
          label: "IBU",
          aliases: [],
          shortDefinition: "Bitterness measurement unit.",
          detailedDefinition:
            "Index used to approximate hop bitterness in beer.",
          relatedTerms: [],
          sources: [bjcpSource],
        },
        {
          slug: "ibu",
          label: "Duplicate IBU",
          aliases: [],
          shortDefinition: "Duplicate fixture.",
          detailedDefinition: "Duplicate fixture.",
          relatedTerms: [],
          sources: [bjcpSource],
        },
      ],
      sources: [bjcpSource, bjcpSource],
      calculatorSlugs: ["houblons", "houblons"],
    };

    const result = validateAcademyCorpus(corpus);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "corpus.articleSlug.duplicate",
        "corpus.glossarySlug.duplicate",
        "corpus.sourceId.duplicate",
        "corpus.calculatorSlug.duplicate",
      ]),
    );
  });

  it("rejects article sources missing from the corpus registry", () => {
    const corpus: AcademyCorpus = {
      articles: [validArticle],
      glossaryTerms: [],
      sources: [],
      calculatorSlugs: ["houblons", "levures", "eau"],
    };

    const result = validateAcademyCorpus(corpus);

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "article.source.registry.unknown",
        "article.relatedGlossaryTerm.unknown",
        "article.block.glossary.unknown",
      ]),
    );
  });
});
