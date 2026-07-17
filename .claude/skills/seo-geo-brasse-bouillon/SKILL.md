---
name: seo-geo-brasse-bouillon
description: Brasse-Bouillon overlay for SEO and GEO (generative engine optimization) work on brasse-bouillon.com — supplies this repo's policy pointers, quality-gate invariants, i18n metadata pipeline rules, the Cloudflare edge robots/AI-crawler caveat, the AI-bot taxonomy, verification commands, and the standing action plan. Use when optimizing, auditing, or reviewing anything SEO/GEO-related in packages/website (titles, metas, JSON-LD, sitemap, robots, hreflang, AI-crawler access, llms.txt).
---

# Brasse-Bouillon — SEO / GEO overlay

Wraps the global `seo-audit` skill (the universal audit method). Load that for the
method; this file holds the **repo-specific constants, invariants, and live state**.
Policy source of truth: [packages/website/docs/SEO_RUNBOOK.md](../../../packages/website/docs/SEO_RUNBOOK.md)
— when this file and the runbook disagree, the runbook wins; fix this file.

## Target & architecture

- Domain `brasse-bouillon.com`, static site in `packages/website/`, hosted on
  **Cloudflare Pages** (ADR-0014), deployed by `.github/workflows/website-deploy.yml`
  which **whitelists** staged files (globs `*.html|css|js|png|svg|webp` + explicit
  list `favicon.ico sitemap.xml robots.txt _headers _redirects`). A new public
  non-matching file (e.g. `llms.txt`) ships ONLY if added to that explicit list.
- Bilingual FR+EN (ADR-0027): `index.html` = authored FR source; `en.html` =
  **generated** (`python3 scripts/build_i18n.py`) — never hand-edit; EN strings +
  head metas live in `i18n/home.en.json` (`head` block: title, description, og/twitter,
  orgDescription, keywords, knowsAbout). Legal pages = hand-maintained twins with
  `i18n-src: sha1` stamps (`build_i18n.py --stamp`).

## Gate-enforced SEO invariants (never fight these — change the gate WITH the policy)

`scripts/quality_gate.py`, run by CI on every website PR:

- **Sitemap exact-set**: `sitemap.xml` lists exactly `/`, `/en`, `/legal`, `/privacy`,
  `/cookies`, `/terms`. EN legal twins deliberately out (indexable, reachable via hreflang).
- **hreflang reciprocity** on all 5 FR/EN pairs (`fr`, `en`, `x-default`→FR).
- Canonical presence gate-enforced on **both homes**; any canonical/hreflang link
  on ANY page must use the **clean URL** (no `.html`) — legal-page canonical
  presence is convention, not gate.
- `noindex` on any EN page = gate failure (S2 switch must not regress).
- OG image dimensions checked (1200×630); required-meta tables exist for
  index/en/404 (other pages: convention); `404.html` must stay `noindex`;
  `llms.txt` in `REQUIRED_FILES`.

## The edge caveat (single most important SEO/GEO gotcha)

**The live robots.txt is NOT the repo file** — two mutable Cloudflare zone
mechanisms sit in front of the repo (full detail + dated snapshots: runbook §1.1):
*managed robots.txt* prepends Content Signals + a Cloudflare-curated `Disallow`
list, and *AI Crawl Control* 403-blocks crawlers **per-crawler** (dashboard
toggles, not a fixed class). GEO access decisions live in the **Cloudflare
dashboard**, never in this repo. Always verify live, and **probe with the bot's
real, full user-agent string** — bare tokens (`-A "GPTBot"`) miss the edge rules
and return false 200s:

```bash
curl -s https://brasse-bouillon.com/robots.txt   # what crawlers actually see
curl -s -o /dev/null -w "%{http_code}\n" \
  -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" \
  https://brasse-bouillon.com/                   # 403 = blocked, 200 = not UA-blocked
```

## AI-bot taxonomy (for GEO decisions)

Independent levers — allowing citations does NOT require allowing training:

