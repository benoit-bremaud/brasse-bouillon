---
name: website-audit-brasse-bouillon
description: Brasse-Bouillon overlay for the global `website-audit` method — supplies this repo's target domain, GitHub Project ID, label vocabulary, assignee, report location (the VitePress audit-history site), and the Cloudflare Pages `_headers` mechanism for header findings. Use when auditing brasse-bouillon.com or adding a new dated audit to docs/audit-report/.
---

# Brasse-Bouillon — website audit overlay

This wraps the global `website-audit` skill (the universal method: checklist, severity taxonomy,
findings→issues flow). Load that for the method; the values below **override / fill in** its
project-open constants. Keep this file to constants and deltas only.

## Target

- Domain: `brasse-bouillon.com` (the marketing site). Source: `packages/website` (static HTML/CSS/JS).
- **Host = Cloudflare Pages** (ADR-0014; project `brasse-bouillon-website`). Deploy pipeline:
  `.github/workflows/website-deploy.yml` — `wrangler pages deploy` on push to `main`; other refs
  produce preview deployments. (Skill `website-pages-deploy` documents the pre-ADR-0014 GitHub
  Pages pipeline — historical only, do not follow it.)
- **Response headers ARE settable** via `packages/website/_headers` (shipped in PR #1370). Before
  filing a header finding, read that file's comments: some headers (nosniff, Referrer-Policy) come
  from the Cloudflare edge, and CSP (#1032) + HSTS hardening (#1033) are deliberately deferred with
  documented prerequisites. Always re-verify live with `curl -sSI` — edge behavior drifts.

## Issue tracking constants

- Repo: `benoit-bremaud/brasse-bouillon`. Assignee: `benoit-bremaud`.
- GitHub Project node ID: `PVT_kwHOB8rwIc4AuVew` (add every issue via the GraphQL mutation in
  `pr-create-brasse-bouillon`).
- Labels — **distinguish security vs quality** (don't drown the signal):
  - Security findings: `security` + `priority:high` + `scope:website`.
  - Functional defect: `type:bug` + `priority:high` + `scope:website`.
  - Quality/CI/SEO: `type:ci`/`type:fix` + `priority:medium`|`priority:low` + `scope:website`.
- Severity → priority: critical/high → `priority:high`; medium → `priority:medium`; low → `priority:low`.
- Group all findings under one **epic** (`type:epic` + `scope:website` + `scope:security`) with a
  checklist linking each sub-issue. Issue bodies in **English** (repo rule).
- After filing, add a `PROJECT_LOG.md` entry via skill `project-log-entry`.

Reference campaign: epic **#1031** (2026-05-21, 12 findings) — the template for issue body shape.

## Report — the VitePress audit-history site

The report lives at **`docs/audit-report/`** (standalone VitePress 1.6.4, on-brand theme; isolated
from `docs/ydays`, not in the npm workspaces; `node_modules`/`dist`/`cache` gitignored). Run
`cd docs/audit-report && npm run docs:dev` (default port 5173) / `docs:build`.

- **Current structure (flat, ADR-0001 "build for today"):** root `index.md` = latest audit synthèse,
  `historique.md` = audits journal, `findings.md` / `remediation.md` / `methodology.md` at root.
- Components: `VerdictHero`, `ScoreGauge`, `StatRow`, `SeverityBadge`, `FindingCard` (status →
  `StatusBadge`), `CoverageMatrix`, `StatusBadge` (todo/doing/done — flip to mark a finding fixed).
- **Adding the 2nd audit = migration trigger:** switch to per-audit dated folders
  `docs/audit-report/AAAA-MM-JJ/{index,findings,remediation,methodology}.md` (stable per-audit URLs),
  add a row to the history table and a `sidebar` group. Until then, keep flat.
- Tracked on `main` (the historical `docs/log-website-audit` working branch is merged and deleted).
  Never keep uncommitted audit work under `/tmp` (it gets wiped).
