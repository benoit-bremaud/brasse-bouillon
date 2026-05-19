# CLAUDE.md — brasse-bouillon-website

## Project Overview

**Name:** Brasse Bouillon — Marketing Website
**Stack:** Static HTML/CSS/JS, no framework. Hosted on GitHub Pages with custom domain via `CNAME`.
**Deployment:** any push to `main` whose diff touches `packages/website/**` triggers the [`website-deploy.yml`](../../.github/workflows/website-deploy.yml) workflow, which stages the public files into `_site/` and publishes via `actions/deploy-pages`. Can also be re-run manually from the Actions tab (`workflow_dispatch`).
**Quality gate:** Python script under `scripts/quality_gate.py`, tested in `tests/test_quality_gate.py`, executed by the `website:` job in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) on every PR that touches the package.

The site is a thin marketing surface — not a SaaS frontend. Persistent product UX lives in `packages/mobile-app`.

## Structure

```
packages/website/
  index.html / index-en.html        → Landing pages (FR + EN)
  legal.html / legal-en.html        → Legal notice
  privacy.html / privacy-en.html    → Privacy policy
  cookies.html / cookies-en.html    → Cookie policy
  site.css                          → Stylesheet (CSS custom properties for tokens)
  site.js                           → Light interactivity (no framework)
  logo*.png / logo*.svg / og-image  → Brand assets
  favicon.ico                       → Tab icon
  CNAME                             → Custom domain (brasse-bouillon.com)
  package.json                      → @brasse-bouillon/website
  CONTRIBUTING.md                   → Website-specific contribution guide
  CHANGELOG.md                      → Website release notes
  docs/                             → Governance (GOVERNANCE.md), roadmap (ROADMAP.md + roadmap-feed.json), SEO runbook, weekly digests
  scripts/                          → Python utilities (quality_gate.py, roadmap_sync.py, weekly_digest.py)
  tests/                            → Python tests for the quality gate
  seo/                              → SEO assets (sitemap, robots, schema.org)
```

## Languages

- **UI default:** French. All public-facing copy is French (memory `feedback_ui_french_only.md`).
- **English mirrors:** every public page has a `-en.html` twin. Keep them in sync — any FR change requires an EN update in the same PR.
- **Internal artefacts (commits, PR bodies, comments, docs/, CHANGELOG.md):** English only (memory `feedback_github_artifacts_english_only.md`).

## Design Tokens

- All colors, spacing, typography defined as CSS custom properties at the top of `site.css`.
- Never hardcode hex colors, px spacing, or font sizes inside selectors — reference the variables.
- Mirror the mobile design system tokens conceptually so the brand stays consistent (mobile tokens live in `packages/mobile-app/src/core/theme/`).

## Styling Rules

- No inline `style="..."` attributes in HTML.
- No external CSS frameworks (no Tailwind, no Bootstrap). The site is intentionally lean.
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- Forms use native validation attributes; JS only enhances, never replaces.

## Accessibility

- All images require meaningful `alt` text (decorative images use `alt=""`).
- Contrast ratio ≥ AA (WCAG 2.1) for every text/background pair.
- Headings respect a single `<h1>` per page and a logical hierarchy.
- Keyboard navigation must reach every interactive element; visible focus states required.
- Language attribute set per page (`<html lang="fr">` or `<html lang="en">`).

## Privacy & Consent

- **No third-party tracking** without explicit consent. GA4 and any analytics removed in PR #817.
- Cookie banner and consent storage are mandatory before loading any non-essential script.
- The cookie / privacy / legal pages must list every actual cookie set; never describe categories that aren't used.

## SEO

- `seo/` holds sitemap, robots, and schema.org JSON-LD snippets.
- `SEO_RUNBOOK.md` documents the operational steps for SEO audits.
- Every public page must include the standard meta tags: `description`, Open Graph (`og:title`, `og:description`, `og:image`), Twitter Card.

## Quality Gate

`scripts/quality_gate.py` runs in CI and checks structural invariants (presence of meta tags, language attribute, alt text, etc.). Modify the gate when adding a new structural rule; never disable it.

```bash
cd packages/website
python scripts/quality_gate.py        # run the gate locally
python -m pytest tests/               # run the gate tests
```

## Feedback Widget

The `@brasse-bouillon/feedback-widget` (separate repo `benoit-bremaud/feedback-widget`) is planned for integration. When wiring it:

- Pin the version exactly (no floating tags).
- Use the `IssueTracker` adapter so feedback lands in the `audit-nvnc` GitHub Project (`PVT_kwHOB8rwIc4BVe-g`).
- Initialise only after the consent banner has accepted the relevant cookie category.

## Forbidden — Never Without Explicit User Request

### Files — do not modify

- `CNAME` (custom domain)
- `favicon.ico`, brand logo assets (request a design pass before touching)
- `.git/`, `.github/`

### Patterns — never introduce

- Inline `style="..."` attributes
- External JavaScript frameworks
- Third-party tracking scripts loaded before consent
- Hardcoded color, spacing, or font values (use CSS custom properties)
- English-only public pages without their French counterpart
- French commit messages, PR titles, or PR bodies (English only on GitHub)

## Project-local Claude tooling

- Subagent `pr-pre-reviewer` — local pre-push review in Copilot/Codex style; flags forbidden patterns. See [.claude/agents/pr-pre-reviewer.md](../../.claude/agents/pr-pre-reviewer.md).
