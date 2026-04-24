# ADR-0001 — Build for today, design for tomorrow

**Status**  Accepted
**Date**    2026-04-24
**Owners**  @benoit-bremaud

---

## Context

The 2026-05-27 defense leaves five weeks of working runway. Two failure
modes threaten this budget:

- **Coding cheaply "for the demo"** — shortcuts that ship in v0.1 and must
  be thrown away in v0.2, creating known-to-be-wasted effort.
- **Over-designing every component** — infrastructure for needs that do not
  exist yet, burning the runway on speculative work that the demo never
  touches.

Independently of the defense context, the owner's product philosophy is to
**write just enough code to solve today's problem, but name and shape it
so tomorrow's feature lands without a refactor**. The morning brainstorms
on the Scan feature (2026-04-24) and the merged `Compte` screen both
cited this principle as their structuring rule. This ADR formalises it as
a project-wide convention, readable by both future-us and the AI agents
(Copilot, Codex) that review every PR on this repository.

---

## Decision

We commit to a five-clause rule that applies to every new piece of code
on the Brasse-Bouillon monorepo.

### The rule — five clauses

1. **Minimal implementation for the immediate need.** No feature flag for
   a feature that does not exist. No lifecycle hook added "in case we
   need it". Ship the code the current user story asks for, not one line
   more.
2. **Naming, types, and contracts anticipate evolution.** Where the
   shape of the domain is already known (source of data, user
   provenance, consent axes), encode it in the type system from day one,
   even if only one variant is used today. Example: `BeerData.source:
   'openfoodfacts' | 'internal' | 'community'` exists at v0.1 even
   though only `'openfoodfacts'` is populated.
3. **Backend endpoints stubbed with `501 Not Implemented`** for deferred
   functions, instead of missing endpoints. The mobile client knows the
   API surface today and keeps working unchanged when the server-side
   body lands.
4. **Components extensible by default.** Stable signature, optional
   props, no fragile private contract. `<SuggestCorrectionLink />` is a
   `mailto:` link in v0.1 and a `<Modal>` form in v0.2 — the call site
   does not change.
5. **One ADR per structural choice**, linked to a migration roadmap
   when the v0.2 shape is known. The ADR becomes the contract between
   v0.1 and v0.2.

### Anti-patterns forbidden

The rule is negatively reinforced by four explicit anti-patterns:

- **Feature flags for non-existent features.** A flag is only legitimate
  when it controls a feature that actually ships. "Just in case" flags
  create dead branches and confusion.
- **Phantom lifecycle hooks.** `onBeforeX` / `onAfterY` callbacks added
  without a real consumer. They widen the API surface without usage.
- **Premature abstraction.** Factoring two similar usages into a generic
  helper. Apply the **rule of three** — three concrete occurrences
  before we consider an abstraction. Two is a coincidence; three is a
  pattern.
- **`TODO v2` comments without a structured trace.** Any deferred work
  must point at a GitHub issue or a dedicated ADR. A bare `// TODO v2`
  comment makes the debt invisible.

### Exceptions tolerated

Three narrowly-scoped exceptions are explicitly tolerated. They exist
because the rule, applied absolutely, would create larger problems than
the ones it solves.

- **Kill switches on demo-critical paths.** The Scan flow can switch to
  a hardcoded mock if the OpenFoodFacts API degrades on defense day.
  The kill switch is a legitimate feature flag because it ships with a
  running feature and its removal is dated.
- **Abstractions imposed by the architecture.** The Clean Architecture
  layering (`domain/` / `data/` / `application/` / `presentation/`)
  does not need per-feature justification. It is a project-wide
  invariant; applying it is not premature abstraction.
- **Dated transient `TODO` markers** in the form
  `// TODO @<initials> <YYYY-MM-DD>: <text>`. The deadline is the
  safety net. A transient TODO without a date or an assignee is
  forbidden.

---

## Consequences

### Positive

- **v0.1 → v0.2 upgrades become linear.** Shapes are already in place;
  the work is to fill them, not to rewrite them.
- **The AI reviewer workflow becomes predictable.** Both Copilot and
  Codex read `CLAUDE.md` (which references this ADR) and flag
  violations — feature flags without a running feature, TODO without a
  trace, generic helpers at the second usage.
- **ADRs accumulate as the contract between milestones.** Each
  structural decision becomes a document a future reader (or agent)
  can grep for instead of reverse-engineering intent from the code.

### Negative

- **Upfront cost on naming and types.** Encoding future variants in
  type unions at v0.1 requires a judgement call the author would not
  otherwise make. Getting it wrong costs a later rename.
- **Discipline required on scope.** The rule can be used to justify
  speculative work ("let's build the community backend now because the
  `source: 'community'` variant is in the type"). The anti-patterns
  and exceptions above are the guard rails.
- **Enforcement depends on reviewer vigilance.** No linter catches
  "premature abstraction" or "TODO without issue link". We rely on
  Copilot / Codex + the human reviewer at PR time.

---

## Enforcement

Enforcement is done at PR-review time, via the AI reviewers already
active on every PR in this repository.

- **Reference in `CLAUDE.md`** — the file already loaded by every agent
  at session start — links this ADR. Copilot and Codex therefore read
  the rule before reviewing each PR.
- **Every PR review** cross-checks the diff against the five clauses,
  the four anti-patterns, and the three exceptions.
- **Disagreements** are resolved inline by the human owner using the
  Must / Should / Nice / Disagree triage documented in the global
  `CLAUDE.md`.

No automated linting rule is added. The anti-patterns are mostly
qualitative (premature abstraction, phantom hooks) and poorly expressed
in AST rules. The cost of a custom ESLint rule set would exceed the
value at project stage v0.1.

---

## Roadmap

- **v0.1 (pre-defense)** — this ADR is the current working rule.
- **v0.2** — when the community backend lands, revisit the `source:
  'community'` variant and the `contributedBy` / `contributedAt` /
  `approvedAt` fields to confirm they still match the actual shape.
- **v0.3+** — if automated linting becomes cost-effective (e.g. via a
  shared AI-review ruleset published by a third party), write an ADR
  that supersedes the "Enforcement" section of this one.

---

## References

- `docs/product/brainstorms/scan-2026-04-24.md` § 4 — cites this
  principle as the structural rule for the Scan feature.
- `docs/product/brainstorms/compte-parametres-2026-04-24.md` § 15 —
  cites this principle as the structural rule for the merged `Compte`
  screen.
- `CLAUDE.md` (root) — where this ADR is referenced for AI-agent
  consumption.
- Michael Nygard, *Documenting Architecture Decisions* (2011) — template.
