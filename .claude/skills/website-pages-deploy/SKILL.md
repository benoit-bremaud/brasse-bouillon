---
name: website-pages-deploy
description: HISTORICAL — superseded by ADR-0014; brasse-bouillon.com now deploys to Cloudflare Pages via `.github/workflows/website-deploy.yml`. This runbook documents the retired GitHub Pages pipeline (2026-05-19 reclaim era). Use only when reading the historical deploy story for an ADR / soutenance — never for operating today's deployment.
---

# Brasse-Bouillon Website — GitHub Pages deploy

> **HISTORICAL — do not follow for deploys.** Since
> [ADR-0014](../../../docs/architecture/decisions/0014-website-hosting-cloudflare-pages-dns.md)
> the site is hosted on **Cloudflare Pages** and `.github/workflows/website-deploy.yml` deploys it
> via `wrangler pages deploy`. Everything below describes the pre-ADR-0014 GitHub Pages pipeline
> and is kept for the historical record (2026-05-19 reclaim, ADR / soutenance narrative) only.

This skill captures the deployment story of the marketing site after the 2026-05-19 reclaim, verified end-to-end on commit `99f2208`. The procedure below is what worked in practice, not the theory.

## Architecture

| Surface | Path | Role |
|---|---|---|
| Source files | `packages/website/` | HTML + CSS + JS + brand assets + screenshots + docs/ROADMAP.md |
| Quality gate | `.github/workflows/ci.yml` (`website:` job) | Runs `packages/website/scripts/quality_gate.py` on every PR whose diff touches the package |
| Deploy pipeline | [`.github/workflows/website-deploy.yml`](../../../.github/workflows/website-deploy.yml) | Stages public files → `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v4` |
| Pages config | `Settings ➜ Pages` (UI) or `gh api repos/benoit-bremaud/brasse-bouillon/pages` (CLI) | `build_type: workflow`, `cname: brasse-bouillon.com` |
| Live domain | `https://brasse-bouillon.com/` | CNAME bound to this repo's Pages, HTTPS cert auto-provisioned |
| Default Pages URL | `https://benoit-bremaud.github.io/brasse-bouillon/` | Fallback when CNAME is detached, useful for debugging |

The `CNAME` file under `packages/website/` is copied into the deployment artifact root by the workflow. GitHub Pages reads it on deploy and (re)attaches the custom domain when needed.

## How a normal deploy fires

Any push to `main` whose diff touches `packages/website/**` (or the workflow file itself) triggers the deploy. The workflow:

1. Checks out the repo.
2. Calls `actions/configure-pages@v5`.
3. Runs the "Stage public site assets" step which copies the whitelisted public files into `_site/` — never copies `docs/GOVERNANCE.md`, `docs/SEO_RUNBOOK.md`, `docs/weekly/`, `scripts/`, `tests/`, `CHANGELOG.md`, `CONTRIBUTING.md`, `README.md`, `CLAUDE.md`, `package.json`, or `sonar-project.properties`. ROADMAP.md is the only `docs/` file copied (linked from the homepage).
4. Uploads `_site/` via `actions/upload-pages-artifact@v3`.
5. Deploys via `actions/deploy-pages@v4` under the `github-pages` environment with `concurrency: pages` to prevent racing runs.

End-to-end takes ~30 s on a small change.

## How to trigger a manual deploy

Two equivalent ways:

```bash
# CLI
gh workflow run website-deploy.yml --ref main --repo benoit-bremaud/brasse-bouillon

# Or via the UI: Actions ➜ "Website Deploy" ➜ "Run workflow" on branch main
```

Both fire a `workflow_dispatch` run. Watch progress with:

```bash
gh run list --workflow=website-deploy.yml --repo benoit-bremaud/brasse-bouillon --limit 3
gh run watch <RUN_ID> --repo benoit-bremaud/brasse-bouillon --interval 5
```

## Verification commands

After a deploy, check three layers in sequence:

```bash
# 1. Pages API — confirms config (cname, cert, build_type)
gh api repos/benoit-bremaud/brasse-bouillon/pages \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps({k: d.get(k) for k in ['status','cname','build_type','html_url','https_certificate']}, indent=2))"

# 2. Live HTTP headers — confirms the CDN serves a fresh build
curl -sI https://brasse-bouillon.com/ | head -8
# Look for: `HTTP/2 200`, fresh `last-modified`, fresh `etag`.

# 3. Spot-check that new content is on the page
curl -s https://brasse-bouillon.com/ | grep -oE "<h1>.{0,120}</h1>"
curl -s https://brasse-bouillon.com/ | grep -oE 'src="screenshots/[^"]+"' | head -5
```

