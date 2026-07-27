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
- The repository sitemap is a date-free template. During deployment,
  `scripts/build_sitemap.py` injects each page's latest Git commit date into
  the staged `_site/sitemap.xml`; handwritten source `<lastmod>` values are a
  quality-gate failure.
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
  `en.html`; it feeds Google's site-name feature. Every FR/EN secondary page
  carries one locale-specific **BreadcrumbList** matching its visible legal
  navigation (`Accueil`/`Home` → current page); `check_breadcrumb_schema`
  rejects missing, duplicate, malformed, or non-canonical trails. `FAQPage`
  was removed after Google stopped showing FAQ rich results in May 2026; the
  visible FAQ remains useful page content. No SoftwareApplication entity until
  `app.html` exists.

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

1. Validate metadata across every indexable FR/EN page. The quality gate
   enforces unique titles (60 characters maximum), unique meta descriptions
   (120–155 characters), and exact `<title>` / `og:title` / `twitter:title`
   alignment. For the generated EN home, edit `index.html` plus
   `i18n/home.en.json`, never `en.html` directly. Also verify Open Graph
   (`og:locale` + `og:image`), Twitter card, canonical, and hreflang cluster.
2. Regenerate and verify the EN home: `python3 scripts/build_i18n.py --check`.
   After reviewing changes to an FR/EN legal pair, refresh its freshness stamp
   with `python3 scripts/build_i18n.py --stamp`.
3. For structured-data changes, confirm `python3 scripts/quality_gate.py`
   validates every expected page. After deployment, test representative FR/EN
   URLs with Google Rich Results Test and confirm there are no critical errors.
4. Confirm the source `sitemap.xml` matches the exact indexable set and
   contains no handwritten `<lastmod>` values. To preview the deployed form:

   ```bash
   python3 scripts/build_sitemap.py --output /tmp/brasse-sitemap.xml
   ```

   Inspect the generated file and confirm every URL has a page-specific,
   Git-backed date.
5. Confirm `robots.txt` includes:
   - `User-agent: *`
   - `Allow: /`
   - `Sitemap: https://brasse-bouillon.com/sitemap.xml`

   The repo file is not the whole story — Cloudflare prepends a managed block
   and can 403 AI crawlers before they ever fetch it (§1.1). Verify the live
   file with `curl -s https://brasse-bouillon.com/robots.txt`; if the change
   concerns AI-crawler access, also run the full-UA status probe from §1.1.
6. Run local quality checks:

```bash
python3 scripts/quality_gate.py
python3 -m unittest discover -s tests
```

7. If `_headers` changed, verify after deploy that the pages.dev alias stays
   out of search indexes:
   `curl -sI https://brasse-bouillon-website.pages.dev/ | grep -i x-robots-tag`
   (expect `noindex`; the custom domain must NOT carry that header).
8. `llms.txt` is gate-required in the repo but ships only if staged by
   `website-deploy.yml` (explicit whitelist). After any deploy-workflow
   change, verify:
   `curl -s -o /dev/null -w "%{http_code}\n" https://brasse-bouillon.com/llms.txt`.

### 2.1) Academy guide publication

Public guides are generated from the canonical Academy corpus; never author a
file under `guides/` by hand.

1. Edit the Markdown source under `docs/academy/` and set
   `web_publication.status: review` with a stable French slug.
2. Run `npm -w packages/mobile-app run academy:generate` and review both
   generated corpus artifacts.
3. Complete the factual and editorial review. A public guide requires all
   three gates: Academy `status: published`, review confidence `validated`, and
   `web_publication.status: published`. Do not use a technical PR approval as
   a substitute for editorial validation.
4. Run `python3 scripts/build_guides.py`. The command writes deterministic,
   committed HTML under `guides/` and refuses to delete obsolete pages
   automatically.
5. Update the homepage internal link, `sitemap.xml`, `llms.txt`, and the
   Git-backed mapping in `scripts/build_sitemap.py` when the indexable URL set
   changes.
6. Run the publication checks:

   ```bash
   npm -w packages/mobile-app run academy:check
   python3 scripts/build_guides.py --check
   python3 scripts/quality_gate.py
   python3 -m unittest discover -s tests -v
   ```

French-only guides declare `fr` and `x-default` alternates to their own
canonical URL. Do not emit an `en` alternate or an English page until a
complete, useful translation exists. Explanatory guides use `Article` schema;
reserve `HowTo` for content that genuinely describes an ordered procedure.

## 3) Google Search Console (GSC) procedure

Official references: [Sitemaps report][gsc-sitemaps] ·
[URL Inspection tool][gsc-inspection] · [request a recrawl][gsc-recrawl].

