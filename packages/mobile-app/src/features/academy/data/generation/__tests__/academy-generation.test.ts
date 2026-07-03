import {
  generateAcademyContentFiles,
  parseAcademyGlossaryYaml,
  parseAcademyMarkdownArticle,
  parseAcademySourcesYaml,
} from "../";

const sourcesYaml = `
- id: palmer-2017
  kind: book
  title: How to Brew
  authors:
    - John J. Palmer
  publisher: Brewers Publications
  url: https://www.howtobrew.com/
  accessed_at: 2026-07-03
  year: 2017
  notes: General homebrewing reference.
`;

const glossaryYaml = `
- slug: ibu
  label: IBU
  aliases:
    - International Bitterness Units
  short_definition: Bitterness estimate used for beer recipes.
  detailed_definition: IBU expresses the estimated concentration of bittering compounds from hops in beer.
  related_terms: []
  source_ids:
    - palmer-2017
`;

const articleMarkdown = `---
slug: houblons
title: Houblons
summary: Reference guide for hop roles in brewing.
category: ingredients
level: beginner
status: published
version: 1.0.0
estimated_read_time_minutes: 6
tags:
  - ingredients
updated_at: 2026-07-03
related_articles: []
related_glossary_terms:
  - ibu
related_calculators:
  - slug: houblons
    label: Hop calculator
    reason: Estimate bitterness from hop additions.
    target_slug: houblons
learning_objectives:
  - Identify the main brewing roles of hops.
prerequisites: []
teaches:
  - hop-bitterness
sensitive: false
risk_topics: []
source_ids:
  - palmer-2017
review:
  confidence_level: reviewed
  reviewed_by: Academy editorial review
  reviewed_at: 2026-07-03
  notes:
    - Initial pilot article review.
---

## Role du houblon {#role-du-houblon}

Hops bring bitterness, aroma, flavor, and some preservative effects.

:::glossaryReference id="ibu-reference" termSlug="ibu" label="IBU" sourceIds="palmer-2017":::

:::calculatorCta id="hop-calculator" calculatorSlug="houblons" title="Hop calculator" description="Estimate bitterness." sourceIds="palmer-2017":::
`;

describe("Academy content generation", () => {
  it("parses Markdown and registries into generated TypeScript content", () => {
    const article = parseAcademyMarkdownArticle(
      "docs/academy/ingredients/houblons.md",
      articleMarkdown,
    );
    const sources = parseAcademySourcesYaml(
      "docs/academy/sources/references.yml",
      sourcesYaml,
    );
    const glossaryTerms = parseAcademyGlossaryYaml(
      "docs/academy/glossary/terms.yml",
      glossaryYaml,
    );

    expect(article.errors).toEqual([]);
    expect(sources.errors).toEqual([]);
    expect(glossaryTerms.errors).toEqual([]);

    const result = generateAcademyContentFiles({
      articles: article.value ? [article.value] : [],
      sources: sources.value ?? [],
      glossaryTerms: glossaryTerms.value ?? [],
      calculatorSlugs: ["houblons"],
    });

    expect(result.errors).toEqual([]);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe(
      "packages/mobile-app/src/features/academy/data/generated/academy-corpus.generated.ts",
    );
    expect(result.files[0]?.content).toContain(
      "export const academyCorpus: AcademyCorpus",
    );
    expect(result.files[0]?.content).toContain('"slug": "houblons"');
  });

  it("returns actionable errors for unsupported Academy directives", () => {
    const invalidMarkdown = articleMarkdown.replace(
      ':::calculatorCta id="hop-calculator" calculatorSlug="houblons" title="Hop calculator" description="Estimate bitterness." sourceIds="palmer-2017":::',
      ':::videoEmbed id="video-1":::',
    );

    const article = parseAcademyMarkdownArticle(
      "docs/academy/ingredients/houblons.md",
      invalidMarkdown,
    );

    expect(article.value).toBeNull();
    expect(article.errors).toContain(
      'docs/academy/ingredients/houblons.md:44: unsupported Academy directive "videoEmbed".',
    );
  });

  it("parses CRLF front matter from Markdown files", () => {
    const article = parseAcademyMarkdownArticle(
      "docs/academy/ingredients/houblons.md",
      articleMarkdown.replace(/\n/g, "\r\n"),
    );

    expect(article.errors).toEqual([]);
    expect(article.value?.slug).toBe("houblons");
    expect(article.value?.sections[0]?.id).toBe("role-du-houblon");
  });

  it("parses attributes for every repeated Academy directive", () => {
    const article = parseAcademyMarkdownArticle(
      "docs/academy/ingredients/houblons.md",
      articleMarkdown,
    );

    const blocks = article.value?.sections[0]?.blocks ?? [];

    expect(blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ibu-reference",
          type: "glossaryReference",
          termSlug: "ibu",
        }),
        expect.objectContaining({
          id: "hop-calculator",
          type: "calculatorCta",
          calculatorSlug: "houblons",
        }),
      ]),
    );
  });

  it("surfaces source-validation errors before generating files", () => {
    const article = parseAcademyMarkdownArticle(
      "docs/academy/ingredients/houblons.md",
      articleMarkdown.replace("palmer-2017", "missing-source"),
    );
    const sources = parseAcademySourcesYaml(
      "docs/academy/sources/references.yml",
      sourcesYaml,
    );
    const glossaryTerms = parseAcademyGlossaryYaml(
      "docs/academy/glossary/terms.yml",
      glossaryYaml,
    );

    const result = generateAcademyContentFiles({
      articles: article.value ? [article.value] : [],
      sources: sources.value ?? [],
      glossaryTerms: glossaryTerms.value ?? [],
      calculatorSlugs: ["houblons"],
    });

    expect(result.files).toEqual([]);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("academySource.source.unknown"),
      ]),
    );
  });
});
