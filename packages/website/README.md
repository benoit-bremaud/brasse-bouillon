# Brasse-Bouillon Website

Marketing site package inside the **Brasse-Bouillon** monorepo (imported from the standalone `brasse-bouillon-website` repo on 2026-03-24 via `git subtree`).

This package contains a bilingual static landing page (FR/EN). Quality gates run in the monorepo CI (`website:` job in [`../../.github/workflows/ci.yml`](../../.github/workflows/ci.yml)); GitHub Pages deployment runs in [`../../.github/workflows/website-deploy.yml`](../../.github/workflows/website-deploy.yml).

---

## 🎯 Goal

The website presents:
- the project value proposition,
- the public roadmap,
- contact entry points (questionnaire + email).

It is maintained with a **build-in-public** approach and an epic-based simplified backlog.

---

## 🌐 Production

- Domain: [https://brasse-bouillon.com](https://brasse-bouillon.com)
- Deployment: GitHub Pages (branch `main`)

---

## 📁 Current structure

- `index.html`: FR page
- `index-en.html`: EN page
- `favicon.ico`, `logo.png`, `logo-removebg-preview.png`, `CNAME`: static assets
- `docs/ROADMAP.md`: product roadmap
- `docs/roadmap-feed.json`: machine-readable roadmap sync feed
- `docs/GOVERNANCE.md`: backlog conventions, runbook, and repository governance
- `../../.github/workflows/ci.yml` (`website:` job): quality gate runner on every PR
- `../../.github/workflows/website-deploy.yml`: GitHub Pages publication pipeline
- `scripts/quality_gate.py`: dependency-free local/CI quality gate
- `scripts/roadmap_sync.py`: roadmap ingest and markdown table sync script
- `CONTRIBUTING.md`: contribution conventions

---

## ⚙️ CI/CD

### Quality gates

The monorepo CI runs `scripts/quality_gate.py` (via the `website:` job in [`ci.yml`](../../.github/workflows/ci.yml)) on every PR whose diff touches `packages/website/**`. It checks:

- presence of critical files,
- minimal FR/EN HTML structure,
- no Git conflict markers,
- per-page structural rules (lang attribute, canonical, schema.org, etc.).

### Deployment

Any push to `main` whose diff touches `packages/website/**` (and `workflow_dispatch` for manual reruns) triggers [`website-deploy.yml`](../../.github/workflows/website-deploy.yml), which stages the public files (HTML, CSS, JS, brand assets, favicon, CNAME, sitemap, robots, `seo/`, `screenshots/`) into `_site/` and publishes via `actions/deploy-pages`. The repo's GitHub Pages source must be set to **"GitHub Actions"** in the Settings page for the deploy job to succeed.

---

## 🧪 Local checks

```bash
python3 -m unittest -v tests/test_quality_gate.py
python3 scripts/quality_gate.py
python3 -m py_compile scripts/quality_gate.py
python3 -m py_compile scripts/roadmap_sync.py
```

---

## 🔀 Workflow Git

- `main`: production (auto-deployed by `website-deploy.yml`)
- `feat/*`, `fix/*`, `docs/*`, `refactor/*`, `chore/*`: working branches per the monorepo branch-naming convention

All contributions go through a PR to `main` (the `develop` integration branch from the standalone website repo era no longer exists).

---

## 🗺️ References

- Roadmap: [docs/ROADMAP.md](./docs/ROADMAP.md)
- Contribution guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Governance: [docs/GOVERNANCE.md](./docs/GOVERNANCE.md)
