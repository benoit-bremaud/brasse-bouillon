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

- `index.html`: FR home (single authored source; annotated with `data-i18n`)
- `en.html`: EN home served at `/en` — **generated** from `index.html` +
  `i18n/home.en.json` by `scripts/build_i18n.py`; do not edit by hand (ADR-0027)
- `chat-widget.js`: self-hosted public FAQ chat widget — a floating bubble that answers
  visitors about the project only (not brewing help). First-party call to the NestJS
  `faq-bot` API, ALTCHA proof-of-work solved client-side, no cookies/tracking, and it
  mounts on staging/localhost only (never on the public site in v1). See ADR-0022.
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
- presence of the feedback and FAQ-chat widget loaders on their required pages,
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

## 🤖 FAQ chat widget — manual test checklist

`chat-widget.js` is host-gated to staging/localhost and is the FAQ chatbot's front-end
(ADR-0022). The static site has no JS test harness (like `feedback-widget.js`, it ships
without unit tests), so a browser/DOM unit suite is a **deferred follow-up**. Until then,
verify the widget manually with the API running (`npm run dev:api`) and the site on `localhost`:

- [ ] **Mount / gate** — bubble appears on `localhost` / `127.0.0.1`; absent on a production-host build.
- [ ] **Open / close** — click opens the panel (focus moves to the input); close button and `Escape` close it (focus returns to the launcher).
- [ ] **Chips** — each question chip sends its question and renders an answer.
- [ ] **Ask success** — a typed question returns a single-block answer (envelope `data.answer`).
- [ ] **Challenge / solve** — with `ALTCHA_HMAC_KEY` set on the API, the widget fetches `GET /faq-bot/challenge`, solves the PoW, and the answer still returns; with no key it still answers (guard bypass).
- [ ] **Rate limit (429)** — the 6th question within a minute shows the "too many questions" message.
- [ ] **Unavailable (503)** — with `FAQ_BOT_ENABLED=false`, the widget shows the "temporarily unavailable" message.
- [ ] **Offline** — with the network cut, it shows the offline message (no crash).
- [ ] **Malformed / error response** — a non-OK or empty-`data` response falls back to the generic error message, never a blank/`undefined` bubble.
- [ ] **A11y** — full keyboard path (Tab/Enter/Escape), visible focus, screen reader announces the answer (`aria-live`), and `prefers-reduced-motion` disables transitions.
- [ ] **RGPD** — no network call fires on page load (only on ask); no cookies/localStorage set.
- [ ] **Bilingual** — chrome is French on `index.html`, English on the generated `en.html` (served at `/en`).

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
