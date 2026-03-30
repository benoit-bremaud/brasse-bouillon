# Weekly Product Digest

- Generated at: `2026-03-05T15:28:46Z`
- Since: `2026-02-27T18:59:03Z`
- Total merged PRs analyzed: **17**
- User-facing PRs: **12**
- Technical/internal PRs: **5**
- Publish recommendation: **Publish now**

## Suggested highlights
- Ingredient experience expanded (malt filters, hop/yeast detail pages, and contextual navigation).
- Navigation reliability improved across ingredients, recipes, batches, and shop flows.
- Authentication security hardening delivered (throttling on login/register endpoints).
- Batch lifecycle improved with owner-scoped deletion support.
- Brewing calculations expanded with a Tinseth IBU estimation endpoint.

## User-facing PRs

| Repo | PR | Merged at | Title |
| ---- | -- | --------- | ----- |
| frontend | [#57](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/57) | 2026-02-27T19:51:27Z | feat(ingredients): improve malterie flow with malt catalog filters |
| frontend | [#58](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/58) | 2026-02-27T21:04:26Z | feat(ingredients): preserve malterie filters and suggest alternatives |
| frontend | [#59](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/59) | 2026-02-27T23:07:34Z | refactor(ingredients): unify contextual return navigation |
| frontend | [#60](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/60) | 2026-02-28T17:38:46Z | feat(recipes): route hop and yeast rows to detail with recipe return context |
| frontend | [#61](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/61) | 2026-03-02T13:31:53Z | feat: implement hop and yeast product pages |
| frontend | [#62](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/62) | 2026-03-03T11:54:43Z | fix(navigation): prioritize header back actions |
| frontend | [#63](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/63) | 2026-03-03T13:47:05Z | feat(footer): add active feedback and deterministic shop back navigation |
| frontend | [#65](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/65) | 2026-03-04T16:09:14Z | feat(navigation): standardize header back button usage |
| backend | [#40](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/40) | 2026-03-04T16:39:42Z | fix(auth): enforce login throttling and harden jwt secret |
| backend | [#42](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/42) | 2026-03-04T20:08:49Z | feat(batch): add owner-scoped delete endpoint |
| backend | [#44](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/44) | 2026-03-04T20:46:37Z | fix(auth): add register endpoint rate limiting |
| backend | [#46](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/46) | 2026-03-04T23:17:35Z | feat(recipe): add Tinseth IBU estimation endpoint |

## Technical/internal PRs (excluded from public changelog)

| Repo | PR | Merged at | Title | Reason |
| ---- | -- | --------- | ----- | ------ |
| frontend | [#64](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/64) | 2026-03-03T13:50:48Z | chore(ci): run all tests automatically on PR | technical-title-prefix |
| backend | [#39](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/39) | 2026-03-04T15:20:41Z | ci(sonarcloud): align CI scan with SonarQube Cloud action | technical-title-prefix |
| backend | [#41](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/41) | 2026-03-04T19:48:07Z | ci(sonarqube): fail pipeline when quality gate fails | technical-title-prefix |
| backend | [#43](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/43) | 2026-03-04T20:24:35Z | docs(swagger): use explicit JWT bearer auth scheme name | technical-title-prefix |
| backend | [#45](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/45) | 2026-03-04T21:59:23Z | refactor(user): replace console logs with nest logger | technical-refactor |
