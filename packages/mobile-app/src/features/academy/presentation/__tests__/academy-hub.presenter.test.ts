import { AcademyArticle } from "../../domain";
import {
  AcademyLegacyHubTopic,
  createAcademyHubCards,
  filterAcademyHubCards,
  filterAcademyHubCardsByFocus,
  listAcademyHubFocusFilters,
} from "../academy-hub.presenter";

const article: AcademyArticle = {
  slug: "houblons",
  metadata: {
    title: "Houblons",
    summary: "Reference guide for hop roles in brewing.",
    category: "ingredients",
    level: "beginner",
    status: "published",
    version: "1.0.0",
    estimatedReadTimeMinutes: 6,
    tags: ["ingredients"],
    updatedAt: "2026-07-03",
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

const legacyTopics: readonly AcademyLegacyHubTopic[] = [
  {
    slug: "introduction",
    title: "Introduction au brassage",
    shortDescription: "Comprendre les bases.",
    focus: "Bases",
    order: 1,
    estimatedReadTime: "8 min",
    hasCalculator: false,
    status: "coming-soon",
  },
  {
    slug: "houblons",
    title: "Ancien titre houblons",
    shortDescription: "Ancienne description.",
    focus: "Ancien focus",
    order: 2,
    estimatedReadTime: "10 min",
    hasCalculator: true,
    status: "ready",
  },
];

describe("createAcademyHubCards", () => {
  it("uses generated article metadata when an article replaces a legacy topic", () => {
    const cards = createAcademyHubCards([article], legacyTopics);

    expect(cards).toEqual([
      {
        slug: "introduction",
        title: "Introduction au brassage",
        summary: "Comprendre les bases.",
        focus: "Bases",
        order: 1,
        estimatedReadTime: "8 min",
        hasCalculator: false,
        source: "legacy",
      },
      {
        slug: "houblons",
        title: "Houblons",
        summary: "Reference guide for hop roles in brewing.",
        focus: "Ingrédients",
        order: 2,
        estimatedReadTime: "6 min",
        hasCalculator: true,
        source: "generated",
      },
    ]);
  });

  it("uses generated article metadata with partial UI-only topic configuration", () => {
    const cards = createAcademyHubCards(
      [article],
      [
        {
          slug: "houblons",
          order: 2,
          hasCalculator: true,
          status: "ready",
        },
      ],
    );

    expect(cards).toEqual([
      {
        slug: "houblons",
        title: "Houblons",
        summary: "Reference guide for hop roles in brewing.",
        focus: "Ingrédients",
        order: 2,
        estimatedReadTime: "6 min",
        hasCalculator: true,
        source: "generated",
      },
    ]);
  });

  it("appends generated articles that do not have a legacy topic", () => {
    const cards = createAcademyHubCards(
      [
        {
          ...article,
          slug: "empatage",
          metadata: {
            ...article.metadata,
            title: "Empâtage",
            category: "process",
            relatedCalculators: [],
          },
        },
      ],
      legacyTopics,
    );

    expect(cards.map((card) => card.slug)).toEqual([
      "introduction",
      "houblons",
      "empatage",
    ]);
    expect(cards.at(-1)).toMatchObject({
      slug: "empatage",
      focus: "Process",
      hasCalculator: false,
      source: "generated",
    });
  });

  it("filters hub cards with normalized title, summary, focus, and slug text", () => {
    const cards = createAcademyHubCards([article], legacyTopics);

    expect(filterAcademyHubCards(cards, "ingredients")).toEqual([
      expect.objectContaining({ slug: "houblons" }),
    ]);
    expect(filterAcademyHubCards(cards, "INTRO")).toEqual([
      expect.objectContaining({ slug: "introduction" }),
    ]);
    expect(filterAcademyHubCards(cards, "unknown")).toEqual([]);
  });

  it("lists and applies focus filters from computed hub cards", () => {
    const cards = createAcademyHubCards([article], legacyTopics);

    expect(listAcademyHubFocusFilters(cards)).toEqual(["Bases", "Ingrédients"]);
    expect(filterAcademyHubCardsByFocus(cards, "Ingrédients")).toEqual([
      expect.objectContaining({ slug: "houblons" }),
    ]);
    expect(filterAcademyHubCardsByFocus(cards, null)).toBe(cards);
  });
});
