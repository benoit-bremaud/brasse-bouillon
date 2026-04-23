# Contributing to Brasse-Bouillon

Thank you for contributing to Brasse-Bouillon. This guide covers the workflow, conventions, and quality standards for the monorepo.

---

## Prerequisites

- **Node.js** 20.x (see `.nvmrc`)
- **npm** 10+
- **Git** 2.30+

```bash
# Clone and install
git clone git@github.com:benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon
npm install
```

---

## Branching Strategy

We use **trunk-based development** with `main` as the single production branch. Never commit directly to `main`.

### Branch Naming

Every task requires a dedicated branch from `main`:

| Type     | Pattern            | Example                |
| -------- | ------------------ | ---------------------- |
| Feature  | `feat/<scope>`     | `feat/ibu-calculator`  |
| Bug fix  | `fix/<scope>`      | `fix/login-redirect`   |
| Refactor | `refactor/<scope>` | `refactor/http-client` |
| Chore    | `chore/<scope>`    | `chore/update-deps`    |
| Docs     | `docs/<scope>`     | `docs/readme-update`   |

```bash
git checkout main
git pull origin main
git checkout -b feat/my-feature
```

---

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Scope:** the affected area (`auth`, `recipes`, `tools`, `backend`, `frontend`, `monorepo`, `ci`, `sonar`)

Examples:

```
feat(recipes): add recipe duplication use-case
fix(auth): handle expired refresh token gracefully
ci(monorepo): add SonarQube quality gate to CI pipeline
docs(readme): update getting started section
```

### Scopes and package selection (release-please)

**Package selection is driven by the file path touched**, not by the
Conv Commit scope. release-please's `manifest` mode walks each package
directory declared in `release-please-config.json` and only considers
commits whose diff touches files under that path. The scope **does
not bump a package on its own** — if no file inside the package path
changed, the scope has no effect on that package's version.

The scope's job is therefore to describe **semantics + CHANGELOG
classification** (which section the commit lands in), not to force a
release. Use scopes consistent with the file path for clarity.

Conventional scopes for this monorepo:

| Scope                                                                                                                | Typical path touched            | Effect                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `mobile-app`, `scan`, `auth`, `recipes`, `batches`, `ingredients`, `labels`, `shop`, `tools`, `academy`, `dashboard` | `packages/mobile-app/**`        | Bumps `mobile-app` (and `api` via lockstep group "app" if the commit also touches `packages/api/**`)        |
| `api`                                                                                                                | `packages/api/**`               | Bumps `api` (and `mobile-app` via lockstep group "app" if the commit also touches `packages/mobile-app/**`) |
| `website`                                                                                                            | `packages/website/**`           | Bumps `website` independently                                                                               |
| `encyclopedia`                                                                                                       | `packages/beer-encyclopedia/**` | Bumps `encyclopedia` independently                                                                          |
| `ydays`, `root`, `ci`, `monorepo`                                                                                    | anything outside `packages/**`  | No package bump — doc / infra commits only                                                                  |

**Lockstep group "app"**: a single commit that touches files in both
`packages/mobile-app` and `packages/api` will bump both packages to the
same version under a linked release PR.

Bump semantics (release-please computes automatically):

- `feat(<scope>):` → **minor** bump (0.1.0 → 0.2.0)
- `fix(<scope>):` → **patch** bump (0.1.0 → 0.1.1)
- `feat(<scope>)!:` or `BREAKING CHANGE:` in body → **major** bump
  (stays minor while `0.x.y`, per the `bump-minor-pre-major` setting)
- `chore:`, `docs:`, `test:`, `ci:`, `build:`, `style:`, `refactor:`
  → no bump (but `refactor:` + `docs:` appear in the CHANGELOG)

While we ship `v0.1.0-alphaN`, every fix/feat bumps the `alphaN`
counter (`alpha1 → alpha2 → alpha3`). To leave the alpha cycle,
merge a commit with the body `Release-As: 0.1.0-beta1` (or
`0.1.0-rc1`, `0.1.0`) on the release PR.

---

## Release Workflow

