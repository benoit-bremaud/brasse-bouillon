# SEO Runbook (bilingual FR+EN website)

This runbook documents the operational SEO process for **brasse-bouillon.com**
while the product is still in pre-launch.

> **2026-07-13 — EN de-index reversed (i18n epic S2, ADR-0027 D5).** The
> original policy kept the English home (`index-en.html`, later `/en`) as a
> `noindex` stub canonicalized to `/`. Slice S2 flipped the switch: `/en` and
> the four EN legal twins are indexable, every FR/EN pair advertises a
> reciprocal hreflang cluster, and `/en` is in the sitemap. This section
> records the reversal; the stub-era policy below it is gone.

## 1) Current SEO policy

- Indexable pages: `/` and `/en` (the two homes) + the four **FR** legal pages
  (`/legal`, `/privacy`, `/cookies`, `/terms`).
- The four **EN** legal twins (`/legal-en`, …) are indexable but deliberately
  **out of the sitemap** (secondary pages, reachable via hreflang + links).
- `sitemap.xml` lists **exactly** `/`, `/en` and the four FR legal pages — the
  quality gate (`SITEMAP_URLS`, exact-set policy) enforces it.
- Every FR/EN pair carries one identical hreflang cluster on both pages:
  `fr` → FR page, `en` → EN page, `x-default` → FR page (FR-first project).
  The gate (`check_hreflang_reciprocity`) fails on any incomplete or
  non-reciprocal cluster.
- Every page is self-canonical at its clean URL. `en.html` is **generated**
  (never hand-edited): `scripts/build_i18n.py` emits canonical `/en`, the
  mirrored `og:locale` pair and the localized EN share card
  (`og-image-en.png` — the FR card has a French tagline baked in).
- A `noindex` on any EN page is a **gate failure** since S2 (the switch must
  not silently regress).
- The **repo** `robots.txt` (`packages/website/robots.txt`) is minimal and
  points to the sitemap. The **live** file is edge-modified — see §1.1.
- Structured data: **WebSite** + **Organization** on both homes. The WebSite
  block is language-neutral — brand + apex URL — and copied verbatim to
  `en.html`; it feeds Google's site-name feature. `FAQPage` was removed after
  Google stopped showing FAQ rich results in May 2026; the visible FAQ remains
  useful page content. No SoftwareApplication entity until `app.html` exists.

### 1.1) Edge overlay — Cloudflare managed robots.txt & AI Crawl Control

The live `https://brasse-bouillon.com/robots.txt` is **not** the repo file
alone, and AI crawlers can be 403-blocked before they ever read it. Two
zone-level Cloudflare mechanisms sit in front of this repo. Both are
**dashboard state** — mutable outside git; the values below are dated
snapshots, never trust them without re-running the probes:

- **Managed robots.txt** prepends a Cloudflare-maintained block: a
  `Content-Signal` line (snapshot 2026-07-17: `search=yes,ai-train=no,use=reference`
  — note `ai-input` is deliberately unset) plus `Disallow: /` for a
  Cloudflare-curated crawler list (snapshot: GPTBot, ClaudeBot, CCBot,
  Google-Extended, Amazonbot, Applebot-Extended, Bytespider,
  meta-externalagent, CloudflareBrowserRenderingCrawler — Cloudflare updates
  this list over time). The repo file is appended after the managed block.
- **AI Crawl Control** returns 403 at the network level for each crawler set
  to "Block" in the dashboard — a **per-crawler toggle**, not a fixed class
  (snapshot 2026-07-17: every probed AI agent was blocked, including the
  search/citation agents `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`,
  `Claude-User`, `PerplexityBot`).

Any GEO decision (letting AI answer engines read or cite the site) is made in
the Cloudflare dashboard (AI Crawl Control section; the references below carry
the current navigation), never in this repo. Re-verify live state before and
after any change:

```bash
curl -s https://brasse-bouillon.com/robots.txt   # the managed block, as crawlers see it
curl -s -o /dev/null -w "%{http_code}\n" \
  -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" \
  https://brasse-bouillon.com/                   # 403 = blocked, 200 = not UA-blocked
```

**Probe with the bot's real, full user-agent string** (as documented by each
vendor). Bare tokens (`-A "GPTBot"`) do not match the edge rules and return
**false 200s** (observed 2026-07-17). A 200 only proves the absence of a
UA-level block for that exact string — verified-bot rules may still treat the
real crawler differently.

Cloudflare references: [managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/)
· [AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/).

## 2) Release checklist (every SEO PR)

1. Validate metadata in `index.html` (the single authored home source):
   concise title (60 characters maximum), meta description, Open Graph
   (incl. `og:locale` + `og:image`),
   Twitter card, canonical, hreflang cluster.
2. Regenerate and verify the EN home: `python3 scripts/build_i18n.py --check`.
3. Confirm `sitemap.xml` matches the exact indexable set (gate-enforced).
4. Confirm `robots.txt` includes:
   - `User-agent: *`
   - `Allow: /`
   - `Sitemap: https://brasse-bouillon.com/sitemap.xml`

   The repo file is not the whole story — Cloudflare prepends a managed block
   and can 403 AI crawlers before they ever fetch it (§1.1). Verify the live
   file with `curl -s https://brasse-bouillon.com/robots.txt`; if the change
   concerns AI-crawler access, also run the full-UA status probe from §1.1.
5. Run local quality checks:

```bash
python3 scripts/quality_gate.py
python3 -m unittest discover -s tests
```

6. If `_headers` changed, verify after deploy that the pages.dev alias stays
   out of search indexes:
   `curl -sI https://brasse-bouillon-website.pages.dev/ | grep -i x-robots-tag`
   (expect `noindex`; the custom domain must NOT carry that header).
7. `llms.txt` is gate-required in the repo but ships only if staged by
   `website-deploy.yml` (explicit whitelist). After any deploy-workflow
   change, verify:
   `curl -s -o /dev/null -w "%{http_code}\n" https://brasse-bouillon.com/llms.txt`.

## 3) Google Search Console (GSC) procedure

### 3.1 Submit sitemap

1. Open property `https://brasse-bouillon.com/`
2. Go to **Sitemaps**
3. Submit/re-submit: `sitemap.xml`
4. Verify status = **Success**

### 3.2 Inspect canonical URLs

Use **URL Inspection** for:

- `https://brasse-bouillon.com/` (indexable, self-canonical)
- `https://brasse-bouillon.com/en` (indexable, self-canonical — since S2)
- Spot-check one legal pair (`/privacy` + `/privacy-en`) after any legal edit.

### 3.3 Request indexing

After important metadata/content changes, use **Request indexing** on the
affected home (`/` and/or `/en`).

## 4) Analytics

None. GA4 was removed (PR #817) and the privacy/cookies pages promise no
analytics and no tracking — do not add a measurement snippet as part of any
SEO work. Traffic signals come from GSC only.

## 5) PR Evidence section (mandatory)

Each SEO PR should include a section named **"SEO Evidence"** with:

1. **Diff summary** — changed files (`index.html`, `en.html` + catalog,
   `sitemap.xml`, `robots.txt`, legal twins, etc.)
2. **GSC screenshots** — sitemap success, URL Inspection for `/` and `/en`
3. **Command output** — `python3 scripts/quality_gate.py` result

## 6) Future switch (when app page is ready)

When `app.html` is launched, move app-specific SEO/entity there:

- add SoftwareApplication schema on `app.html` (the gate currently bans it on
  the homes)
- keep the homepages focused on brand/entity discovery
- add `app.html` (and its EN twin) to `SITEMAP_URLS` when it should be indexed
