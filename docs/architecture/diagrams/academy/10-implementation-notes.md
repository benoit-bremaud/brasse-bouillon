# Implementation notes - Academy knowledge base V1

> **Feature**: implementation guidance derived from the UML study.

## Preferred Package Shape

The current code places Academy screens under `features/tools`. The refactor can
start conservatively by reusing routes and gradually introducing a cleaner
Academy boundary.

Target mobile shape:

```text
packages/mobile-app/src/features/academy/
  domain/
    academy.types.ts
    glossary.types.ts
  data/
    generated/
      academy-index.generated.ts
      articles/
      glossary.generated.ts
      search-index.generated.ts
    academy.repository.ts
  application/
    academy.use-cases.ts
    academy-search.use-cases.ts
    academy-link-resolver.ts
  presentation/
    AcademyHubScreen.tsx
    AcademyArticleScreen.tsx
    AcademyArticleRenderer.tsx
    AcademySearchResults.tsx
    GlossaryTermModal.tsx
```

If moving files in one PR is too broad, the first implementation may keep route
files in place and introduce the new feature boundary incrementally.

## Clean Architecture Guardrails

Clean Architecture applies to the Academy where it creates useful boundaries:

- `domain/` contains framework-agnostic entities, value objects, literal unions,
  and discriminated unions.
- `application/` contains use cases, ports, link resolution contracts, search
  contracts, and presenter/view-model preparation.
- `data/` contains generated payloads and adapters that implement application
  ports.
- `presentation/` contains React Native screens, renderers, modal components,
  and view state.

Dependency rule:

```text
presentation -> application -> domain
data adapter -> application ports -> domain
```

Forbidden dependencies:

- `domain/` importing React Native, Expo Router, Markdown parser, generated
  files, or storage APIs.
- `application/` importing React Native screens or Expo Router APIs directly.
- `presentation/` importing Markdown source files or parsing raw content.
- screens importing generated article files directly instead of using a
  repository/use-case boundary.

## Routing Notes

The Academy should follow Expo Router conventions already used by the mobile
app.

- Prefer canonical app routes such as `/(app)/academy/[slug]` and
  `/(app)/tools/[slug]/calculator` when the implementation phase defines final
  route names.
- Use dynamic route parameters for article, glossary, and calculator slugs
  instead of building paths through string concatenation in screens.
- Use `Link asChild` when a card, chip, or custom `Pressable` acts as a link,
  because `Link` renders text-oriented children by default.
- Keep route resolution inside `AcademyLinkResolver`; screens should request an
  action for a semantic link target.
- Treat prefetch as an optimization only. Expo Router preloaded screens have
  restrictions before navigation, so loaders and analytics must work correctly
  without depending on prefetch.

## Design Patterns Guidance

Use design patterns when they reduce coupling, improve testability, or clarify a
business responsibility. Do not introduce a pattern only to make the architecture
look more formal.

Recommended patterns for the Academy implementation:

- `Repository`: expose article, glossary, search index, and source data through
  stable read APIs. Screens and use cases should not import generated files
  directly.
- `Adapter`: convert Markdown/front matter, YAML, or generated payloads into the
  domain contracts consumed by the app.
- `Factory` or `Builder`: create validated `AcademyContentBlock[]` structures
  from parsed content during generation.
- `Strategy`: isolate search behavior so V1 lexical search can later evolve
  toward hybrid or retrieval-backed search without rewriting screens.
- `Resolver`: centralize article, glossary, calculator, and app-context links in
  `AcademyLinkResolver`.
- `Presenter` or view model: prepare dense mobile article and hub data for UI
  components without leaking business rules into React Native views.
- `Specification`: express validation rules such as required sources for
  sensitive content, allowed article states, and valid bidirectional links.
- `Template Method`: structure the content generation pipeline only if the
  implementation needs a repeatable sequence of read, parse, validate, generate,
  and index steps.

Pattern usage must remain concrete. If a pattern adds files without removing
real duplication or coupling, keep the simpler implementation.

## Content Source Shape

Recommended source structure:

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

The exact glossary/source file format can be decided in the technical plan. The
important constraint is that article references validate against one central
glossary and one source registry.

## Generator Shape

Recommended script responsibilities:

1. Read Markdown and structured glossary/source files.
2. Parse front matter.
3. Validate schemas and enums.
4. Validate links.
5. Normalize article blocks.
6. Generate mobile TypeScript payloads.
7. Generate local search entries.
8. Optionally generate retrieval chunks for future chatbot.

The generator should fail with actionable errors. It should not silently drop
invalid links or unsupported blocks.

## Renderer Shape

The renderer should accept `AcademyContentBlock[]` and render by block type.

It should not:

- Switch on article slug.
- Import article-specific components.
- Parse raw Markdown at runtime.
- Hardcode calculator routes outside the link resolver.

Image blocks should expose accessible text through React Native `Image` `alt`
where available. Interactive controls should use meaningful accessibility labels
and hints when the visible text is not enough.

## V1 Test Focus

Minimum tests for the pilot slice:

- Hub renders generated pilot cards.
- Search returns article and glossary results.
- Article screen renders a generated article.
- Invalid slug renders a controlled empty state.
- Calculator CTA routes to the expected calculator.
- Calculator screen links back to the related Academy article.
- Glossary reference resolves from central glossary data.
- Sensitive article metadata requires source metadata.

## Commit Strategy

Recommended implementation commit sequence:

1. `docs(academy): frame knowledge base direction`
2. `docs(academy): add knowledge base UML study`
3. `feat(academy): add content domain contracts`
4. `feat(academy): add markdown content generator`
5. `feat(academy): render generated pilot articles`
6. `feat(academy): refactor academy hub search`
7. `test(academy): cover generated content flows`

Each commit should keep a coherent review boundary.

## PR Strategy

Do not open a PR until explicitly validated by the user.

Recommended PR split:

1. Documentation and UML design only.
2. Content schema and generator.
3. Mobile renderer and pilot articles.
4. Hub/search UX.
5. Future chatbot preparation artifacts, if still desired.

## Open Technical Decisions

- Whether generated files are committed or produced in CI.
- Whether Markdown is parsed by a Node script or a TypeScript build tool.
- Whether source/glossary registries use YAML, JSON, or Markdown front matter.
- Whether retrieval chunks are generated in V1 or deferred until chatbot work.
- Whether the Academy feature gets moved out of `features/tools` immediately or
  through a staged migration.
