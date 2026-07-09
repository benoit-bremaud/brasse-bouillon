import fs from "node:fs";
import path from "node:path";

import { academyCorpus } from "../../generated/academy-corpus.generated";
import {
  parseAcademyGlossaryYaml,
  parseAcademyMarkdownArticle,
  parseAcademySourcesYaml,
} from "../academy-markdown-parser";
import { validateAcademySourceCorpus } from "../../source";

const repoRoot = path.resolve(process.cwd(), "../..");
const academyDocsRoot = path.join(repoRoot, "docs/academy");

const articlePaths = [
  "getting-started/introduction.md",
  "ingredients/houblons.md",
  "ingredients/levures.md",
  "water/eau.md",
  "ingredients/fermentescibles.md",
  "process/couleur.md",
  "process/carbonatation.md",
  "process/rendement.md",
  "process/avances.md",
  "glossary/glossaire.md",
] as const;

describe("Academy docs corpus", () => {
  it("keeps the committed generated corpus aligned with docs/academy sources", () => {
    const articles = articlePaths.map((relativePath) => {
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

    const validation = validateAcademySourceCorpus({
      articles: articles.filter((article) => article !== null),
      glossaryTerms: glossaryTerms.value ?? [],
      sources: sources.value ?? [],
      calculatorSlugs: academyCorpus.calculatorSlugs,
    });

    expect(validation.issues).toEqual([]);
    expect(validation.corpus).toEqual(academyCorpus);
  });
});
