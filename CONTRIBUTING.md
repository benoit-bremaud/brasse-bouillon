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
| `mobile-app`, `scan`, `auth`, `recipes`, `batches`, `ingredients`, `labels`, `shop`, `tools`, `academy`, `dashboard`, `beer-catalog` | `packages/mobile-app/**`        | Bumps `mobile-app` independently                                                                            |
| `api`                                                                                                                | `packages/api/**`               | Bumps `api` independently                                                                                   |
| `website`                                                                                                            | `packages/website/**`           | Bumps `website` independently                                                                               |
| `encyclopedia`                                                                                                       | `packages/beer-encyclopedia/**` | Bumps `encyclopedia` independently                                                                          |
| `ydays`, `root`, `ci`, `monorepo`                                                                                    | anything outside `packages/**`  | No package bump — doc / infra commits only                                                                  |

**No lockstep**: every package versions on its own. A commit touching
both `packages/mobile-app` and `packages/api` opens two release PRs, one
per package, and their version numbers may diverge over time.

The `linked-versions` group that used to bind `mobile-app` and `api` was
removed on 2026-07-20: the plugin hardcodes a group PR title carrying no
version (`linked-versions.ts:182`), so release-please could not parse a
version back after merge and silently stopped tagging app releases from
April onwards — three releases were lost that way. Nothing required the
two packages to share a version: neither depends on the other, and both
are private.

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

### Monorepo versioning (all packages independent)

Every package versions and tags on its own rhythm, one release PR each:

- `packages/mobile-app` → tag `mobile-app-vX.Y.Z`
- `packages/api` → tag `api-vX.Y.Z`
- `packages/website` → tag `website-vX.Y.Z`
- `packages/beer-encyclopedia` → tag `encyclopedia-vX.Y.Z`

`mobile-app` and `api` were grouped in lockstep until 2026-07-20; see
the "No lockstep" note above for why that group was removed.

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

### Authentication — fine-grained PAT

release-please uses a **fine-grained Personal Access Token** stored as the
`RELEASE_PLEASE_TOKEN` secret, not the default `GITHUB_TOKEN`. GitHub
deliberately refuses to trigger `pull_request` workflows on events created
by its own internal `GITHUB_TOKEN` (to prevent infinite loops). Without a
user PAT, every release-please PR would get stuck `BLOCKED` by branch
protection because the required CI checks (`changes`, `mobile-app`, `api`,
`security-audit`) never start.

Because the workflow uses `RELEASE_PLEASE_TOKEN`, the resulting PRs,
tags, and releases are attributed to the **PAT owner** (not to
`github-actions[bot]`). Downstream workflows that detect release-please
PRs must therefore guard on the branch name pattern
`release-please--*` + the `autorelease: pending` label, not on
`user.login == 'github-actions[bot]'`. See
`.github/workflows/release-please-metadata.yml` for the canonical guard.

The current PAT is scoped to this repository only with the following
permissions:

- `Contents: Read and write`
- `Pull requests: Read and write`
- `Issues: Read and write`
- `Metadata: Read-only` (auto-required)

**Rotation** — the PAT expires on **2027-04-24**. Before that date:

1. Open [GitHub → Settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/personal-access-tokens).
2. Regenerate the `Brasse-Bouillon release-please` token with the same
   permissions above and a new expiration date (recommended: 1 year).
