import { AcademyRepository } from "../application";
import { AcademyCorpus } from "../domain";
import { academyCorpus } from "./generated/academy-corpus.generated";

export function createAcademyCorpusRepository(
  corpus: AcademyCorpus,
): AcademyRepository {
  const articlesBySlug = new Map(
    corpus.articles.map((article) => [article.slug, article]),
  );
  const glossaryTermsBySlug = new Map(
    corpus.glossaryTerms.map((term) => [term.slug, term]),
  );

  return {
    listArticles: () => corpus.articles,
    getArticleBySlug: (slug) => articlesBySlug.get(slug) ?? null,
    listGlossaryTerms: () => corpus.glossaryTerms,
    getGlossaryTermBySlug: (slug) => glossaryTermsBySlug.get(slug) ?? null,
    listCalculatorSlugs: () => corpus.calculatorSlugs,
  };
}

export const generatedAcademyRepository =
  createAcademyCorpusRepository(academyCorpus);
