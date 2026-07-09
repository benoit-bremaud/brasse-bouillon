import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { academyTopics } from "@/features/tools/data/academy.data";
import { AcademyTopicDetailsScreen } from "../AcademyTopicDetailsScreen";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);

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
              {
                id: "glossary-ibu",
                type: "glossaryReference",
                termSlug: "ibu",
                label: "IBU",
                sourceIds: [],
              },
              {
                id: "related-levures",
                type: "relatedArticle",
                articleSlug: "levures",
                sectionId: "fermentation",
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
        title: "Levures et fermentation",
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

  const glossaryTerms = [
    {
      slug: "ibu",
      label: "IBU",
      aliases: ["International Bitterness Units"],
      shortDefinition: "Estimation de l'amertume d'une bière.",
      detailedDefinition:
        "L'IBU estime la concentration de composés amers apportés principalement par le houblon.",
      relatedTerms: ["acide-alpha"],
      sources: [
        {
          id: "palmer-2017",
          kind: "book",
          title: "How to Brew",
          authors: ["John J. Palmer"],
          publisher: "Brewers Publications",
          url: "https://www.howtobrew.com/",
          accessedAt: "2026-07-03",
          year: 2017,
          notes: "General homebrewing reference.",
        },
      ],
    },
    {
      slug: "acide-alpha",
      label: "Acide alpha",
      aliases: ["alpha acid"],
      shortDefinition: "Composé du houblon lié au potentiel d'amertume.",
      detailedDefinition:
        "Les acides alpha s'isomérisent pendant l'ébullition et participent à l'amertume.",
      relatedTerms: ["ibu"],
      sources: [],
    },
  ];

  return {
    generatedAcademyRepository: {
      listArticles: () => articles,
      getArticleBySlug: (slug: string) =>
        articles.find((article) => article.slug === slug) ?? null,
      listGlossaryTerms: () => glossaryTerms,
      getGlossaryTermBySlug: (slug: string) =>
        glossaryTerms.find((term) => term.slug === slug) ?? null,
      listCalculatorSlugs: () => ["houblons"],
    },
  };
});

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      canGoBack: mockCanGoBack,
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

const CALCULATOR_LABEL_BY_TOPIC: Record<
  (typeof TOPICS_WITH_CALCULATOR)[number],
  string
> = {
  fermentescibles: "Ouvrir le calculateur Malts et fermentescibles",
  couleur: "Ouvrir le calculateur Couleur",
  houblons: "Ouvrir le calculateur Houblons",
  eau: "Ouvrir le calculateur Eau de brassage",
  rendement: "Ouvrir le calculateur Rendement",
  levures: "Ouvrir le calculateur Levures et fermentation",
  carbonatation: "Ouvrir le calculateur Carbonatation",
  avances: "Ouvrir le calculateur Calculs avancés",
};

