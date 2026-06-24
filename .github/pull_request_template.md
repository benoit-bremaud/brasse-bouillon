<!--
  Title format (Conventional Commits) — also used by release-please:
    <type>(<scope>): <short description>

  Examples:
    feat(mobile-app): add scan history offline cache
    fix(api): handle empty brewery payload from openfoodfacts
    chore(claude-tooling): add hooks for python and mobile-ts

  Common types: feat, fix, refactor, docs, test, chore, perf, style, build, ci
  Release-please scopes (canonical, listed in CONTRIBUTING.md § Commit Convention):
                 mobile-app, api, website, beer-encyclopedia, monorepo, ci
  Informal scopes (used in commits, no release-please bump):
                 claude-tooling, infra, root, ydays
-->

## Summary

<!-- One short paragraph or 2-4 bullets. What this PR does and why. -->

-

## Context

<!-- Optional. Drop the section if the Summary is enough.
     Use it for: linked specs/ADRs, prior discussion, related PRs, screenshots,
     trade-offs you want reviewers to notice. -->

## Checklist

<!-- Tick what applies; explain anything skipped. -->

- [ ] Happy path + sad path + edge cases covered (tests when code changes)
- [ ] `npm run ci:all` (or package-local equivalent) passes locally
- [ ] No `any`, no default exports for screens/use-cases/API modules
- [ ] No inline styles, no hardcoded colors, spacing, or font values in `packages/mobile-app/` (use design tokens)
- [ ] No new ADR violations (see [docs/architecture/decisions/](docs/architecture/decisions/))
- [ ] `PROJECT_LOG.md` will be updated after merge (entry per the [`project-log-entry`](.claude/skills/project-log-entry/SKILL.md) skill)

## Linked issue

<!-- Use Closes/Fixes for issues this PR finishes; Refs for partial work. -->

Closes #

---

<!--
  After opening this PR, post a separate FRENCH FYI comment that mentions
  the relevant team members based on the scope/area labels of the linked
  issue. See CONTRIBUTING.md § 6 "PR notification comment" for the rules.

  Review runs locally pre-push (Claude + Codex). On GitHub, Codex auto-reviews
  and Copilot is MANUAL: add the `needs-copilot` label to request it (it bills
  premium requests) — do NOT call `requested_reviewers`, the API returns 422
  for GitHub App bot accounts. See CONTRIBUTING.md § AI reviewers.
-->
