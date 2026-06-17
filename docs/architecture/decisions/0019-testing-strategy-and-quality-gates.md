# ADR-0019 — Testing strategy: the test pyramid, e2e tooling per surface, and CI quality gates

**Status**  Proposed
**Date**    2026-06-17
**Owners**  @benoit-bremaud

> Formalizes the project's testing approach as a contract. The codebase already
> has a rich unit/component base but **no written strategy**, an **empty e2e top**
> (no mobile or browser e2e, no e2e on the matcher v2 endpoint), **non-blocking**
> coverage, and — now that the repo is **public** — **no security scanning in CI**.
> This ADR fixes the binding decisions; the living detail lives in
> [`../../testing/testing-strategy.md`](../../testing/testing-strategy.md) (the
> "how"), the same way ADR-0016 pairs with its sequence diagram.

---

## Context

- **No unified testing strategy exists.** Conventions are scattered across the
  Definition of Done, `CONTRIBUTING.md`, and each package's `CLAUDE.md`
  (happy/sad/edge, "tests mandatory"), but there is no single document describing
  the test pyramid, coverage targets, or the e2e approach. New contributors (and
  review agents) have no contract to check against.
- **The e2e top of the pyramid is nearly empty.** Measured state:
  - **api** (NestJS): 88 unit specs + **5 e2e** (Jest + Supertest, in-memory
    SQLite + migrations) — but **no e2e on `POST /recipes/match`**, the matcher v2
    scoring just shipped (ADR-0016). A regression there silently re-breaks the
    "Leffe Blonde → Saison/NEIPA" bug the v2 redesign fixed.
  - **mobile-app** (Expo/RN): 99 Jest + React Native Testing Library files
    (use-cases, mappers, screens) — but **zero device/UI e2e** (no Detox, no
    Maestro). The core journey (scan → fiche → equivalents) is only asserted at
    component level with mocked use-cases.
  - **beer-encyclopedia** (FastAPI): 18 pytest files (routers, DB, seeds) — but the
    **ML pipeline is untested** except OCR (`ml/infer`, `ml/pipeline`,
    `ml/extract`).
  - **website**: 9 structural checks (`scripts/quality_gate.py`) — **no browser
    smoke test** that the page actually renders and the feedback form posts.
- **Coverage is collected but never enforced.** CI generates lcov for all three
  code packages and warns at `< 70%`, but the warning is **non-blocking**; no
  `coverageThreshold` is set anywhere. Coverage can silently rot.
- **The repo is public and CI has no security scanning.** Since the public switch,
  Actions run free, but the only security job is a non-blocking `npm audit`. There
  is **no gitleaks, no CodeQL, no dependency-review** — a gap that matters more now
  that the ~157 Dependabot advisories are publicly visible.
- **Of the eight browser e2e tools surveyed** (TestCafe, Puppeteer, Playwright,
  PhantomJS, Selenium, Cucumber, Testim, Cypress), **only browser tools apply, and
  only to the website** — the mobile app is React Native (native, not a browser),
  so it needs a mobile-specific runner (Maestro/Detox), not anything on that list.

---

## Decision

Adopt a written, pyramid-shaped testing strategy with package-appropriate e2e
tooling and **enforced** CI quality gates.

### D1 — Adopt the test pyramid as the shape

Many fast **unit** tests at the base (pure logic, services, use-cases, mappers); a
middle band of **integration** tests (API↔DB, screen↔use-case, router↔DB); a thin
top of **e2e** tests covering the **real, high-risk journeys only** — never an
inverted pyramid of slow end-to-end checks. Each new feature lands tests at the
lowest layer that can meaningfully assert its behaviour (happy/sad/edge,
unchanged). The per-package layer mapping is in the strategy doc.

### D2 — One e2e tool per surface, chosen for the surface