If the live page shows old `last-modified` despite a successful run, GitHub's CDN cache can lag ~1 minute. Re-curl with `-H "Cache-Control: no-cache"` to confirm.

## Troubleshooting

### Pages config got cleared / `cname: null`

The fix is `PUT` (not `PATCH`) and the certificate has to exist first:

```bash
gh api -X PUT repos/benoit-bremaud/brasse-bouillon/pages \
  --input - <<'EOF'
{"cname": "brasse-bouillon.com"}
EOF
```

If the response is `404 The certificate does not exist yet`, trigger a deploy first (so the workflow runs `configure-pages` which provisions the cert), then retry the PUT.

### Custom domain serves 404 even though deploy succeeded

Three likely causes:

1. The CNAME was never set on the Pages config. Verify with `gh api .../pages` — if `cname: null`, run the PUT above.
2. The deploy that succeeded ran before the CNAME was bound. Trigger a fresh `workflow_dispatch` so the next deploy publishes under the right domain.
3. The CNAME file is missing from `packages/website/`. Without it, GitHub Pages doesn't know which domain to attach. Check `git ls-files packages/website/CNAME`.

### "Repository is archived" when trying to disable Pages on the old repo

The legacy `brasse-bouillon-website` repo is archived. To touch its Pages config you must unarchive it first, perform the operation, then re-archive:

```bash
gh api -X PATCH repos/benoit-bremaud/brasse-bouillon-website \
  --input - <<<'{"archived": false}'

gh api -X DELETE repos/benoit-bremaud/brasse-bouillon-website/pages

gh api -X PATCH repos/benoit-bremaud/brasse-bouillon-website \
  --input - <<<'{"archived": true}'
```

This is exactly what was done on 2026-05-19 to release `brasse-bouillon.com` from the archive to this monorepo.

### The deploy is failing on a missing file

The staging script uses `shopt -s nullglob` so wildcard copies (`*.html`, `*.css`, `*.js`, `*.png`, `*.svg`) tolerate empty matches. But four files are required as scalar copies and will fail loudly if removed: `favicon.ico`, `CNAME`, `sitemap.xml`, `robots.txt`. If a deploy fails with `cp: cannot stat`, check that none of these four were accidentally deleted from `packages/website/`.

### The job complains about Node 20 deprecation

The current pinned versions of `actions/deploy-pages@v4` and friends still run on Node 20. GitHub will force Node 24 starting 2026-06-02. When that lands either pin the actions to a newer major or set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` on the runner. Not actionable today — the warning is informational.

## Historical context — what NOT to redo

Before 2026-05-19 the site was served by a separate `brasse-bouillon-website` repo. On 2026-03-24 the commit `cbf82cc chore(monorepo): import website repo history via git subtree` brought the source files into this monorepo but **not the deployment workflow**. The original repo was then archived, freezing its last deploy (30 March 2026) at `brasse-bouillon.com` while every website PR merged on this monorepo since (PR #1006 → PR #1018) sat unpublished.

The recovery was the four-step migration captured in PR #1020 + the manual API calls on 2026-05-19:

1. `gh api -X DELETE …/brasse-bouillon-website/pages` (with the unarchive/re-archive dance above).
2. `gh api -X POST …/brasse-bouillon/pages` with `{"build_type": "workflow"}`.
3. `gh workflow run website-deploy.yml --ref main`.
4. `gh api -X PUT …/brasse-bouillon/pages` with `{"cname": "brasse-bouillon.com"}` (once the certificate provisioning had run during the first deploy).

PROJECT_LOG entry of PR #1020 captures the same story in audit-trail form. Do not redo the subtree merge — the file structure under `packages/website/` is now the canonical source.

## Related files

- [`.github/workflows/website-deploy.yml`](../../../.github/workflows/website-deploy.yml) — the workflow itself
- [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) — `website:` job runs the quality gate
- [`packages/website/CLAUDE.md`](../../../packages/website/CLAUDE.md) — package-level rules + deployment summary
- [`packages/website/README.md`](../../../packages/website/README.md) — onboarding overview
- [`packages/website/scripts/quality_gate.py`](../../../packages/website/scripts/quality_gate.py) — the structural invariants the gate enforces
