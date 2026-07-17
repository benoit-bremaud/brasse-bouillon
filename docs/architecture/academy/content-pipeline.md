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

## Legacy Migration Inventory

This inventory tracks the remaining front-side Academy content that must move
toward the generated knowledge base, then later toward a backend-driven source.
It is based on `packages/mobile-app/src/features/tools/data/academy.data.ts`.

The target rule is:

- article/reference content moves out of React screens and legacy topic data;
- calculator UI and calculation engines stay in the mobile tool feature until a
  separate backend contract is designed for calculators;
- navigation labels, icons, and routing stay in the front end;
- generated Academy content becomes the primary read source for migrated
  topics;
- legacy topic metadata is only a temporary bridge for unmigrated topics and
  calculator routing.

| Topic slug        | Current legacy role                | Generated source status                                           | Migration priority  | Target treatment                                                                            |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| `houblons`        | Topic metadata + calculator bridge | Published pilot article in `docs/academy/ingredients/houblons.md` | Done for article V1 | Keep calculator route in tools; continue enriching article content from generated source.   |
| `levures`         | Topic metadata + calculator bridge | Draft source in `docs/academy/ingredients/levures.md`             | High                | Promote article after review/sourcing; keep calculator route in tools.                      |
| `eau`             | Topic metadata + calculator bridge | Draft source in `docs/academy/water/eau.md`                       | High                | Promote only after sensitive chemical-dosage review; keep calculator route in tools.        |
| `introduction`    | Coming-soon topic metadata         | Not migrated                                                      | High                | Create a beginner reference article that anchors the Academy learning map.                  |
| `fermentescibles` | Topic metadata + calculator bridge | Not migrated                                                      | Medium              | Create density/alcohol article; keep calculator route in tools.                             |
| `carbonatation`   | Topic metadata + calculator bridge | Not migrated                                                      | Medium              | Create packaging/carbonation article with safety review.                                    |
| `couleur`         | Topic metadata + calculator bridge | Not migrated                                                      | Medium              | Create color/SRM/EBC article; keep calculator route in tools.                               |
| `rendement`       | Topic metadata + calculator bridge | Not migrated                                                      | Medium              | Create process efficiency article; keep calculator route in tools.                          |
| `histoire`        | Topic metadata                     | Published article in `docs/academy/history/histoire.md`           | Done for article V1 | Continue enriching the cultural/history article from generated source.                      |
| `avances`         | Topic metadata + calculator bridge | Not migrated                                                      | Low                 | Split into several advanced reference articles instead of one broad article if scope grows. |
| `glossaire`       | Coming-soon topic metadata         | Partial registry in `docs/academy/glossary/terms.yml`             | High                | Replace placeholder with generated glossary browsing/search once enough terms exist.        |

Recommended migration order:

1. `introduction`, because it frames the Academy as a reference base for novice
   users.
2. `levures`, because a draft already exists and it is central to brewing
   comprehension.
3. `eau`, because a draft exists but requires stricter review and sourcing.
4. `glossaire`, because it supports both article reading and future chatbot
   retrieval.
5. Calculator-backed references: `fermentescibles`, `carbonatation`, `couleur`,
   `rendement`.
6. Lower-priority reference expansion: `avances`.

The migration is complete only when the Academy hub and details screens no
longer need legacy article descriptions for migrated topics. Legacy calculator
metadata can remain until calculator discovery has its own backend-driven
contract.

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

Generated output:

```text
packages/mobile-app/src/features/academy/data/generated/
  academy-corpus.generated.ts
```

The generator emits a single `academy-corpus.generated.ts` exporting one
`academyCorpus: AcademyCorpus` constant with four top-level collections:

```text
academyCorpus
  articles          // parsed articles: metadata + sectioned content blocks
  glossaryTerms     // glossary entries: definitions, aliases, related terms
  sources           // resolved bibliographic references
  calculatorSlugs   // calculator bridges referenced by articles
```

The file carries a `Do not edit manually` header and is regenerated from
`docs/academy`; a per-article / search-index / retrieval-chunk split remains a
possible future optimization if the single corpus grows too large.

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