| Surface | e2e tool | Rationale |
|---|---|---|
| **api** (NestJS) | **Supertest** (Jest) | Already in use (5 e2e specs); boots the Nest app on in-memory SQLite with migrations. No new tooling. |
| **mobile-app** (Expo/RN) | **Maestro** | React Native is native, not a browser — browser tools cannot drive it. Maestro's YAML flows are lower-friction than Detox for a solo Expo project. |
| **website** (static) | **Playwright** | The only surface a browser e2e tool fits. Playwright over Cypress/Selenium: multi-browser, auto-wait, first-class TypeScript, lightweight for a static site. |
| **beer-encyclopedia** (FastAPI) | **pytest** | Already in use; HTTP exercised via `TestClient`. Extend to the untested ML pipeline. |

### D3 — Coverage becomes a blocking CI gate, via a ratchet

Replace the non-blocking `< 70%` warning with an **enforced** per-package
threshold that **never decreases** (a ratchet): set the floor at the **currently
measured** coverage, fail CI if a PR drops below it, and raise the floor in steps
toward the long-term targets (api/mobile **80%**, encyclopedia **75%**). Setting an
honest floor first (KISS) avoids an across-the-board failure on the first run.

### D4 — Public-repo security scanning is mandatory in CI

Add the security baseline that a public repo warrants: **gitleaks** (secret
scanning, honouring the existing `.gitleaksignore`), **CodeQL** (SAST for
JS/TS), and **dependency-review** on PRs. This complements (does not replace) the
existing `npm audit` job and the local/manual SonarQube analysis.

---

## Consequences

### Positive

- A single contract reviewers (and review agents) can cite, the same way ADRs
  0001–0018 are cited — testing stops being tribal knowledge.
- The matcher v2 scoring (ADR-0016) gains a regression guard at the HTTP boundary;
  the mobile scan journey and the website get their first real e2e safety net.
- Coverage can no longer silently rot; the ratchet makes "tests mandatory" (DoD)
  actually enforceable instead of advisory.
- The public repo gets a defensible security posture in CI.

### Trade-offs

- **New tooling to learn and host in CI** (Maestro, Playwright) — mitigated by
  starting with a single smoke flow each, and by deferring device-farm/emulator
  e2e (see strategy doc out-of-scope).
- **A blocking coverage gate can block legitimate PRs** if set too high — mitigated
  by the ratchet (floor at current, raised deliberately), not a hard 80% on day one.
- CodeQL/Maestro/Playwright add CI minutes — acceptable now that the repo is public
  (Actions are free).

### Rejected alternatives

- **No document, tool e2e ad hoc.** Contradicts the project's conception-first
  discipline (conception = contract); leaves the same gap this ADR closes.
- **Detox for mobile e2e.** Heavier setup (native build, device/emulator
  orchestration) than a solo pre-public project needs; Maestro covers the journey
  with far less ceremony. Revisit if native-module depth demands it.
- **Cypress/Selenium for the website.** Cypress is single-origin/heavier and
  Selenium is verbose/flaky for a tiny static site; Playwright is the lighter,
  more capable fit. (Puppeteer is not a test framework; Cucumber is a BDD layer,
  not a runner; TestCafe is declining; Testim is commercial; PhantomJS is
  abandoned.)
- **Keep coverage as a warning.** Non-enforcement is why coverage drifts; a ratchet
  is the minimal enforcement that does not punish the current baseline.

---

## Realization

Tracked by a dedicated **"Testing strategy realization" epic** (one issue per
surface + one for the CI gates). The living detail — the pyramid diagram,
per-package layer/target table, the ratchet policy, target CI shape, and
consolidated conventions — is maintained in
[`docs/testing/testing-strategy.md`](../../testing/testing-strategy.md). The
config changes (`coverageThreshold`, new CI jobs, security workflows) are
**implemented in the backlog issues**, not in this conception PR.

## Relation to other ADRs

- **Guards ADR-0016** (matcher v2): the `POST /recipes/match` e2e is the regression
  net for the scoring this ADR's epic adds.
- **Aligns with ADR-0001** (build for today): one smoke flow per surface now,
  device-farm/visual-regression deferred until justified.
- **Consistent with ADR-0013** (conception is the contract): the strategy doc is
  the contract the test code must satisfy.