describe("AcademyTopicDetailsScreen — calculator CTA (Issue #616)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockBack.mockClear();
    mockCanGoBack.mockReset();
    mockCanGoBack.mockReturnValue(true);
  });

  it.each(TOPICS_WITH_CALCULATOR)(
    "happy: %s topic shows the calculator CTA and navigates to its calculator",
    (slug) => {
      render(<AcademyTopicDetailsScreen slugParam={slug} />);

      const button = screen.getByText(CALCULATOR_LABEL_BY_TOPIC[slug]);
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
      expect(screen.queryByText(/^Ouvrir le calculateur/)).toBeNull();
      unmount();
    }
  });

  it("navigates from a legacy topic to its placeholder article route", () => {
    render(<AcademyTopicDetailsScreen slugParam="histoire" />);

    fireEvent.press(screen.getByText("En savoir plus"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]/learn",
      params: { slug: "histoire" },
    });
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
    expect(screen.getByText(CALCULATOR_LABEL_BY_TOPIC.houblons)).toBeTruthy();
  });

  it("navigates from a generated article to a related article", () => {
    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    fireEvent.press(screen.getByText("Lire aussi : Levures et fermentation"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "levures" },
    });
  });

  it("navigates from the generated article footer to the Academy hub", () => {
    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    fireEvent.press(screen.getByText("Retour à l'Académie"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/academy");
  });

  it("navigates from the generated article footer to adjacent articles", () => {
    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    fireEvent.press(screen.getByText("Couleur"));
    fireEvent.press(screen.getByText("Eau de brassage"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "couleur" },
    });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "eau" },
    });
  });

  it("does not render a previous article footer action for the first generated article", () => {
    render(<AcademyTopicDetailsScreen slugParam="introduction" />);

    expect(screen.queryByText("Précédent")).toBeNull();
    expect(screen.getByText("Suivant")).toBeTruthy();
    expect(screen.getByText("Malts et fermentescibles")).toBeTruthy();
  });

  it("navigates from a generated article glossary reference to the glossary", () => {
    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    fireEvent.press(screen.getByText("IBU"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "glossaire", termSlug: "ibu" },
    });
  });

  it("renders the targeted glossary term when opened from an internal link", () => {
    render(
      <AcademyTopicDetailsScreen slugParam="glossaire" termSlugParam="ibu" />,
    );

    expect(screen.getByText("Terme sélectionné")).toBeTruthy();
    expect(screen.getAllByText("IBU").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Estimation de l'amertume d'une bière.").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Alias : International Bitterness Units"),
    ).toBeTruthy();
    expect(screen.getByText("Sources du terme")).toBeTruthy();
    expect(screen.getByText("How to Brew (2017)")).toBeTruthy();
    expect(screen.getByText("Termes associés")).toBeTruthy();
    expect(
      screen.getByLabelText("Consulter le terme associé Acide alpha"),
    ).toBeTruthy();
  });

  it("navigates from the highlighted glossary term to a related term", () => {
    render(
      <AcademyTopicDetailsScreen slugParam="glossaire" termSlugParam="ibu" />,
    );

    fireEvent.press(
      screen.getByLabelText("Consulter le terme associé Acide alpha"),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "glossaire", termSlug: "acide-alpha" },
    });
  });

  it("uses navigation back from the article header when history exists", () => {
    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    fireEvent.press(screen.getByLabelText("Retour à l'écran précédent"));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("falls back to the Academy hub from the article header without history", () => {
    mockCanGoBack.mockReturnValue(false);

    render(<AcademyTopicDetailsScreen slugParam="houblons" />);

    fireEvent.press(screen.getByLabelText("Retour à l'écran précédent"));

    expect(mockBack).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(app)/academy");
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
    expect(screen.getByText(CALCULATOR_LABEL_BY_TOPIC.levures)).toBeTruthy();
  });

  it("renders the generated water article and keeps the calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="eau" />);

    expect(screen.getByText("Generated water article summary.")).toBeTruthy();
    expect(screen.getByText("Pourquoi l'eau est critique")).toBeTruthy();
    expect(screen.getByText(CALCULATOR_LABEL_BY_TOPIC.eau)).toBeTruthy();
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
    expect(
      screen.getByText(CALCULATOR_LABEL_BY_TOPIC.fermentescibles),
    ).toBeTruthy();
  });

  it("renders the generated carbonation article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="carbonatation" />);

    expect(
      screen.getByText("Generated carbonation article summary."),
    ).toBeTruthy();
    expect(
      screen.getByText("Pourquoi la carbonatation est critique"),
    ).toBeTruthy();
    expect(
      screen.getByText(CALCULATOR_LABEL_BY_TOPIC.carbonatation),
    ).toBeTruthy();
  });

  it("renders the generated color article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="couleur" />);

    expect(screen.getByText("Generated color article summary.")).toBeTruthy();
    expect(
      screen.getByText("Pourquoi la couleur est un repere cle"),
    ).toBeTruthy();
    expect(screen.getByText(CALCULATOR_LABEL_BY_TOPIC.couleur)).toBeTruthy();
  });

  it("renders the generated efficiency article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="rendement" />);

    expect(
      screen.getByText("Generated efficiency article summary."),
    ).toBeTruthy();
    expect(screen.getByText("Pourquoi le rendement est critique")).toBeTruthy();
    expect(screen.getByText(CALCULATOR_LABEL_BY_TOPIC.rendement)).toBeTruthy();
  });

  it("renders the generated advanced article with calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="avances" />);

    expect(
      screen.getByText("Generated advanced article summary."),
    ).toBeTruthy();
    expect(screen.getByText("Pourquoi ces calculs sont avances")).toBeTruthy();
    expect(screen.getByText(CALCULATOR_LABEL_BY_TOPIC.avances)).toBeTruthy();
  });

  it("renders the generated glossary article without a calculator route", () => {
    render(<AcademyTopicDetailsScreen slugParam="glossaire" />);

    expect(
      screen.getByText("Generated glossary article summary."),
    ).toBeTruthy();
    expect(screen.getByText("Pourquoi un glossaire brassicole")).toBeTruthy();
    expect(screen.getByText("Tous les termes")).toBeTruthy();
    expect(screen.getByText("2 termes")).toBeTruthy();
    expect(screen.getByText("Acide alpha")).toBeTruthy();
    expect(screen.getByText("IBU")).toBeTruthy();
    expect(screen.queryByText(/^Ouvrir le calculateur/)).toBeNull();
  });

  it("navigates from the glossary terms list to the selected term", () => {
    render(<AcademyTopicDetailsScreen slugParam="glossaire" />);

    fireEvent.press(screen.getByText("Acide alpha"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/academy/[slug]",
      params: { slug: "glossaire", termSlug: "acide-alpha" },
    });
  });

  it("clears the glossary search when selecting a filtered term", () => {
    render(<AcademyTopicDetailsScreen slugParam="glossaire" />);

    fireEvent.changeText(
      screen.getByLabelText("Rechercher un terme du glossaire"),
      "alpha",
    );
    fireEvent.press(screen.getByText("Acide alpha"));

    expect(
      screen.getByLabelText("Rechercher un terme du glossaire").props.value,
    ).toBe("");
  });

  it("ranks direct glossary search matches before related matches", () => {
    render(<AcademyTopicDetailsScreen slugParam="glossaire" />);

    fireEvent.changeText(
      screen.getByLabelText("Rechercher un terme du glossaire"),
      "alpha",
    );

    expect(screen.getByText("2 termes trouvés")).toBeTruthy();
    expect(
      screen
        .getAllByLabelText(/^Consulter le terme (Acide alpha|IBU)$/)
        .map((termAction) => termAction.props.accessibilityLabel),
    ).toEqual(["Consulter le terme Acide alpha", "Consulter le terme IBU"]);
  });

  it("clears the glossary search input", () => {
    render(<AcademyTopicDetailsScreen slugParam="glossaire" />);

    fireEvent.changeText(
      screen.getByLabelText("Rechercher un terme du glossaire"),
      "alpha",
    );
    fireEvent.press(screen.getByText("Effacer"));

    expect(screen.getByText("2 termes")).toBeTruthy();
    expect(screen.getByText("Acide alpha")).toBeTruthy();
    expect(screen.getByText("IBU")).toBeTruthy();
  });

  it("renders an empty state when the glossary search has no result", () => {
    render(<AcademyTopicDetailsScreen slugParam="glossaire" />);

    fireEvent.changeText(
      screen.getByLabelText("Rechercher un terme du glossaire"),
      "inconnu",
    );

    expect(screen.getByText("0 termes trouvés")).toBeTruthy();
    expect(
      screen.getByText("Aucun terme ne correspond à cette recherche."),
    ).toBeTruthy();
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
