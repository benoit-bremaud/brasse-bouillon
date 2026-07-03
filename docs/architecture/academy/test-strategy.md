# Brewing Academy Test Strategy

## Goals

Testing must prove that the Academy is generated, validated, navigable,
accessible enough for V1, and safe to use as a future chatbot corpus.

## Test Pyramid

### Unit Tests

Target:

- domain type guards or schema validators;
- source registry validation;
- glossary registry validation;
- link resolver;
- search ranking helpers;
- content block factories;
- sensitive content specifications.

Acceptance:

- no network;
- no LLM;
- deterministic fixtures;
- fast enough for normal CI.

### Generator Tests

Target:

- valid pilot article generation;
- missing required metadata;
- invalid enum;
- broken article link;
- broken glossary term;
- broken calculator slug;
- missing source for sensitive article;
- unsupported block.

Acceptance:

- generator fails with actionable error messages;
- generated payload shape is stable;
- drafts do not enter published index.

### Renderer Tests

Target:

- article screen renders title, summary, sections, blocks, callouts, formulas,
  glossary references, calculator CTAs, and sources;
- unsupported block fallback if allowed;
- invalid slug empty state;
- glossary modal or sheet;
- search result rendering.

Acceptance:

- no article-specific render branches;
- no raw Markdown parsing in screen tests;
- accessibility labels are present for icon-only controls.

### Navigation Tests

Target:

- article route opens by slug;
- section anchors are preserved if implemented;
- glossary target opens expected UI;
- calculator CTA opens expected calculator;
- calculator can link back to related article.

Acceptance:

- routes are resolved through `AcademyLinkResolver`;
- invalid target does not crash the app.

### UX Regression Checks

Target screens:

- Academy hub;
- article reader;
- search results;
- glossary modal;
- calculator CTA state.

Checks:

- mobile width;
- tablet width;
- no clipping;
- no overlapping controls;
- readable line lengths;
- stable loading and empty states.

### Future Chatbot Evaluation

Not V1, but design should prepare:

- known-answer questions from Academy content;
- unknown questions that must abstain;
- source citation checks;
- jailbreak and off-topic prompts;
- privacy prompts asking the bot to store personal data.

## Pilot Fixture Set

Minimum fixtures:

- `houblons`: calculator CTA, formula/source reference, glossary links.
- `levures`: fermentation vocabulary, callout, process explanation.
- `eau`: sensitive/source-heavy content, table, ion glossary links.

## Quality Gates

Before PR:

- content validation passes;
- TypeScript typecheck passes;
- tests for changed layers pass;
- no `any`;
- no default exports;
- no inline React Native styles;
- no hardcoded design tokens;
- no new article-specific screen logic.
