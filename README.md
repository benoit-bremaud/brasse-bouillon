# Brasse-Bouillon Website

Official website repository for the **Brasse-Bouillon** project.

This repository contains a bilingual static landing page (FR/EN) and its CI/CD pipeline (quality gates + GitHub Pages deployment).

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
- `docs/GOVERNANCE.md`: backlog conventions, runbook, and repository governance
- `.github/workflows/website-ci-cd.yml`: CI/CD pipeline
- `scripts/quality_gate.py`: dependency-free local/CI quality gate
- `CONTRIBUTING.md`: contribution conventions

---

## ⚙️ CI/CD (Epic C)

Workflow: `.github/workflows/website-ci-cd.yml`

### Quality gates

Executed on `push` (`develop`, `main`) and `pull_request` (`develop`, `main`):
- presence of critical files,
- minimal FR/EN HTML structure,
- no Git conflict markers.

### Deployment

The GitHub Pages deployment job runs only on:
- `push` to `main`.

---

## 🧪 Local checks

```bash
python3 scripts/quality_gate.py
python3 -m py_compile scripts/quality_gate.py
```

---

## 🔀 Workflow Git

- `main`: production
- `develop`: integration
- `feature/*`, `docs/*`, `bugfix/*`: working branches

All contributions go through a PR to `develop` (unless an explicit exception is decided).

---

## 🗺️ References

- Roadmap: [docs/ROADMAP.md](./docs/ROADMAP.md)
- Contribution guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Governance: [docs/GOVERNANCE.md](./docs/GOVERNANCE.md)
