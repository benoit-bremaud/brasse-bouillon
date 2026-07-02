# Brewing Academy Design Pack

## Status

Draft implementation design for the Brewing Academy knowledge base refactor.

## Purpose

This pack turns the product framing and UML study into coding-ready guidance.
The implementation phase should use it as the reference contract before writing
or reviewing code.

Related documents:

- `docs/product/academy/academy-knowledge-base-framing.md`
- `docs/architecture/decisions/0023-brewing-academy-knowledge-base.md`
- `docs/architecture/traceability-matrix.md`
- `docs/architecture/diagrams/academy/00-overview.md`
- `docs/architecture/diagrams/academy/10-implementation-notes.md`
- `docs/project-management/definition-of-ready.md`
- `docs/project-management/definition-of-done.md`

## Target Outcome

The Brewing Academy becomes a versioned, validated, mobile-first knowledge base:

- content is authored as Markdown with strict front matter;
- the mobile app consumes generated typed payloads;
- articles, glossary, calculators, search, and future chatbot retrieval share
  one coherent domain model;
- hardcoded article JSX is treated as legacy and phased out;
- the first implementation ships a high-quality vertical slice for `houblons`,
  `levures`, and `eau`.

## Design Pack Index

1. [Requirements matrix](requirements-matrix.md)
2. [Architecture decisions](architecture-decisions.md)
3. [Domain contracts](domain-contracts.md)
4. [Business rules](business-rules.md)
5. [UX flows](ux-flows.md)
6. [Content pipeline](content-pipeline.md)
7. [Test strategy](test-strategy.md)
8. [Security and RGPD](security-and-rgpd.md)
9. [Migration plan](migration-plan.md)

## Non-Negotiable Constraints

- No new hardcoded Academy article content in React Native screens.
- No `any` TypeScript type.
- No default exports.
- No inline styles in React Native screens.
- No hardcoded colors, spacing, or typography values.
- No chatbot answer without source support in the future assistant.
- No persistent chatbot history in V1.
- No database or CMS in Academy V1 unless a later ADR supersedes this pack.

## Implementation Principles

- Clean Architecture: domain contracts do not depend on React Native, Expo
  Router, generated files, or markdown parsing libraries.
- SOLID: renderers depend on content block abstractions, not article slugs.
- KISS: the V1 ships three excellent pilot articles before expanding scope.
- YAGNI: vector search, CMS, backend publishing, quizzes, and chatbot UI are
  deferred.
- DRY: one glossary model, one source registry, one link resolver, one content
  block model.
- Design patterns are used only when they reduce coupling, improve testability,
  or clarify a real responsibility.

## Recommended PR Split

1. Documentation and design pack.
2. Domain contracts and schema validation.
3. Markdown content generator.
4. Mobile renderer and pilot articles.
5. Hub/search UX.
6. Calculator/article bidirectional links.
7. Future chatbot retrieval preparation, if still desired.

## Academy Addendum To Definition Of Ready

The global Definition of Ready remains
`docs/project-management/definition-of-ready.md`. For Academy coding stories,
the following extra checks apply.

An Academy coding story is ready only when:

- the affected domain contracts are identified;
- the source content format is known;
- the generated payload shape is known;
- routing expectations are explicit;
- acceptance criteria are testable;
- mobile and tablet states are defined;
- security, RGPD, accessibility, and source requirements are checked.

## Academy Addendum To Definition Of Done

The global Definition of Done remains
`docs/project-management/definition-of-done.md`. For Academy implementation
work, the following extra checks apply.

An Academy implementation story is done only when:

- typecheck passes;
- existing tests pass;
- new tests cover new domain, generator, renderer, or navigation behavior;
- no `any` is introduced;
- no article content is hardcoded in screens;
- invalid content fails generation with actionable errors;
- article screens handle loading, empty, invalid slug, and render states;
- accessible labels or image alternative text exist where needed;
- links to glossary, articles, and calculators resolve through one resolver;
- source-sensitive content cannot be published without source metadata.
