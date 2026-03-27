# Project Conventions — Brasse-Bouillon

This document defines the naming conventions and standards applied across the Brasse-Bouillon monorepo. It ensures consistency, maintainability, and ease of collaboration.

For the full contribution workflow, see [CONTRIBUTING.md](../CONTRIBUTING.md).

---

## 1. Language

All code, comments, commit messages, PR descriptions, issue titles, and documentation must be in English. No exceptions.

---

## 2. File and Folder Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Folders | lowercase with dashes | `docs/project-management/` |
| Logic/utility files | kebab-case | `recipes.use-cases.ts` |
| React components | PascalCase | `RecipeDetailsScreen.tsx` |
| Test files | Same name + `.test` or `.spec` | `RecipesScreen.test.tsx` |
| Documentation | kebab-case | `sprint-definition.md` |

---

## 3. Monorepo Structure

```
brasse-bouillon/
  packages/
    frontend/     React Native + Expo SDK 54 + Router v6 + TypeScript
    backend/      NestJS 11 + TypeORM + SQLite + TypeScript
    website/      Static HTML/CSS/JS + Python quality gate
  docs/           Project documentation
  _archive/       Old code preserved for reference
  .github/        CI workflows, issue templates
```

Path references in documentation must always use `packages/frontend/`, `packages/backend/`, never bare `frontend/` or `backend/`.

---

## 4. Git Branching

Branch from `main` for every task. Never commit directly to `main`.

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<scope>` | `feat/ibu-calculator` |
| Bug fix | `fix/<scope>` | `fix/login-redirect` |
| Refactor | `refactor/<scope>` | `refactor/http-client` |
| Chore | `chore/<scope>` | `chore/update-deps` |
| Docs | `docs/<scope>` | `docs/readme-update` |
| CI | `ci/<scope>` | `ci/sonarqube-integration` |

---

## 5. Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description in imperative mood
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Scope:** the affected area — `auth`, `recipes`, `tools`, `backend`, `frontend`, `monorepo`, `ci`, `sonar`, `design`

Examples:

```
feat(recipes): add recipe duplication use-case
fix(auth): handle expired refresh token gracefully
ci(monorepo): add SonarQube quality gate to CI pipeline
```

Keep under 72 characters. Use imperative mood ("add", not "added").

---

## 6. Issue Conventions

### Title format

```
type(scope): short but meaningful description
```

### Issue templates

All issues must use a GitHub issue template:

| Template | Label | When to use |
|----------|-------|-------------|
| Bug Report | `type:bug` | Unexpected behavior or error |
| Feature Request | `type:feature` | New functionality |
| Task / Chore | `type:chore` | Config, tooling, maintenance |

### User Stories and Sub-issues

User Stories follow the **INVEST** model and the **3C** pattern (Card, Conversation, Confirmation). They are decomposed into sub-issues (GitHub native sub-issues):

```
Epic (type:epic)
  User Story (type:user-story)
    Feature (type:feature)
    Test (type:test)
    Bug (type:bug)
    Docs (type:docs)
```

Sub-issues inherit scope labels from their parent.

---

## 7. Labels

All labels use a prefixed namespace:

| Prefix | Purpose | Examples |
|--------|---------|---------|
| `type:` | Nature of work | `feature`, `bug`, `test`, `refactor`, `docs`, `chore`, `epic`, `user-story` |
| `scope:` | Codebase area | `frontend`, `backend`, `charte`, `devops`, `website`, `monorepo` |
| `priority:` | MoSCoW | `must-have`, `should-have`, `nice-to-have` |
| `size:` | T-shirt / Story Points | `XS` (1), `S` (2), `M` (3), `L` (5), `XL` (8), `XXL` (13) |
| `sprint:` | Sprint assignment | `sprint:4`, `sprint:5`, `sprint:6` |
| `area:` | Cross-cutting concern | `api`, `security`, `a11y`, `ux`, `architecture` |
| `status:` | Workflow state | `planned`, `in-progress`, `done` |

---

## 8. Milestones

| # | Milestone | Description |
|---|-----------|-------------|
| 31 | Monorepo Migration | Import repos, npm workspaces, CI |
| 32 | Documentation & Governance | README, CONTRIBUTING, CONVENTIONS, templates |
| 33 | Developer Experience & Cleanup | Shared config, DX scripts, SonarQube |
| 34 | Scrum & Agile Framework | DoD, DoR, sprint structure, ceremonies |
| 35 | Documentation Refactoring | Rewrite outdated docs for new stack |
| 36 | Marketing & Growth Strategy | Brand, personas, competitive analysis |
| 37 | Design System & Visual Identity | Audit and refactor graphic charter |
| 38 | Ynov Compliance & Ydays | Moodle deposits, soutenance prep |

---

## 9. Pull Request Conventions

### Title format

```
type(scope): concise description
```

### PR body must include

- Summary of changes (what and why)
- Checklist of acceptance criteria
- `Closes #<issue-number>`
- Screenshots for UI changes

### Metadata (applied via API)

- Assignee
- Labels (type + scope + priority)
- Milestone
- Project board

### Review comments

Every review comment must cover 3 axes:

1. **What was verified** — proof the code was read, not just skimmed
2. **What is solid** — reinforce good choices
3. **What could improve** — even minor or optional

A review comment must be readable in 3 months. "ok" is not acceptable.

---

## 10. TypeScript Code Style

- **Strict mode** enabled everywhere
- **No `any` type** — ever
- **Named exports only** — no default exports
- `interface` for object shapes, `type` for unions and utilities
- Import order: React/RN > Expo/third-party > `@/core/` > `@/features/` > relative

### Frontend specific

- `StyleSheet.create()` for styles — no inline objects
- Design tokens from `src/core/theme/` — never hardcode values
- Clean Architecture layers: `domain/` > `application/` > `data/` > `presentation/`

### Backend specific

- NestJS module/controller/service pattern
- TypeORM entities with `.entity.ts` suffix
- DTOs with class-validator decorators

---

## 11. Testing

Tests are mandatory for every new feature.

| Package | Tool | Location |
|---------|------|----------|
| Frontend | Jest + @testing-library/react-native | `src/features/<feature>/presentation/__tests__/` |
| Backend | Jest + supertest | `src/<module>/*.spec.ts` + `test/*.e2e-spec.ts` |

Run before every push:

```bash
npm run ci:all && npm run test:all
```

---

## 12. CI/CD

GitHub Actions runs on every PR to `main`:

- **Path-filtered**: only changed packages are tested
- **Frontend**: lint + typecheck + format + tests
- **Backend**: lint + build + tests
- **Website**: Python quality gate
- Coverage reports uploaded as artifacts

---

## 13. Scrum Workflow

- **Sprint duration:** 3 weeks (aligned with Yday cycle)
- **Estimation:** Planning Poker, Fibonacci scale, T-shirt sizes
- **Priority:** MoSCoW (Must-Have / Should-Have / Nice-to-Have)
- **Ceremonies:** Sprint Planning, async Daily (Discord), Sprint Review, Retrospective
- **Artifacts:** see `docs/project-management/` (DoD, DoR, sprint-definition, scrum-roles)

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [GitHub Projects documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [docs/project-management/](project-management/)