Automated via **release-please** ([Google GitHub Action](https://github.com/googleapis/release-please-action))
defined in `.github/workflows/release-please.yml` with the config
in `release-please-config.json` and manifest in
`.release-please-manifest.json`.

### Monorepo grouping (hybrid)

- **Group "app"** (lockstep): `packages/mobile-app` + `packages/api`
  share a single `vX.Y.Z`. A commit touching either package bumps
  both together, tag format `mobile-app-vX.Y.Z` + `api-vX.Y.Z`.
- **Independent**: `packages/website` (tag `website-vX.Y.Z`),
  `packages/beer-encyclopedia` (tag `encyclopedia-vX.Y.Z`). Each
  evolves at its own rhythm.

### Day-to-day flow

1. Work on a feature branch (`feat/<scope>`, `fix/<scope>`, …).
2. Commit with Conventional Commits — release-please reads these
   messages to derive the next version.
3. Open PR, review, merge into `main`.
4. release-please **automatically opens / updates** a release PR
   titled `chore(main): release <package> X.Y.Z` for each affected
   package. Never close it manually.
5. When you want to cut a release:
   - Review the release PR (CHANGELOG entries, version bump)
   - Optionally, add a `Release-As: X.Y.Z` footer commit to force a
     specific version (e.g. transition from alpha to beta)
   - Merge the release PR
   - release-please automatically tags + creates the GitHub Release

### What NOT to do

- **Never `git tag` manually.** All tags are created by release-please.
- **Never bump `package.json` / `app.json` / CHANGELOG by hand.**
  Always let release-please generate the bump via the release PR.
- **Never close a release PR.** Update it via new commits.
- **Never push to `main` directly.** Even release PRs go through the
  PR / merge flow.

### Tag protection

Ruleset `refs/tags/v*` + scoped component tags (`mobile-app-v*`,
`api-v*`, `website-v*`, `encyclopedia-v*`) block **`update`** and
**`deletion`** for everyone except admins. Creation is **not blocked**
so that release-please (running as `github-actions[bot]`) can cut the
release tags automatically on merge of the release PR. The trade-off
and future tightening path (PAT with Integration bypass) are
documented in [.github/tag-protection.md](.github/tag-protection.md).

Result: tags are **immutable once created** (no rewrite, no delete
except by admin emergency bypass), but creation flows freely through
the automation.

### Signing

Tag signing is currently optional (private repo). Becomes **mandatory**
before any public release (see `## Security — Public Release Checklist`
below).

### Pre-soutenance milestone schedule (2026-05-27)

**Milestone-driven with a single final safety cap.** Tag as soon as
the milestone is reached — no date pressure. The only hard cap is
`v0.1.0` on **2026-05-26** (J-1 before soutenance) because the APK
must be installed on the demo phone by then.

Expected sequence (target, no date caps except the last one):

1. `mobile-app-v0.1.0-alpha1` + `api-v0.1.0-alpha1` — audit baseline
   (current, pending tag on first main merge)
2. `v0.1.0-alpha2` — Auth backend wired (B-13 bis resolved)
3. `v0.1.0-alpha3` — Scan pipeline MVP (barcode → match)
4. `v0.1.0-beta1` — feature-complete (scan + Mes Brassins rewrite +
   labels UI bugs fixed)
5. `v0.1.0-rc1` — QA passed, zero known blocking bug
6. `v0.1.0` — **2026-05-26 CAP**, cut + EAS build + APK install

Self-discipline safeguards (no intermediate cap forces the call):

- Auth not wired by 2026-05-10 → pivot to "Connexion démo" only
- Scan still capture-only by 2026-05-17 → simulated recognition
  with hardcoded demo data (jury informed honestly)
- `beta1` not reached by 2026-05-20 → cut remaining features
- `rc1` not reached by 2026-05-24 → panic mode, fix-bugs-only

---

## Issue Types & Templates

Every GitHub issue must use a template. When creating an issue, GitHub will prompt you to pick one.

| Template         | Label             | Title convention                         | When to use                                        |
| ---------------- | ----------------- | ---------------------------------------- | -------------------------------------------------- |
| **User Story**   | `type:user-story` | `feat(<scope>): as <persona>, I want...` | Feature from the user's perspective (INVEST model) |
| **Feature**      | `type:feature`    | `feat(<scope>): <description>`           | Technical task implementing a feature              |
| **Bug Report**   | `type:bug`        | `fix(<scope>): <description>`            | Report a bug or unexpected behavior                |
| **Test**         | `type:test`       | `test(<scope>): <description>`           | Write or improve tests                             |
| **Refactor**     | `type:refactor`   | `refactor(<scope>): <description>`       | Code restructuring, no functional change           |
| **Task / Chore** | `type:chore`      | `chore(<scope>): <description>`          | Config, tooling, dependencies, maintenance         |
| **Epic**         | `type:epic`       | `epic(<scope>): <description>`           | Large body of work grouping User Stories           |

### User Stories & Sub-issues

User Stories follow the **3C model** (Card, Conversation, Confirmation) and the **INVEST** criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable).

A User Story is decomposed into **sub-issues** (GitHub native sub-issues, not Markdown tasklists):

```
Epic (type:epic)
  └── User Story (type:user-story) — value for the user
        ├── Feature (type:feature) — implementation work
        ├── Test (type:test) — validation work
        ├── Bug (type:bug) — defect found during sprint
        └── Docs (type:docs) — documentation work
```

Sub-issues inherit scope labels from their parent. GitHub auto-tracks completion progress on the parent issue.

---

## Labels

All labels use a **prefixed namespace** for consistency.

| Prefix      | Purpose                                | Examples                                                                          |
| ----------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| `priority:` | MoSCoW prioritization                  | `must-have`, `should-have`, `nice-to-have`                                        |
| `size:`     | T-shirt estimation (Fibonacci mapping) | `XS` (1 SP), `S` (2), `M` (3), `L` (5), `XL` (8), `XXL` (13)                      |
| `scope:`    | Which part of the codebase             | `frontend`, `backend`, `charte`, `devops`, `website`, `monorepo`                  |
| `type:`     | Nature of work                         | `feature`, `bug`, `test`, `refactor`, `docs`, `chore`, `ci`, `epic`, `user-story` |
| `sprint:`   | Sprint assignment                      | `sprint:4`, `sprint:5`, `sprint:6`                                                |
| `area:`     | Cross-cutting concern                  | `api`, `security`, `a11y`, `ux`, `architecture`, `theme`                          |
| `epic:`     | Epic tracking                          | `auth`, `recipes`, `batches`, `calculators`, etc.                                 |
| `status:`   | Workflow state                         | `planned`, `in-progress`, `done`                                                  |

**Excluded from daily workflow:** `persona:*` (product design only), `bloc:*` and `ref:*` (deprecated).

---

## Discord Notifications

GitHub events are automatically routed to specialized Discord channels based on `scope:*` labels:

| Discord channel  | Scope label               |
| ---------------- | ------------------------- |
| `#app-mobile`    | `scope:frontend`          |
| `#api-backend`   | `scope:backend`           |
| `#design-system` | `scope:charte`            |
| `#devops`        | `scope:devops`            |
| `#site-vitrine`  | `scope:website`           |
| `#secu-cyber`    | `scope:security`          |
| `#devops`        | `scope:infrastructure`    |
| `#général`       | Fallback (no scope label) |

Notifications display a compact, color-coded embed with: event type, priority, size, scope, sprint, parent reference (for sub-issues), and a clickable title.

---

## Scrum Workflow

- **Sprint duration:** 3 weeks (aligned with Yday cycle)
- **Estimation:** Planning Poker with Fibonacci scale, displayed as T-shirt sizes
- **Priority:** MoSCoW (Must-Have / Should-Have / Nice-to-Have)
- **Ceremonies:** Sprint Planning, async Daily (Discord), Sprint Review, Retrospective
- **Definition of Ready / Done:** see `docs/project-management/`

---

## Development Workflow

### 1. Pick an issue

Assign yourself on the GitHub issue before starting. Check the project board for priority.

### 2. Create a branch

```bash
git checkout -b feat/issue-description main
```

### 3. Make changes

Follow the architecture and code style conventions (see below).

### 4. Run checks locally

```bash
# Mobile App
npm -w packages/mobile-app run ci:check   # lint + typecheck + format
npm -w packages/mobile-app test           # 407 tests

# API
npm -w packages/api run lint:check
npm -w packages/api run build
npm -w packages/api test            # 238 tests

# Or run everything at once
npm run ci:all && npm run test:all
```

### 5. Push and open a PR

```bash
git push -u origin feat/issue-description
```

Create a PR targeting `main` with:

- A clear title following Conventional Commits format
- A summary of what changed and why
- A checklist of acceptance criteria
- `Closes #<issue-number>` in the body

### 6. PR notification comment

After creating the PR, post an **informational comment** that mentions team members for visibility. This is separate from requested reviewers (which remain for blocking reviews).

The comment must:

- Be written in **plain, non-technical language** so that all team members (designers, product, etc.) can understand it
- Explain **what was done** and **why**
- Explain **what changes concretely** for the project or the product
- Mention **who might be interested**, based on the labels inherited from the linked issue (`scope:`, `area:`, `type:`)

Example:

```markdown
@Fabien-Ori @Thais9723 — For your information: this PR adds the legal
pages (cookies, privacy, terms of use) to the marketing website, in both
French and English. The site is now fully compliant with GDPR requirements.
No impact on the mobile app or the backend server.
```

The list of people to mention should be suggested based on the PR context (scope labels, area labels) and confirmed by the author before posting.

### 7. Wait for review

- CI must pass (GitHub Actions runs automatically)
- At least one reviewer must approve
- Address review comments before merging

---

## Code Style

### TypeScript

- Strict mode enabled everywhere
- **No `any` type** — ever
- **Named exports only** — no default exports for screens, use-cases, or API modules
- `interface` for object shapes, `type` for unions and utility types

### Mobile App (React Native / Expo)

- **Clean Architecture**: domain -> application -> data -> presentation
- `StyleSheet.create()` for all styles — no inline style objects
- Design tokens from `packages/mobile-app/src/core/theme/` — never hardcode colors, spacing, or fonts
- TanStack Query for data fetching (no `useState + useEffect` for remote data)
- Path alias: `@/*` maps to `src/*`

### API (NestJS)

- TypeORM for database access
- DTOs with `class-validator` decorators for request validation
- Standardized response format: `{ success, statusCode, message, data }`

### Import Order

1. React / React Native
2. Expo / third-party libraries
3. Internal `@/core/...`
4. Internal `@/features/...`
5. Relative imports

---

## Testing

Tests are mandatory for every new feature.

| Package    | Test framework                       | Location                                         |
| ---------- | ------------------------------------ | ------------------------------------------------ |
| Mobile App | Jest + @testing-library/react-native | `src/features/<feature>/presentation/__tests__/` |
| Mobile App | Jest (unit)                          | `src/features/<feature>/application/__tests__/`  |
| API        | Jest                                 | `src/**/*.spec.ts` and `test/**/*.e2e-spec.ts`   |

```bash
# Run specific test file
npm -w packages/mobile-app test -- path/to/test.ts

# Run with coverage
npm -w packages/mobile-app run test:coverage
npm -w packages/api run test:cov
```

---

## PR Checklist

Before requesting review, verify:

- [ ] Branch is up to date with `main`
- [ ] `npm run ci:all` passes (lint + typecheck + format)
- [ ] `npm run test:all` passes (all tests green)
- [ ] No `any` types introduced
- [ ] No inline styles introduced
- [ ] No hardcoded colors, spacing, or font values
- [ ] PR title follows Conventional Commits format
- [ ] PR body includes `Closes #<issue-number>`

---

## Project Structure

```
brasse-bouillon/
  packages/
    mobile-app/       Expo SDK 54 + Router v6 + TypeScript
      src/
        core/           Shared: auth, http client, theme, UI primitives
        features/       Feature modules (auth, recipes, batches, tools...)
          <feature>/
            domain/       Types and interfaces only
            data/         API calls
            application/  Use-cases (business logic)
            presentation/ Screens and components
      app/              Expo Router file-based routes
    api/              NestJS 11 + TypeORM + SQLite
      src/              Application source code
      test/             E2E tests
    website/          Static marketing site
  docs/               Project documentation
  _archive/           Pre-monorepo code (preserved for reference)
  .github/workflows/  CI/CD pipelines
```

---

## Useful Links

- [Mobile App conventions (CLAUDE.md)](packages/mobile-app/CLAUDE.md)
- [Design system](packages/mobile-app/docs/design-system.md)
- [Definition of Done](docs/project-management/definition-of-done.md)
- [Definition of Ready](docs/project-management/definition-of-ready.md)
- [Sprint structure](docs/project-management/sprint-definition.md)
