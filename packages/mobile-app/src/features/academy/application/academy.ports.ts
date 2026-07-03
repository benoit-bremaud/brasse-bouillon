import { AcademyArticle, GlossaryTerm } from "../domain";

export interface AcademyRepository {
  readonly listArticles: () => readonly AcademyArticle[];
  readonly getArticleBySlug: (slug: string) => AcademyArticle | null;
  readonly listGlossaryTerms: () => readonly GlossaryTerm[];
  readonly getGlossaryTermBySlug: (slug: string) => GlossaryTerm | null;
  readonly listCalculatorSlugs: () => readonly string[];
}
