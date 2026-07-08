import {
  getAcademyArticleBySlug,
  getAcademyGlossaryTermBySlug,
  listAcademyGlossaryTermsUseCase,
  listPublishedAcademyArticlesUseCase,
  resolveAcademyLinkTarget,
  searchAcademy,
} from "../";
import { AcademyRepository } from "../academy.ports";
import { AcademyArticle, GlossaryTerm } from "../../domain";

const publishedArticle: AcademyArticle = {
  slug: "houblons",
  metadata: {
    title: "Houblons",
    summary: "Comprendre l'amertume et les aromes.",
    category: "ingredients",
    level: "beginner",
    status: "published",
    version: "1.0.0",
    estimatedReadTimeMinutes: 6,
    tags: ["amertume", "arome"],
    updatedAt: "2026-07-03",
    relatedArticles: [],
    relatedGlossaryTerms: ["ibu"],
    relatedCalculators: [],
    learningObjectives: ["Identifier le role du houblon."],
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
            text: "Hop introduction.",
            sourceIds: [],
          },
        ],
      },
    ],
  },
};

const draftArticle: AcademyArticle = {
  ...publishedArticle,
  slug: "levures",
  metadata: {
    ...publishedArticle.metadata,
    title: "Levures et fermentation",
    status: "draft",
  },
};

const ibuTerm: GlossaryTerm = {
  slug: "ibu",
  label: "IBU",
  aliases: ["International Bitterness Units"],
  shortDefinition: "Indice d'amertume.",
  detailedDefinition: "Estimation de l'amertume d'une biere.",
  relatedTerms: [],
  sources: [],
};

const alphaAcidTerm: GlossaryTerm = {
  slug: "acide-alpha",
  label: "Acide alpha",
  aliases: ["alpha acid"],
  shortDefinition: "Compose du houblon.",
  detailedDefinition: "Compose lie au potentiel du houblon.",
  relatedTerms: ["ibu"],
  sources: [],
};

const repository: AcademyRepository = {
  listArticles: () => [publishedArticle, draftArticle],
  getArticleBySlug: (slug) =>
    [publishedArticle, draftArticle].find((article) => article.slug === slug) ??
    null,
  listGlossaryTerms: () => [ibuTerm, alphaAcidTerm],
  getGlossaryTermBySlug: (slug) => (slug === ibuTerm.slug ? ibuTerm : null),
  listCalculatorSlugs: () => ["houblons"],
};

describe("Academy use cases", () => {
  it("lists published article summaries without draft articles", () => {
    expect(listPublishedAcademyArticlesUseCase(repository)).toEqual([
      publishedArticle,
    ]);
  });

  it("gets articles and glossary terms by normalized slug", () => {
    expect(getAcademyArticleBySlug(repository, " houblons ")).toBe(
      publishedArticle,
    );
    expect(getAcademyGlossaryTermBySlug(repository, " ibu ")).toBe(ibuTerm);
    expect(getAcademyArticleBySlug(repository, " ")).toBeNull();
  });

  it("lists glossary terms alphabetically for presentation", () => {
    expect(listAcademyGlossaryTermsUseCase(repository)).toEqual([
      alphaAcidTerm,
      ibuTerm,
    ]);
  });

  it("searches published articles and glossary entries", () => {
    const results = searchAcademy(repository, "amertume");

    expect(results.map((result) => result.id)).toEqual([
      "article:houblons",
      "glossary:ibu",
    ]);
  });

  it("resolves supported link targets without owning route mapping", () => {
    expect(
      resolveAcademyLinkTarget(repository, {
        type: "article",
        slug: "houblons",
        sectionId: "role-du-houblon",
      }),
    ).toEqual({
      type: "article",
      article: publishedArticle,
      sectionId: "role-du-houblon",
    });
    expect(
      resolveAcademyLinkTarget(repository, {
        type: "calculator",
        slug: "houblons",
      }),
    ).toEqual({ type: "calculator", slug: "houblons" });
    expect(
      resolveAcademyLinkTarget(repository, {
        type: "calculator",
        slug: "unknown",
      }),
    ).toBeNull();
  });
});
