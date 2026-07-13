# Brasse-Bouillon Website

Marketing site package inside the **Brasse-Bouillon** monorepo (imported from the standalone `brasse-bouillon-website` repo on 2026-03-24 via `git subtree`).

This package contains a bilingual static landing page (FR/EN). Quality gates run in the monorepo CI (`website:` job in [`../../.github/workflows/ci.yml`](../../.github/workflows/ci.yml)); Cloudflare Pages deployment runs in [`../../.github/workflows/website-deploy.yml`](../../.github/workflows/website-deploy.yml) (ADR-0014).

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
- Deployment: Cloudflare Pages — `website-deploy.yml` publishes `_site/` with
  `wrangler pages deploy` on every `main` push touching the package (ADR-0014);
  DNS and the custom domain are managed on Cloudflare

---

## 📁 Current structure

- `index.html`: FR home (single authored source; annotated with `data-i18n`)
- `en.html`: EN home served at `/en` — **generated** from `index.html` +
  `i18n/home.en.json` by `scripts/build_i18n.py`; do not edit by hand (ADR-0027)
- `chat-widget.js`: self-hosted public FAQ chat widget — a floating bubble that answers
  visitors about the project only (not brewing help). First-party call to the NestJS
  `faq-bot` API, ALTCHA proof-of-work solved client-side, no cookies/tracking. Live on
  production since the 2026-07-13 go-live (staging/localhost also allowed). See ADR-0022.
- `favicon.ico`, `logo.png`, `logo-removebg-preview.png`: static assets
- `_redirects`: Cloudflare Pages redirects (`/index-en` → `/en` 301)
- `i18n/home.en.json`: EN string catalog for the generated home (with `srcHash`
  drift guards)
- `docs/ROADMAP.md`: product roadmap
- `docs/roadmap-feed.json`: machine-readable roadmap sync feed
- `docs/GOVERNANCE.md`: backlog conventions, runbook, and repository governance
- `../../.github/workflows/ci.yml` (`website:` job): quality gate runner on every PR
- `../../.github/workflows/website-deploy.yml`: Cloudflare Pages publication pipeline
- `scripts/quality_gate.py`: dependency-free local/CI quality gate
- `scripts/build_i18n.py`: dependency-free EN home generator (ADR-0027)
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

Any push to `main` whose diff touches `packages/website/**` (and `workflow_dispatch` for manual reruns) triggers [`website-deploy.yml`](../../.github/workflows/website-deploy.yml), which stages the public files (HTML, CSS, JS, brand assets, favicon, `_redirects`, sitemap, robots, `seo/`, `screenshots/`) into `_site/` and publishes them to the `brasse-bouillon-website` Cloudflare Pages project via `wrangler pages deploy` (ADR-0014). The `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` repo secrets must be set for the deploy job to succeed.

---

## 🧪 Local checks

```bash
python3 -m unittest discover -s tests -v   # gate + i18n generator suites
python3 scripts/quality_gate.py
python3 scripts/build_i18n.py --check      # en.html regeneration is clean
python3 -m py_compile scripts/quality_gate.py scripts/build_i18n.py scripts/roadmap_sync.py
```

---

## 🤖 FAQ chat widget — manual test checklist

`chat-widget.js` is host-gated (production + staging/localhost since the 2026-07-13
go-live) and is the FAQ chatbot's front-end
(ADR-0022). The static site has no JS test harness (like `feedback-widget.js`, it ships
without unit tests), so a browser/DOM unit suite is a **deferred follow-up**. Until then,
verify the widget manually with the API running (`npm run dev:api`) and the site on `localhost`:

- [ ] **Mount / gate** — bubble appears on `localhost` / `127.0.0.1` and on the production hosts; absent on any host not in `WIDGET_HOSTS`.
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
