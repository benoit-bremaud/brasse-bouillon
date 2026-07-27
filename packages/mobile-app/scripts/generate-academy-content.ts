import fs from "node:fs";
import path from "node:path";

import { format } from "prettier";

import {
  academyArticlePaths,
  academyCalculatorSlugs,
  generateAcademyContentFiles,
  parseAcademyGlossaryYaml,
  parseAcademyMarkdownArticle,
  parseAcademySourcesYaml,
} from "../src/features/academy/data/generation";
import { AcademySourceArticle } from "../src/features/academy/data/source";

const repositoryRoot = path.resolve(process.cwd(), "../..");
const academyDocsRoot = path.join(repositoryRoot, "docs/academy");
const checkOnly = process.argv.includes("--check");

function readAcademySourceCorpus() {
  const articleResults = academyArticlePaths.map((relativePath) => {
    const absolutePath = path.join(academyDocsRoot, relativePath);

    return parseAcademyMarkdownArticle(
      `docs/academy/${relativePath}`,
      fs.readFileSync(absolutePath, "utf8"),
    );
  });
  const sourceResult = parseAcademySourcesYaml(
    "docs/academy/sources/references.yml",
    fs.readFileSync(
      path.join(academyDocsRoot, "sources/references.yml"),
      "utf8",
    ),
  );
  const glossaryResult = parseAcademyGlossaryYaml(
    "docs/academy/glossary/terms.yml",
    fs.readFileSync(path.join(academyDocsRoot, "glossary/terms.yml"), "utf8"),
  );
  const errors = [
    ...articleResults.flatMap((result) => result.errors),
    ...sourceResult.errors,
    ...glossaryResult.errors,
  ];

  if (
    errors.length > 0 ||
    sourceResult.value === null ||
    glossaryResult.value === null ||
    articleResults.some((result) => result.value === null)
  ) {
    throw new Error(errors.join("\n") || "Academy source parsing failed.");
  }

  return {
    articles: articleResults
      .map((result) => result.value)
      .filter((article): article is AcademySourceArticle => article !== null),
    sources: sourceResult.value,
    glossaryTerms: glossaryResult.value,
    calculatorSlugs: academyCalculatorSlugs,
  };
}

async function runAcademyGenerator() {
  const result = generateAcademyContentFiles(readAcademySourceCorpus());

  if (result.errors.length > 0) {
    throw new Error(result.errors.join("\n"));
  }

  const staleFiles: string[] = [];

  for (const file of result.files) {
    const absolutePath = path.join(repositoryRoot, file.path);
    const expectedContent = file.path.endsWith(".ts")
      ? await format(file.content, { filepath: absolutePath })
      : file.content;

    if (checkOnly) {
      const committedContent = fs.existsSync(absolutePath)
        ? fs.readFileSync(absolutePath, "utf8")
        : null;

      if (committedContent !== expectedContent) {
        staleFiles.push(file.path);
      }
      continue;
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, expectedContent, "utf8");
  }

  if (staleFiles.length > 0) {
    throw new Error(
      [
        "Generated Academy files are stale:",
        ...staleFiles.map((filePath) => `- ${filePath}`),
        "Run npm -w packages/mobile-app run academy:generate.",
      ].join("\n"),
    );
  }

  process.stdout.write(
    checkOnly
      ? "Academy generated files are up to date.\n"
      : `Generated ${result.files.length} Academy files.\n`,
  );
}

void runAcademyGenerator().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