3. Copy the new token, go to [Repo Settings → Secrets and variables → Actions](https://github.com/benoit-bremaud/brasse-bouillon/settings/secrets/actions)
   and update the `RELEASE_PLEASE_TOKEN` secret value.
4. Update the expiration date in this document and in the inline comment
   of `.github/workflows/release-please.yml`.

Missing the rotation means the `Release Please` workflow will fail with
an **authentication error** on the next release cycle until the PAT is
renewed. The error is visible as a failed run on the Actions tab, but
can go unnoticed if no one checks — the usual symptom is that no
release PR appears after a merge. Set a calendar reminder for
`2027-03-24` (one month before expiration).

### What NOT to do

- **Never `git tag` manually.** All tags are created by release-please.
- **Never bump `package.json` / `app.json` / CHANGELOG by hand.**
  Always let release-please generate the bump via the release PR.
- **Never close a release PR.** Update it via new commits.
- **Never push to `main` directly.** Even release PRs go through the
  PR / merge flow.

### Release PR metadata (automated)

Every release-please PR automatically receives — via
`.github/workflows/release-please-metadata.yml` — the same metadata
triptych as a regular PR:

- **Assignee** — `benoit-bremaud`
- **Labels** — `type:chore` + `priority:medium` + scope label derived
  from the head ref:
  - `*--components--encyclopedia` → `scope:backend`
  - `*--components--website` → `scope:website`
  - `*--components--mobile-app` → `scope:frontend`
  - `*--components--api` → `scope:backend`
  - `*--groups--app` → `scope:monorepo` (legacy; the "app" group was
    removed on 2026-07-20, so no new branch matches this)
- **Project** — Brasse-Bouillon (`PVT_kwHOB8rwIc4AuVew`). Projects v2
  is user-scoped and cannot be reached from the default `GITHUB_TOKEN`
  at all. A PAT with the `project` scope (classic PAT) or Projects
  Read/Write access (fine-grained PAT) stored as the `PROJECT_TOKEN`
  secret is required. When missing, the assignee + labels still apply
  and the workflow emits a GitHub Actions warning — the PR ships
  usable, just not yet in the project.

Reviewers are NOT applied by this workflow — CODEOWNERS handles that
automatically.

If assignee or label application fails, the workflow fails loud
(non-zero exit) so the regression is visible in CI — the whole point
of the workflow is that these fields are never missing on a release
PR. Only the project-add step is tolerant.

### Format check on release PRs

`packages/mobile-app/CHANGELOG.md` and `packages/mobile-app/app.json`
are owned and rewritten by release-please at every release. They are
listed in `packages/mobile-app/.prettierignore` so the `format:check`
step in CI does not fail on the unformatted output of release-please.
If you ever modify these files by hand, format them yourself before
committing.

### Tag protection

Ruleset `refs/tags/v*` + scoped component tags (`mobile-app-v*`,
`api-v*`, `website-v*`, `encyclopedia-v*`) block **`update`** and
**`deletion`** for everyone except admins. Creation is **not blocked**
so that release-please can cut the release tags automatically on merge
of the release PR.

As of 2026-04-24, release-please authenticates via the
`RELEASE_PLEASE_TOKEN` PAT (owner `@benoit-bremaud`, an admin), so
tags it creates are attributed to the PAT owner rather than to
`github-actions[bot]`. Full rationale and the transition history are
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

**Language — French (single documented exception).** This comment is the only French-public artefact of the repo. The rest of the project (code, commits, PR bodies, PR review replies, issue bodies, docs) stays in English per the global language rule (see [CLAUDE.md](CLAUDE.md) § Project Overview). The French-speaking team is the primary audience for the FYI comment at PR time, which is why this single exception exists.

The comment must:

- Be written in **plain, non-technical French** so that all team members (designers, product, etc.) can understand it
- Explain **ce qui a été fait** and **pourquoi**
- Explain **ce qui change concrètement** for the project or the product
- Mention **qui peut être intéressé**, based on the labels inherited from the linked issue (`scope:`, `area:`, `type:`)

Example:

```markdown
@Fabien-Ori @Thais9723 — Pour info : cette PR ajoute les pages légales
(cookies, confidentialité, mentions légales) au site marketing, en
français et en anglais. Le site est désormais pleinement conforme au
RGPD. Aucun impact sur l'application mobile ni sur le serveur backend.
```

The list of people to mention should be suggested based on the PR context (scope labels, area labels) and confirmed by the author before posting.

### 7. Wait for review

- CI must pass (GitHub Actions runs automatically)
- **Codex has returned a verdict** on the current head commit — a review (findings) or a 👍 (clean). Neither means it has not finished; see § AI reviewers below for how to read and wait for it
- Every posted review comment is addressed — bot reviewers (Codex, and Copilot on demand) only comment, and `main` has no required-approval or status-check rule (its ruleset only blocks deletion and force-push, see § AI reviewers below), so a GitHub approval is **not** required; the local pre-push review (all Must-Have items resolved) is the gate

#### AI reviewers — defence-in-depth pipeline

Review on this repository is layered: a **local pre-push ritual** is the
primary path and catches most issues before anything reaches GitHub, Codex
auto-reviews PRs on GitHub, and Copilot is kept as a deliberate **on-demand**
complement (it bills premium
requests — 13 per review since 2026-06-01 under the AI-credits model — so it
is not run on every PR). CodeRabbit was removed on 2026-06-24: its free tier
hit a PR-review rate limit and posted billing nudges on PRs.

**1. Pre-push (local, free) — the primary path.** Before pushing a branch,
run the local review ritual: the `pre-push-review` skill drives the
`pr-pre-reviewer` agent + `/code-review` (Claude side) and the `codex` CLI
(Codex/GPT side, via `scripts/codex-review.sh`), reconciles both into a
single Must Have / Should Have / Nice to Have / Disagree action list, and
gates the push on all Must Have items resolved.

**2. Post-push (GitHub) — Codex (automatic) + Copilot (on-demand):**

| Reviewer | Bot account | Trigger | Verdict |
|---|---|---|---|
| Codex | `chatgpt-codex-connector[bot]` | Automatic when a PR is **opened**, a draft is **marked ready**, or someone comments `@codex review` — **never on push** | Review if it has findings, **👍 reaction on the PR body if clean** — never approves |
| Copilot | `copilot-pull-request-reviewer[bot]` | **Manual** — add the `needs-copilot` label | Review comments only (premium-request quota) — never approves |

Codex also runs in the **local pre-push** ritual (`scripts/codex-review.sh`).
No GitHub bot reviewer can *approve* — they only post comments.

What this means in practice:

- **Copilot is manual.** It does not review automatically. To get a Copilot
  review on a PR, add the **`needs-copilot`** label — the `Copilot Review`
  workflow then posts `@copilot please review`. Use it sparingly (premium
  requests, ×13 per review).
- **Automatic Copilot review is controlled by a repository ruleset, not by
  the workflow.** From 2026-06-05 to 2026-07-17 an active ruleset rule
  (`copilot_code_review`) kept auto-requesting Copilot on every non-draft
  PR despite the documented manual-only policy; the rule was removed on
  2026-07-17. The ruleset, renamed *Protect default branch*, now only
  protects `main` against deletion and force-push. If Copilot ever starts
  reviewing unlabeled PRs again, check *Settings → Rules → Rulesets* —
  editing `copilot-review.yml` will not turn it off.
- **Codex signals "clean" with a 👍, not with silence.** Its own doc block
  states the contract: *"If Codex has suggestions, it will comment; otherwise
  it will react with 👍."* So its verdict is exactly one of two things:
  **findings** → a review whose body names the commit it read
  (`**Reviewed commit:** <sha>`); **clean** → a `+1` reaction on the PR body.
  **Neither present = no verdict yet** — it is still running, or it never ran.
  Never read that as clean.
- **Poll both channels — the review list alone cannot tell you.**
  `pulls/$PR/reviews` returns `[]` both when Codex cleared the PR and when it
  has not started; those are different states with the same shape:

  ```bash
  # clean verdict (the channel that is easy to miss)
  gh api repos/benoit-bremaud/brasse-bouillon/issues/$PR/reactions \
    --jq '[.[] | select(.user.login=="chatgpt-codex-connector[bot]" and .content=="+1") | .created_at] | last // "no clean verdict"'
  # findings verdict, and the SHA it was made against
  gh api repos/benoit-bremaud/brasse-bouillon/pulls/$PR/reviews \
    --jq '.[] | select(.user.login=="chatgpt-codex-connector[bot]") | .submitted_at'
  ```

- **Bounded wait, then report what actually happened.** Poll for up to ~10
  minutes after the trigger (observed: 👍 in ~2 min, reviews in 2–7 min).
  If no verdict lands, Codex did not run — it was down for all of 2026-07-16
  and #1442–#1459 merged with no Codex pass. That is **not** a clean verdict:
  merge on the local pre-push review + green CI, and log "no Codex verdict"
  rather than "Codex clean".
- **A verdict covers only the commit Codex read, and pushing does not
  re-trigger it.** After pushing to an open PR, comment `@codex review` to get
  a fresh pass, and check the new verdict names the current head SHA.
- **On a PR that already carries a 👍, a clean re-pass has no signal left to
  send** — GitHub allows one reaction per user, so Codex cannot 👍 twice. "No
  new review" is then indistinguishable from "the re-run never happened", and
  inferring clean from it is the same silence-as-authorization mistake this
  section exists to prevent. That head has **no Codex verdict**: merge on the
  local pre-push review + CI and log it as such. (A PR whose verdicts so far
  were all reviews can still be cleared with a 👍 — the reaction is unused.)
- **Do not** call `gh api ... requested_reviewers -X POST` for `Codex` or
  `Copilot` — the call fails with 422 for GitHub App bot accounts (not all
  `[bot]` users). Codex auto-triggers; Copilot is triggered via the
  `needs-copilot` label above.
- **Do** address every inline comment per the Must Have / Should
  Have / Nice to Have / Disagree taxonomy, exactly the same way as
  for a human reviewer.
- Human reviewers are **never** tagged as PR reviewers on this
  project (solo dev — AI-only review policy).

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

Tests are mandatory for every new feature. The full approach — the test pyramid,
per-package layers and coverage targets, the e2e tooling per surface (Supertest /
Maestro / Playwright / pytest), and the CI quality gates — is the
[testing strategy](docs/testing/testing-strategy.md) (contract:
[ADR-0019](docs/architecture/decisions/0019-testing-strategy-and-quality-gates.md)).

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
