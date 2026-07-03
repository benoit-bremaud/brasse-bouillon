import {
  listPublishedAcademyArticlesUseCase,
  searchAcademy,
} from "../../application";
import { createAcademyCorpusRepository, generatedAcademyRepository } from "../";
import { academyCorpus } from "../generated/academy-corpus.generated";

describe("Academy generated repository", () => {
  it("reads pilot generated content through the repository boundary", () => {
    const repository = createAcademyCorpusRepository(academyCorpus);

    expect(repository.getArticleBySlug("houblons")?.metadata.title).toBe(
      "Houblons",
    );
    expect(repository.getGlossaryTermBySlug("ibu")?.label).toBe("IBU");
    expect(repository.listCalculatorSlugs()).toEqual([
      "houblons",
      "levures",
      "eau",
    ]);
  });

  it("keeps generated draft articles out of published reads and search", () => {
    expect(
      listPublishedAcademyArticlesUseCase(generatedAcademyRepository).map(
        (article) => article.slug,
      ),
    ).toEqual(["houblons"]);
    expect(
      searchAcademy(generatedAcademyRepository, "levures").map(
        (result) => result.id,
      ),
    ).toEqual([]);
  });
});
