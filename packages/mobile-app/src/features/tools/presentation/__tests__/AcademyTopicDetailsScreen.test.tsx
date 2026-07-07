import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { academyTopics } from "@/features/tools/data/academy.data";
import { AcademyTopicDetailsScreen } from "../AcademyTopicDetailsScreen";

const mockPush = jest.fn();

jest.mock("@/features/academy/data", () => {
  const articles = [
    {
      slug: "introduction",
      metadata: {
        title: "Introduction au brassage",
        summary: "Generated introduction summary.",
        category: "getting-started",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 8,
        tags: ["beginner"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [],
        learningObjectives: ["Understand brewing overview."],
        prerequisites: [],
        teaches: ["brewing-overview"],
        sensitive: false,
        riskTopics: [],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "pourquoi-commencer",
            title: "Pourquoi commencer par l'introduction",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated introduction article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "houblons",
      metadata: {
        title: "Houblons",
        summary: "Reference guide for hop roles in brewing.",
        category: "ingredients",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 6,
        tags: ["ingredients", "bitterness"],
        updatedAt: "2026-07-03",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "houblons",
            label: "Hop calculator",
            reason: "Estimate bitterness.",
            target: { type: "calculator", slug: "houblons" },
          },
        ],
        learningObjectives: ["Identify hop roles."],
        prerequisites: [],
        teaches: ["hop-bitterness"],
        sensitive: false,
        riskTopics: [],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "role-du-houblon",
            title: "Role du houblon",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated hop article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "levures",
      metadata: {
        title: "Levures",
        summary: "Generated yeast article summary.",
        category: "fermentation",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 9,
        tags: ["fermentation"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "levures",
            label: "Yeast calculator",
            reason: "Estimate pitch rate.",
            target: { type: "calculator", slug: "levures" },
          },
        ],
        learningObjectives: ["Understand fermentation."],
        prerequisites: [],
        teaches: ["fermentation-basics"],
        sensitive: true,
        riskTopics: ["fermentation-health"],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "fermentation",
            title: "Pourquoi la levure est critique",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated yeast article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "eau",
      metadata: {
        title: "Eau de brassage",
        summary: "Generated water article summary.",
        category: "water",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 10,
        tags: ["water"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: ["profil-mineral"],
        relatedCalculators: [
          {
            slug: "eau",
            label: "Water calculator",
            reason: "Adjust a water profile.",
            target: { type: "calculator", slug: "eau" },
          },
        ],
        learningObjectives: ["Understand brewing water."],
        prerequisites: [],
        teaches: ["water-profile"],
        sensitive: true,
        riskTopics: ["chemical-dosage"],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "profil-mineral",
            title: "Pourquoi l'eau est critique",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated water article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "fermentescibles",
      metadata: {
        title: "Malts et fermentescibles",
        summary: "Generated fermentables article summary.",
        category: "ingredients",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 10,
        tags: ["malt"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "fermentescibles",
            label: "Fermentables calculator",
            reason: "Estimate alcohol.",
            target: { type: "calculator", slug: "fermentescibles" },
          },
        ],
        learningObjectives: ["Understand malt basics."],
        prerequisites: [],
        teaches: ["malt-basics"],
        sensitive: true,
        riskTopics: ["fermentation-health"],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "role-du-malt",
            title: "Pourquoi le malt est central",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated malt and fermentables article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "couleur",
      metadata: {
        title: "Couleur",
        summary: "Generated color article summary.",
        category: "process",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 8,
        tags: ["color"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "couleur",
            label: "Color calculator",
            reason: "Estimate final color.",
            target: { type: "calculator", slug: "couleur" },
          },
        ],
        learningObjectives: ["Understand beer color."],
        prerequisites: [],
        teaches: ["beer-color"],
        sensitive: false,
        riskTopics: [],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "role-couleur",
            title: "Pourquoi la couleur est un repere cle",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated color article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "carbonatation",
      metadata: {
        title: "Carbonatation",
        summary: "Generated carbonation article summary.",
        category: "process",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 9,
        tags: ["carbonation"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "carbonatation",
            label: "Carbonation calculator",
            reason: "Estimate priming sugar.",
            target: { type: "calculator", slug: "carbonatation" },
          },
        ],
        learningObjectives: ["Understand carbonation safety."],
        prerequisites: [],
        teaches: ["packaging-safety"],
        sensitive: true,
        riskTopics: ["bottle-pressure"],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "role-carbonatation",
            title: "Pourquoi la carbonatation est critique",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated carbonation article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "rendement",
      metadata: {
        title: "Rendement",
        summary: "Generated efficiency article summary.",
        category: "process",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 9,
        tags: ["efficiency"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "rendement",
            label: "Efficiency calculator",
            reason: "Estimate brewhouse efficiency.",
            target: { type: "calculator", slug: "rendement" },
          },
        ],
        learningObjectives: ["Understand brewhouse efficiency."],
        prerequisites: [],
        teaches: ["brewhouse-efficiency"],
        sensitive: false,
        riskTopics: [],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "role-rendement",
            title: "Pourquoi le rendement est critique",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated efficiency article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "avances",
      metadata: {
        title: "Calculs avancés",
        summary: "Generated advanced article summary.",
        category: "process",
        level: "advanced",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 11,
        tags: ["advanced"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "avances",
            label: "Advanced calculator",
            reason: "Diagnose advanced metrics.",
            target: { type: "calculator", slug: "avances" },
          },
        ],
        learningObjectives: ["Understand advanced diagnostics."],
        prerequisites: [],
        teaches: ["advanced-diagnostics"],
        sensitive: true,
        riskTopics: ["advanced-estimates"],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "role-avances",
            title: "Pourquoi ces calculs sont avances",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated advanced article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "glossaire",
      metadata: {
        title: "Glossaire brassicole",
        summary: "Generated glossary article summary.",
        category: "glossary",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 8,
        tags: ["glossary"],
        updatedAt: "2026-07-07",
        relatedArticles: [],
        relatedGlossaryTerms: ["ibu"],
        relatedCalculators: [],
        learningObjectives: ["Understand brewing vocabulary."],
        prerequisites: [],
        teaches: ["brewing-vocabulary"],
        sensitive: false,
        riskTopics: [],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "pourquoi-glossaire",
            title: "Pourquoi un glossaire brassicole",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated glossary article.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "orphan-malt",
      metadata: {
        title: "Malt generated",
        summary: "Generated article without legacy topic.",
        category: "ingredients",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 4,
        tags: ["malt"],
        updatedAt: "2026-07-03",
        relatedArticles: [],
        relatedGlossaryTerms: [],
        relatedCalculators: [],
        learningObjectives: ["Understand malt basics."],
        prerequisites: [],
        teaches: ["malt-basics"],
        sensitive: false,
        riskTopics: [],
        sources: [],
        review: null,
      },
      body: {
        sections: [
          {
            id: "malt-basics",
            title: "Malt basics",
            blocks: [
              {
                id: "intro",
                type: "paragraph",
                text: "Generated-only article body.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
  ];

  return {
    generatedAcademyRepository: {
      listArticles: () => articles,
      getArticleBySlug: (slug: string) =>
        articles.find((article) => article.slug === slug) ?? null,
      listGlossaryTerms: () => [],
      getGlossaryTermBySlug: () => null,
      listCalculatorSlugs: () => ["houblons"],
    },
  };
});

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

const TOPICS_WITH_CALCULATOR = [
  "fermentescibles",
  "couleur",
  "houblons",
  "eau",
  "rendement",
  "levures",
  "carbonatation",
  "avances",
] as const;

describe("AcademyTopicDetailsScreen — calculator CTA (Issue #616)", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it.each(TOPICS_WITH_CALCULATOR)(
    'happy: %s topic shows "Ouvrir le calculateur" and navigates to its calculator',
    (slug) => {
      render(<AcademyTopicDetailsScreen slugParam={slug} />);

      const button = screen.getByText("Ouvrir le calculateur");
      fireEvent.press(button);

      expect(mockPush).toHaveBeenCalledWith({
        pathname: "/tools/[slug]/calculator",
        params: { slug },
      });
    },
  );

  it('sad: never renders "Accéder au futur calculateur" anywhere', () => {
    for (const slug of TOPICS_WITH_CALCULATOR) {
      const { unmount } = render(
        <AcademyTopicDetailsScreen slugParam={slug} />,
      );
      expect(screen.queryByText(/futur calculateur/i)).toBeNull();
      unmount();
    }
  });

  it("edge: topics without a calculator do not show the calculator CTA", () => {
    for (const slug of ["histoire", "introduction", "glossaire"] as const) {
      const { unmount } = render(
        <AcademyTopicDetailsScreen slugParam={slug} />,
      );
      expect(screen.queryByText("Ouvrir le calculateur")).toBeNull();
      unmount();
    }
  });

  it("edge: every topic with hasCalculator=true is wired to a working calculator route", () => {
    const wired = academyTopics.filter((t) => t.hasCalculator);
    expect(wired.map((t) => t.slug).sort()).toEqual(
      [...TOPICS_WITH_CALCULATOR].sort(),
    );
    for (const topic of wired) {
      expect(topic.status).toBe("ready");
    }
  });

  it("renders the generated published article when the topic has migrated content", () => {
    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    expect(
      screen.getByText("Reference guide for hop roles in brewing."),
    ).toBeTruthy();
    expect(screen.getByText("Role du houblon")).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated introduction instead of the legacy card content", () => {
    render(<AcademyTopicDetailsScreen slugParam="introduction" />);

    expect(screen.getByText("Generated introduction summary.")).toBeTruthy();
    expect(screen.getByText("Generated introduction article.")).toBeTruthy();
    expect(screen.queryByText("Les 4 ingrédients fondamentaux")).toBeNull();
  });

  it("renders the generated yeast article and keeps the calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="levures" />);

    expect(screen.getByText("Generated yeast article summary.")).toBeTruthy();
    expect(screen.getByText("Pourquoi la levure est critique")).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated water article and keeps the calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="eau" />);

    expect(screen.getByText("Generated water article summary.")).toBeTruthy();
    expect(screen.getByText("Pourquoi l'eau est critique")).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated malt and fermentables article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="fermentescibles" />);

    expect(
      screen.getByText("Generated fermentables article summary."),
    ).toBeTruthy();
    expect(
      screen.getAllByText("Malts et fermentescibles").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Pourquoi le malt est central")).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated carbonation article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="carbonatation" />);

    expect(
      screen.getByText("Generated carbonation article summary."),
    ).toBeTruthy();
    expect(
      screen.getByText("Pourquoi la carbonatation est critique"),
    ).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated color article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="couleur" />);

    expect(screen.getByText("Generated color article summary.")).toBeTruthy();
    expect(
      screen.getByText("Pourquoi la couleur est un repere cle"),
    ).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated efficiency article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="rendement" />);

    expect(
      screen.getByText("Generated efficiency article summary."),
    ).toBeTruthy();
    expect(screen.getByText("Pourquoi le rendement est critique")).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated advanced article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="avances" />);

    expect(
      screen.getByText("Generated advanced article summary."),
    ).toBeTruthy();
    expect(screen.getByText("Pourquoi ces calculs sont avances")).toBeTruthy();
    expect(screen.getByText("Ouvrir le calculateur")).toBeTruthy();
  });

  it("renders the generated glossary article without a calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="glossaire" />);

    expect(
      screen.getByText("Generated glossary article summary."),
    ).toBeTruthy();
    expect(screen.getByText("Pourquoi un glossaire brassicole")).toBeTruthy();
    expect(screen.queryByText("Ouvrir le calculateur")).toBeNull();
  });

  it("renders a published generated article even without a legacy topic", () => {
    render(<AcademyTopicDetailsScreen slugParam="orphan-malt" />);

    expect(
      screen.getByText("Generated article without legacy topic."),
    ).toBeTruthy();
    expect(screen.getByText("Malt basics")).toBeTruthy();
    expect(screen.queryByText("Thème introuvable")).toBeNull();
  });
});