- **Answer/citation bots (allow for GEO)**: `OAI-SearchBot` (ChatGPT Search),
  `PerplexityBot`/`Perplexity-User`, `Claude-SearchBot`; user-triggered fetchers
  `ChatGPT-User`, `Claude-User`. Google AI Overviews use regular `Googlebot`
  (unaffected by Google-Extended).
- **Training bots (rights stance, blockable without GEO cost)**: `GPTBot`, `ClaudeBot`,
  `CCBot`, `Google-Extended` (Gemini training/grounding), `Bytespider`,
  `meta-externalagent`, `Applebot-Extended`, `Amazonbot`.
- This taxonomy is a **snapshot** (vendor bot rosters and semantics drift) —
  re-verify against vendor docs + the runbook §1.1 probes before acting on it.

## Verification ritual (every SEO PR)

```bash
cd packages/website
python3 scripts/quality_gate.py
python3 scripts/build_i18n.py --check     # en.html regen clean
python3 -m unittest discover -s tests
```

Plus the runbook §2 checklist. After any live/dashboard change: the curl checks above,
and spot-check `https://brasse-bouillon.com/{,en,legal,doesnotexist-xyz}` status codes
(expect 200/200/200/404; `.html` forms 308 to clean URLs).

## House rules that constrain SEO copy

- Simple hyphens only in site copy (no em-dashes — sweep #1421); code comments
  and internal docs exempt.
- `<title>` policy: keyword-first, brand last (pre-launch brand); `og:title`/
  `twitter:title` stay brand-first (social cards) — intentional split. The
  brand's SERP visibility is carried by the language-neutral **WebSite** JSON-LD
  (Google site-name feature) — never remove it while titles are brand-last.
- **Every present-tense marketing claim is fact-checked against code/roadmap before
  publishing** (durable rule from the Reddit playbook work). The app is pre-launch;
  the waitlist (+ feedback questionnaire) is the only CTA; never claim shipped
  features that aren't.
- No SoftwareApplication JSON-LD until a real app page exists (runbook §1).
- FR is primary (`x-default`→FR); never auto-redirect by language.

## Standing action plan (state as of 2026-07-17 — check PROJECT_LOG for drift)

- **A (USER, Cloudflare dashboard)**: unblock answer/citation bots (403→200), adjust
  managed robots.txt; optional `www`→apex 301. Blocking prerequisite for all GEO.
- **B (USER)**: Google Search Console (runbook §3) + Bing Webmaster Tools (feeds
  ChatGPT Search/Copilot).
- **C (code)**: **shipped** `89aeb254` (PR #1464, 2026-07-17, verified live) —
  keyword-first titles, Ko-fi `sameAs`, WebSite JSON-LD, og:site_name,
  max-image-preview, llms.txt (gate-required + deployed), runbook §1.1,
  pages.dev noindex.
- **D (USER)**: execute the frozen Reddit playbook
  (`packages/website/docs/EN_LAUNCH_PLAYBOOK.md`) — Reddit is the top citation
  source for answer engines.
- **E (epic, conception-first)**: informational content (Académie guides, extended FAQ)
  targeting novice queries; FAQPage JSON-LD derives from the same i18n keys.
- **F (optional)**: cookieless analytics (Cloudflare Web Analytics) to measure AI
  referrals — **blocked until** runbook §4 (which currently forbids any measurement
  snippet) AND the privacy/cookies pages' no-analytics promise are amended first.
- Accepted/no-action: og-image slightly over 100KB (byte-identical og-card pipeline
  outweighs the small gain), EN legal twins out of sitemap.

## Issue/PR constants

Same as `website-audit-brasse-bouillon`: repo `benoit-bremaud/brasse-bouillon`,
Project `PVT_kwHOB8rwIc4AuVew`, labels `scope:website` + `type:*` + `priority:*`,
assignee `benoit-bremaud`, artifacts in English. The FR FYI comment rule lives in
the repo `CLAUDE.md` + skill `pr-create-brasse-bouillon`.
