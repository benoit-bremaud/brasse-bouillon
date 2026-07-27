import fs from "node:fs";
import path from "node:path";

import { academyCorpus } from "../../generated/academy-corpus.generated";
import { validateAcademySourceCorpus } from "../../source";
import {
  academyArticlePaths,
  academyCalculatorSlugs,
  generateAcademyContentFiles,
  parseAcademyGlossaryYaml,
  parseAcademyMarkdownArticle,
  parseAcademySourcesYaml,
} from "../";

const repoRoot = path.resolve(process.cwd(), "../..");
const academyDocsRoot = path.join(repoRoot, "docs/academy");

describe("Academy docs corpus", () => {
  it("keeps the committed generated corpus aligned with docs/academy sources", () => {
    const articles = academyArticlePaths.map((relativePath) => {
      const absolutePath = path.join(academyDocsRoot, relativePath);
      const result = parseAcademyMarkdownArticle(
        `docs/academy/${relativePath}`,
        fs.readFileSync(absolutePath, "utf8"),
      );

      expect(result.errors).toEqual([]);
      expect(result.value).not.toBeNull();

      return result.value;
    });

    const sources = parseAcademySourcesYaml(
      "docs/academy/sources/references.yml",
      fs.readFileSync(
        path.join(academyDocsRoot, "sources/references.yml"),
        "utf8",
      ),
    );
    const glossaryTerms = parseAcademyGlossaryYaml(
      "docs/academy/glossary/terms.yml",
      fs.readFileSync(path.join(academyDocsRoot, "glossary/terms.yml"), "utf8"),
    );

    expect(sources.errors).toEqual([]);
    expect(sources.value).not.toBeNull();
    expect(glossaryTerms.errors).toEqual([]);
    expect(glossaryTerms.value).not.toBeNull();

    const sourceCorpus = {
      articles: articles.filter((article) => article !== null),
      glossaryTerms: glossaryTerms.value ?? [],
      sources: sources.value ?? [],
      calculatorSlugs: academyCalculatorSlugs,
    };
    const validation = validateAcademySourceCorpus(sourceCorpus);

    expect(validation.issues).toEqual([]);
    expect(validation.corpus).toEqual(academyCorpus);

    const generation = generateAcademyContentFiles(sourceCorpus);
    const generatedJson = generation.files.find((file) =>
      file.path.endsWith(".json"),
    );

    expect(generation.errors).toEqual([]);
    expect(generatedJson).toBeDefined();
    expect(
      fs.readFileSync(
        path.join(repoRoot, generatedJson?.path ?? "missing.json"),
        "utf8",
      ),
    ).toBe(generatedJson?.content);
  });
});
