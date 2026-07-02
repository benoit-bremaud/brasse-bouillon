# Brewing Academy Content Pipeline

## Pipeline Goal

The pipeline transforms editorial source files into validated mobile-ready
payloads. It must fail loudly on broken content.

```text
Markdown + registries
  -> read source files
  -> parse front matter
  -> validate schemas
  -> validate links and source references
  -> normalize content blocks
  -> generate typed payloads
  -> generate search index
  -> optionally generate retrieval chunks for future chatbot
```

## Source Inputs

Recommended structure:

```text
docs/academy/
  ingredients/
    houblons.md
    levures.md
  water/
    eau.md
  glossary/
    terms.yml
  sources/
    references.yml
```

## Validation Phases

### Phase 1 - File Discovery

- Detect article Markdown files.
- Detect glossary registry.
- Detect source registry.
- Fail if expected pilot files are missing for V1.

### Phase 2 - Front Matter Validation

- Required fields are present.
- Enums are valid.
- Dates use ISO format.
- Reading time is positive.
- Slug matches file or configured canonical slug rule.
- Published articles include summary, tags, update date, and review metadata.
- Editorial front matter uses snake_case; generated TypeScript payloads use
  camelCase. The generator owns this mapping and validates both sides through
  schemas. The source `slug` is promoted to `AcademyArticle.slug` in generated
  payloads to avoid duplicated slug state.

### Phase 3 - Body Parsing

- Convert Markdown into controlled block families.
- Reject arbitrary embedded React.
- Reject unsupported custom blocks.
- Preserve stable section IDs.

### Phase 4 - Link Validation

- Article references resolve.
- Section references resolve.
- Glossary references resolve.
- Calculator slugs are known.
- Source IDs resolve.
- Bidirectional calculator relationships are checked where required.

### Phase 5 - Source And Safety Validation

- Sensitive articles require source metadata.
- Sensitive formula, safety, sanitation, fermentation health, and chemical
  guidance must carry source support.
- Unsupported risk topics fail validation.

### Phase 6 - Generation

Generated outputs:

```text
packages/mobile-app/src/features/academy/data/generated/
  academy-index.generated.ts
  articles/
    houblons.generated.ts
    levures.generated.ts
    eau.generated.ts
  glossary.generated.ts
  search-index.generated.ts
```

Future optional output:

```text
retrieval-chunks.generated.ts
```

## Error Quality

Generator errors must be actionable:

- file path;
- article slug;
- section ID if relevant;
- invalid field;
- expected value or known choices;
- suggested fix when obvious.

Example:

```text
docs/academy/ingredients/houblons.md
Invalid related_glossary_terms[1]: "alpha-acid"
Known terms include: "alpha-acids", "ibu", "dry-hop"
```

## Design Patterns In Pipeline

- `Adapter`: source parser adapts Markdown/YAML into raw content objects.
- `Specification`: validation rules are isolated and testable.
- `Factory` or `Builder`: validated raw blocks become `AcademyContentBlock`
  values.
- `Template Method`: useful only if the generator pipeline becomes complex
  enough to justify a fixed sequence.

## CI Expectations

At minimum, CI should eventually run:

- content validation;
- typecheck;
- generator deterministic output check;
- renderer tests;
- link resolution tests.
