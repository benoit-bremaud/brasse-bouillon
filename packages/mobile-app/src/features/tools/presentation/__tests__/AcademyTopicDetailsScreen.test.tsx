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

  it("renders a published generated article even without a legacy topic", () => {
    render(<AcademyTopicDetailsScreen slugParam="orphan-malt" />);

    expect(
      screen.getByText("Generated article without legacy topic."),
    ).toBeTruthy();
    expect(screen.getByText("Malt basics")).toBeTruthy();
    expect(screen.queryByText("Thème introuvable")).toBeNull();
  });
});
