import {
  listPublishedAcademyArticlesUseCase,
  searchAcademy,
} from "../../application";
import { createAcademyCorpusRepository, generatedAcademyRepository } from "../";
import { academyCorpus } from "../generated/academy-corpus.generated";

describe("Academy generated repository", () => {
  it("reads pilot generated content through the repository boundary", () => {
    const repository = createAcademyCorpusRepository(academyCorpus);

    expect(repository.getArticleBySlug("introduction")?.metadata.title).toBe(
      "Mon premier brassin : le guide pour débuter",
    );
    expect(repository.getArticleBySlug("houblons")?.metadata.title).toBe(
      "IBU et houblon : comprendre l'amertume d'une bière",
    );
    expect(repository.getGlossaryTermBySlug("ibu")?.label).toBe("IBU");
    expect(repository.listCalculatorSlugs()).toEqual([
      "fermentescibles",
      "houblons",
      "couleur",
      "levures",
      "carbonatation",
      "eau",
      "rendement",
      "avances",
    ]);
  });

  it("keeps generated draft articles out of published reads and search", () => {
    expect(
      listPublishedAcademyArticlesUseCase(generatedAcademyRepository).map(
        (article) => article.slug,
      ),
    ).toEqual([
      "histoire",
      "introduction",
      "houblons",
      "levures",
      "eau",
      "fermentescibles",
      "couleur",
      "carbonatation",
      "rendement",
      "avances",
      "glossaire",
    ]);
    expect(
      searchAcademy(generatedAcademyRepository, "draft-only").map(
        (result) => result.id,
      ),
    ).toEqual([]);
  });
});