### 3.1 Access and production preflight

1. Select the GSC property that contains the exact production URLs below
   (`https://brasse-bouillon.com/` URL-prefix property or the equivalent
   domain property). Sitemap submission requires property-owner permission;
   URL Inspection indexing requests require owner or full-user permission.
2. Confirm the production resources are reachable before recording GSC
   evidence:

   ```bash
   curl -fsSI https://brasse-bouillon.com/ | head -n 1
   curl -fsSI https://brasse-bouillon.com/en | head -n 1
   curl -fsS https://brasse-bouillon.com/sitemap.xml
   ```

   Expect HTTP `200` for both homes. Confirm the sitemap contains the exact
   allowlisted URLs from §1 and truthful, deployment-generated `<lastmod>`
   values.

### 3.2 Submit or refresh the sitemap

1. Open **Sitemaps** for the selected property.
2. Submit `https://brasse-bouillon.com/sitemap.xml` (the UI may prefill the
   property prefix). Re-submit the same URL only when this runbook or a
   remediation task explicitly asks for fresh evidence; do not use the
   retired unauthenticated sitemap ping endpoint.
3. Wait for the report to process the request, then verify:
   - **Status** = `Success`
   - **Last read** is present
   - **Discovered pages** matches the current sitemap URL count
4. Capture the evidence described in §3.5. If the status is not `Success`,
   open the sitemap row, record the reported error, and fix it before
   requesting indexing.

### 3.3 Inspect indexed canonical URLs

Use **URL Inspection** for:

- `https://brasse-bouillon.com/`
- `https://brasse-bouillon.com/en`
- one affected legal pair after a legal-page change

For each affected URL, record the indexed result and verify:

- the index status shown by GSC (do not rewrite a failure as a pass);
- **User-declared canonical** equals the inspected clean URL;
- **Google-selected canonical** equals the inspected clean URL;
- the last crawl timestamp is recorded.

Google-selected canonical is an indexed-data field. The live test in §3.4
cannot predict which canonical Google will select.

### 3.4 Test the live URL and request indexing

1. From URL Inspection, select **Test live URL**.
2. Verify the live result reports that crawling is allowed, the page fetch
   succeeds, and indexing is allowed.
3. After a material metadata or content change, select **Request indexing**
   once for each affected home. A request does not guarantee indexing, and
   repeated requests do not make crawling faster.

### 3.5 Trajectoire A evidence capture

For #990, capture at minimum:

1. The Sitemaps report row showing the sitemap URL, `Success`, **Last read**,
   and **Discovered pages**.
2. The indexed URL Inspection result for `https://brasse-bouillon.com/`
   showing the index status and both canonical fields.

Record the `/en` inspection result as text in the PR's **SEO Evidence**
section; add a separate screenshot when EN metadata or indexing changed.
Crop screenshots to the relevant property, URL, status, and timestamp.
Exclude unrelated properties, account details, search queries, traffic
metrics, and other private data.

## 4) Analytics

None. GA4 was removed (PR #817) and the privacy/cookies pages promise no
analytics and no tracking — do not add a measurement snippet as part of any
SEO work. Traffic signals come from GSC only.

## 5) PR Evidence section (mandatory)

Each SEO PR must include a section named **"SEO Evidence"**. Separate
repository evidence from production evidence so a PR never claims to have
validated code that is not deployed yet.

### 5.1 Pre-merge repository evidence

1. **Diff summary** — changed files and affected canonical URLs.
2. **Command output** — quality gate, unit tests, i18n check, and any
   task-specific validation.
3. **Expected production checks** — exact URLs and GSC fields to verify.

### 5.2 GSC evidence for already-deployed production

Include cropped screenshots and a short textual result for every affected
URL. For #990, use the minimum evidence set from §3.5. Never include
unrelated account or performance data.

### 5.3 Changes that require the current PR to deploy

Mark GSC evidence as `pending post-deploy` in the PR body. After merge and a
successful production deployment, add the dated evidence to the linked issue
or the merged PR conversation. Do not present a pre-deploy inspection as proof
of the new change.

## 6) Future switch (when app page is ready)

When `app.html` is launched, move app-specific SEO/entity there:

- add SoftwareApplication schema on `app.html` (the gate currently bans it on
  the homes)
- keep the homepages focused on brand/entity discovery
- add `app.html` (and its EN twin) to `SITEMAP_URLS` when it should be indexed

[gsc-sitemaps]: https://support.google.com/webmasters/answer/7451001
[gsc-inspection]: https://support.google.com/webmasters/answer/9012289
[gsc-recrawl]: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
