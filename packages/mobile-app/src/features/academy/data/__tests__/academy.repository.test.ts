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
      "Introduction au brassage",
    );
    expect(repository.getArticleBySlug("houblons")?.metadata.title).toBe(
      "Houblons",
    );
    expect(repository.getGlossaryTermBySlug("ibu")?.label).toBe("IBU");
    expect(repository.listCalculatorSlugs()).toEqual([
      "houblons",
      "levures",
      "eau",
      "fermentescibles",
      "couleur",
      "carbonatation",
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
