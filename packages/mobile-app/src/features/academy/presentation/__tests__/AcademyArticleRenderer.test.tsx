import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { AcademyArticle } from "../../domain";
import { AcademyArticleRenderer } from "../";

const article: AcademyArticle = {
  slug: "houblons",
  metadata: {
    title: "Houblons",
    summary: "Comprendre les roles du houblon.",
    category: "ingredients",
    level: "beginner",
    status: "published",
    version: "1.0.0",
    estimatedReadTimeMinutes: 6,
    tags: ["amertume"],
    updatedAt: "2026-07-03",
    relatedArticles: ["levures"],
    relatedGlossaryTerms: ["ibu"],
    relatedCalculators: [],
    learningObjectives: ["Identifier les roles du houblon."],
    prerequisites: [],
    teaches: ["hop-bitterness"],
    sensitive: false,
    riskTopics: [],
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
        notes: null,
      },
    ],
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
            text: "Le houblon apporte amertume et aromes.",
            sourceIds: ["palmer-2017"],
          },
          {
            id: "glossary-ibu",
            type: "glossaryReference",
            termSlug: "ibu",
            label: "IBU",
            sourceIds: ["palmer-2017"],
          },
          {
            id: "hop-calculator",
            type: "calculatorCta",
            calculatorSlug: "houblons",
            title: "Calculer une amertume cible",
            description: "Ouvrir le calculateur houblons.",
            sourceIds: ["palmer-2017"],
          },
          {
            id: "related-yeast",
            type: "relatedArticle",
            articleSlug: "levures",
            sectionId: "fermentation",
            sourceIds: [],
          },
        ],
      },
    ],
  },
};

describe("AcademyArticleRenderer", () => {
  it("renders article metadata, sections, blocks, and sources", () => {
    render(<AcademyArticleRenderer article={article} />);

    expect(screen.getByText("Houblons")).toBeTruthy();
    expect(screen.getByText("Comprendre les roles du houblon.")).toBeTruthy();
    expect(screen.getByText("Role du houblon")).toBeTruthy();
    expect(
      screen.getByText("Le houblon apporte amertume et aromes."),
    ).toBeTruthy();
    expect(screen.getByText("Sources")).toBeTruthy();
    expect(screen.getByText("How to Brew (2017)")).toBeTruthy();
  });

  it("dispatches semantic block interactions without owning navigation", () => {
    const onGlossaryPress = jest.fn();
    const onCalculatorPress = jest.fn();
    const onRelatedArticlePress = jest.fn();

    render(
      <AcademyArticleRenderer
        article={article}
        onGlossaryPress={onGlossaryPress}
        onCalculatorPress={onCalculatorPress}
        onRelatedArticlePress={onRelatedArticlePress}
      />,
    );

    fireEvent.press(screen.getByText("IBU"));
    fireEvent.press(screen.getByText("Calculer une amertume cible"));
    fireEvent.press(screen.getByText("Lire aussi: levures"));

    expect(onGlossaryPress).toHaveBeenCalledWith("ibu");
    expect(onCalculatorPress).toHaveBeenCalledWith("houblons");
    expect(onRelatedArticlePress).toHaveBeenCalledWith(
      "levures",
      "fermentation",
    );
  });
});
