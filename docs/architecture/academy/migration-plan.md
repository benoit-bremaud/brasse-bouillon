# Brewing Academy Migration Plan

## Migration Goal

Move from hardcoded React Native Academy content to a generated, validated,
mobile-first knowledge base without breaking existing user flows.

## Current State

- Academy article content is mixed with UI code.
- The Academy lives near tool-related screens.
- Article organization is limited by screen implementation.
- Glossary and source concepts are not yet central enough for future chatbot
  retrieval.

## Target State

- Academy has a clear feature boundary.
- Markdown/front matter is the canonical editorial source.
- Generated typed payloads power mobile screens.
- The article renderer is generic.
- Search and glossary are data-driven.
- Calculator links are bidirectional.
- Future chatbot retrieval can be generated from validated sections.

## Step 1 - Contracts

Create domain contracts for:

- article metadata;
- article body and sections;
- content blocks;
- glossary terms;
- source references;
- link targets;
- search entries;
- future retrieval chunks.

Exit criteria:

- contracts compile;
- no `any`;
- no React Native imports in domain contracts;
- initial fixtures can satisfy the contracts.

## Step 2 - Content Source And Validation

Create source files for pilot articles and registries:

- `houblons`;
- `levures`;
- `eau`;
- glossary terms;
- sources.

Exit criteria:

- invalid metadata fails validation;
- broken links fail validation;
- sensitive missing sources fail validation;
- drafts are excluded from published output.

## Step 3 - Generator

Generate typed content and indexes.

Exit criteria:

- deterministic output;
- generated article payloads;
- generated Academy index;
- generated glossary payload;
- generated search index;
- actionable errors.

## Step 4 - Repository And Use Cases

Add read APIs:

- get published article list;
- get article by slug;
- search Academy;
- get glossary term;
- resolve semantic link target.

Exit criteria:

- screens do not import generated files directly;
- repositories are easy to fake in tests;
- link resolver owns route mapping.

## Step 5 - Article Renderer

Render generic `AcademyContentBlock[]`.

Exit criteria:

- no article-specific render branches;
- blocks render consistently;
- accessibility requirements are covered;
- invalid slug has controlled state.

## Step 6 - Hub And Search UX

Replace hardcoded discovery UI with generated index and search.

Exit criteria:

- hub shows pilot articles;
- search returns articles and glossary terms;
- empty and no-result states are controlled;
- mobile and tablet layouts are checked.

## Step 7 - Calculator Links

Wire bidirectional links between Academy and calculators.

Exit criteria:

- article CTAs open calculators;
- calculators link back to related Academy sections;
- route mapping is tested.

## Step 8 - Legacy Cleanup

Remove or quarantine hardcoded legacy article content after generated content is
validated.

Exit criteria:

- no duplicate source of truth;
- no broken route;
- tests still pass.

## Step 9 - Future Chatbot Preparation

Generate retrieval chunks only if still valuable before chatbot implementation.

Exit criteria:

- chunk IDs stable;
- chunk citations map to article sections and source IDs;
- sensitive chunks carry source metadata;
- no chatbot UI or provider dependency added in this step.

## Rollback Strategy

- Keep the existing Academy route working until generated pilot articles are
  verified.
- Introduce generated content behind a small implementation boundary.
- Avoid deleting legacy content until parity is proven.
- Use focused commits so a failed step can be reverted without losing the whole
  design direction.
