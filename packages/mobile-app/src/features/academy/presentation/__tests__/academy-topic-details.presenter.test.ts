import { AcademyArticle, GlossaryTerm } from "../../domain";
import {
  formatAcademyCalculatorButtonLabel,
  getPublishedAcademyArticleNavigation,
  listRelatedAcademyGlossaryTerms,
  resolveAcademyCalculatorSlug,
} from "../academy-topic-details.presenter";

const article: AcademyArticle = {
  slug: "houblons",
  metadata: {
    title: "Houblons",
    summary: "Reference guide for hop roles.",
    category: "ingredients",
    level: "beginner",
    status: "published",
    version: "1.0.0",
    estimatedReadTimeMinutes: 6,
    tags: [],
    updatedAt: "2026-07-09",
    relatedArticles: [],
    relatedGlossaryTerms: [],
    relatedCalculators: [
      {
        slug: "houblons",
        label: "Hop calculator",
        reason: "Estimate bitterness.",
        target: {
          type: "calculator",
          slug: "houblons",
        },
      },
    ],
    learningObjectives: [],
    prerequisites: [],
    teaches: [],
    sensitive: false,
    riskTopics: [],
    sources: [],
    review: null,
  },
  body: {
    sections: [],
  },
};

const ibuTerm: GlossaryTerm = {
  slug: "ibu",
  label: "IBU",
  aliases: [],
  shortDefinition: "Amertume calculee.",
  detailedDefinition: "International Bitterness Units.",
  relatedTerms: ["acide-alpha", "missing"],
  sources: [],
};

const alphaAcidTerm: GlossaryTerm = {
  slug: "acide-alpha",
  label: "Acide alpha",
  aliases: [],
  shortDefinition: "Compose du houblon.",
  detailedDefinition: "Compose isomerise pendant l'ebullition.",
  relatedTerms: [],
  sources: [],
};

describe("academy topic details presenter", () => {
  it("resolves calculator CTA slugs from generated article metadata first", () => {
    expect(
      resolveAcademyCalculatorSlug(article, {
        slug: "legacy-houblons",
        hasCalculator: true,
      }),
    ).toBe("houblons");
    expect(
      resolveAcademyCalculatorSlug(null, {
        slug: "legacy-houblons",
        hasCalculator: true,
      }),
    ).toBe("legacy-houblons");
    expect(
      resolveAcademyCalculatorSlug(null, {
        slug: "history",
        hasCalculator: false,
      }),
    ).toBeNull();
  });

  it("formats calculator labels with resolver fallback", () => {
    expect(
      formatAcademyCalculatorButtonLabel("houblons", (slug) =>
        slug === "houblons" ? "Houblons" : null,
      ),
    ).toBe("Ouvrir le calculateur Houblons");
    expect(formatAcademyCalculatorButtonLabel("dry-hop", () => null)).toBe(
      "Ouvrir le calculateur dry hop",
    );
    expect(formatAcademyCalculatorButtonLabel(null, () => null)).toBe(
      "Ouvrir le calculateur",
    );
  });

  it("lists related glossary terms and ignores stale references", () => {
    expect(
      listRelatedAcademyGlossaryTerms(ibuTerm, (slug) =>
        slug === alphaAcidTerm.slug ? alphaAcidTerm : null,
      ),
    ).toEqual([alphaAcidTerm]);
    expect(listRelatedAcademyGlossaryTerms(null, () => alphaAcidTerm)).toEqual(
      [],
    );
  });

  it("resolves previous and next generated article navigation", () => {
    const cards = [
      {
        slug: "legacy",
        title: "Legacy",
        summary: "Legacy topic.",
        focus: "Legacy",
        order: 0,
        estimatedReadTime: "4 min",
        hasCalculator: false,
        source: "legacy" as const,
      },
      {
        slug: "introduction",
        title: "Introduction",
        summary: "Start here.",
        focus: "Premiers pas",
        order: 1,
        estimatedReadTime: "5 min",
        hasCalculator: false,
        source: "generated" as const,
      },
      {
        slug: "houblons",
        title: "Houblons",
        summary: "Hop roles.",
        focus: "Ingrédients",
        order: 2,
        estimatedReadTime: "6 min",
        hasCalculator: true,
        source: "generated" as const,
      },
    ];

    expect(getPublishedAcademyArticleNavigation("houblons", cards)).toEqual({
      previous: {
        slug: "introduction",
        title: "Introduction",
      },
      next: null,
    });
    expect(getPublishedAcademyArticleNavigation("missing", cards)).toEqual({
      previous: null,
      next: null,
    });
  });
});
