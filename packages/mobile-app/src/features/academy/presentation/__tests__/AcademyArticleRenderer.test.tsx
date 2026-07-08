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
            id: "tip",
            type: "callout",
            tone: "tip",
            title: "Ajout tardif",
            body: "Un ajout tardif preserve davantage les aromes.",
            sourceIds: ["palmer-2017"],
          },
          {
            id: "definition-alpha-acid",
            type: "definition",
            term: "Acide alpha",
            definition: "Compose du houblon qui contribue a l'amertume.",
            sourceIds: ["palmer-2017"],
          },
          {
            id: "example-late-hop",
            type: "example",
            title: "Ajout en fin d'ebullition",
            body: "Un ajout tardif favorise l'aromatique.",
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
      {
        id: "aller-plus-loin",
        title: "Aller plus loin",
        blocks: [
          {
            id: "next",
            type: "paragraph",
            text: "Compare ensuite le houblonnage avec la fermentation.",
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
    expect(screen.getByText("DÉBUTANT")).toBeTruthy();
    expect(screen.getByText("INGRÉDIENTS")).toBeTruthy();
    expect(screen.getByText("6 MIN")).toBeTruthy();
    expect(screen.getByText("Objectifs pédagogiques")).toBeTruthy();
    expect(screen.getByText("• Identifier les roles du houblon.")).toBeTruthy();
    expect(screen.getByText("Dans cet article")).toBeTruthy();
    expect(screen.getAllByText("Role du houblon").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Aller plus loin").length).toBeGreaterThan(1);
    expect(
      screen.getByText("Le houblon apporte amertume et aromes."),
    ).toBeTruthy();
    expect(screen.getByText("Conseil")).toBeTruthy();
    expect(screen.getByText("Ajout tardif")).toBeTruthy();
    expect(
      screen.getByText("Un ajout tardif preserve davantage les aromes."),
    ).toBeTruthy();
    expect(screen.getByText("Définition")).toBeTruthy();
    expect(screen.getByText("Acide alpha")).toBeTruthy();
    expect(
      screen.getByText("Compose du houblon qui contribue a l'amertume."),
    ).toBeTruthy();
    expect(screen.getByText("Exemple")).toBeTruthy();
    expect(screen.getByText("Ajout en fin d'ebullition")).toBeTruthy();
    expect(
      screen.getByText("Un ajout tardif favorise l'aromatique."),
    ).toBeTruthy();
    expect(screen.getByText("Sources")).toBeTruthy();
    expect(screen.getByText("How to Brew (2017)")).toBeTruthy();
    expect(
      screen.getByText("John J. Palmer · Brewers Publications"),
    ).toBeTruthy();
  });

  it("dispatches semantic block interactions without owning navigation", () => {
    const onGlossaryPress = jest.fn();
    const onCalculatorPress = jest.fn();
    const onRelatedArticlePress = jest.fn();

    render(
      <AcademyArticleRenderer
        article={article}
        resolveArticleTitle={(slug) =>
          slug === "levures" ? "Levures et fermentation" : null
        }
        onGlossaryPress={onGlossaryPress}
        onCalculatorPress={onCalculatorPress}
        onRelatedArticlePress={onRelatedArticlePress}
      />,
    );

    fireEvent.press(screen.getByText("IBU"));
    fireEvent.press(screen.getByText("Calculer une amertume cible"));
    fireEvent.press(screen.getByText("Lire aussi : Levures et fermentation"));

    expect(onGlossaryPress).toHaveBeenCalledWith("ibu");
    expect(onCalculatorPress).toHaveBeenCalledWith("houblons");
    expect(onRelatedArticlePress).toHaveBeenCalledWith(
      "levures",
      "fermentation",
    );
  });

  it("falls back to a readable related article label when no resolver is provided", () => {
    render(<AcademyArticleRenderer article={article} />);

    expect(screen.getByText("Lire aussi : Levures")).toBeTruthy();
  });
});
