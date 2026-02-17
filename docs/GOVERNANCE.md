# Repository Governance — Brasse-Bouillon Website

This document defines the operational governance of the website repository.

---

## 1) Backlog source of truth

- GitHub epics/issues are the source of truth.
- Processing order follows the priority defined in open issues.
- An issue is closed only after the related PR is merged.

---

## 2) Standard issue → branch → PR → merge cycle

1. Create a dedicated branch (`feature/*`, `docs/*`, `bugfix/*`).
2. Implement only the issue scope.
3. Commit using Conventional Commits.
4. Push and open a PR to `develop`.
5. Ensure green CI and address relevant review feedback.
6. Merge PR into `develop`.
7. Comment and close the issue with traceability (PR number + merge commit).

## 2bis) `develop` → `main` promotion and GitHub Pages deployment

1. `develop` is the integration branch; `main` is the production branch deployed by GitHub Pages.
2. At the end of an epic (or when an increment is ready), open a release PR from `develop` to `main`.
3. Ensure CI is green on the release PR.
4. Review and approve the release PR with the same standards as PRs to `develop`.
5. Merge the release PR into `main` with an explicit merge strategy (merge commit recommended for traceability).
6. Link the release PR to related issues/epics to preserve traceability `issue` → `PR develop` → `PR main`.
7. GitHub Pages deployment is triggered automatically on push to `main`; then verify production is up to date.

---

## 3) Quality policy

- CI checks must be green before merge.
- No conflict markers should remain.
- Documentation changes must stay consistent with the actual repository structure.

---

## 4) Documentation policy

High-priority files to keep up to date:
- `README.md`
- `CONTRIBUTING.md`
- `docs/ROADMAP.md`
- `docs/GOVERNANCE.md`

Acceptance criterion: no references to non-existent files or obsolete workflows.

### Language policy (GitHub-facing content)

- All GitHub-facing repository content must be written in English:
  - documentation files,
  - PR titles and PR descriptions,
  - issue titles and issue descriptions.

---

## 5) End-of-epic runbook

After merge:
1. Confirm the PR status is `MERGED`.
2. Comment on the issue with the PR link and merge commit.
3. Close the issue.
4. Clean local and remote branches.
5. Return to an up-to-date `develop`.
6. Confirm the next issue to work on.
