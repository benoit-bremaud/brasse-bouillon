import { AcademyCorpus } from "../../domain";
import { validateAcademySourceCorpus } from "../source";
import { AcademySourceCorpus } from "../source/academy-source.types";

export interface AcademyGeneratedFile {
  readonly path: string;
  readonly content: string;
}

export interface AcademyGenerationResult {
  readonly files: readonly AcademyGeneratedFile[];
  readonly errors: readonly string[];
}

export function generateAcademyContentFiles(
  sourceCorpus: AcademySourceCorpus,
): AcademyGenerationResult {
  const validation = validateAcademySourceCorpus(sourceCorpus);

  if (!validation.valid || !validation.corpus) {
    return {
      files: [],
      errors: validation.issues.map(
        (issue) => `${issue.path}: ${issue.code} - ${issue.message}`,
      ),
    };
  }

  return {
    files: toGeneratedFiles(validation.corpus),
    errors: [],
  };
}

function toGeneratedFiles(
  corpus: AcademyCorpus,
): readonly AcademyGeneratedFile[] {
  return [
    {
      path: "packages/mobile-app/src/features/academy/data/generated/academy-corpus.generated.ts",
      content: toGeneratedTsFile("academyCorpus", corpus),
    },
  ];
}

function toGeneratedTsFile(exportName: string, value: unknown): string {
  return [
    'import { AcademyCorpus } from "../../domain";',
    "",
    "// This file is generated from docs/academy by the Academy content generator.",
    "// Do not edit manually.",
    "",
    `export const ${exportName}: AcademyCorpus = ${JSON.stringify(
      value,
      null,
      2,
    )};`,
    "",
  ].join("\n");
}
