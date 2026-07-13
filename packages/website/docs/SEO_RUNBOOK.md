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
- `robots.txt` is minimal and points to the sitemap.
- Structured data: **Organization** + **FAQPage** on both homes (FAQPage is
  rebuilt from the same i18n catalog keys as the visible FAQ — no
  SoftwareApplication entity until `app.html` exists).

## 2) Release checklist (every SEO PR)

1. Validate metadata in `index.html` (the single authored home source):
   title, meta description, Open Graph (incl. `og:locale` + `og:image`),
   Twitter card, canonical, hreflang cluster.
2. Regenerate and verify the EN home: `python3 scripts/build_i18n.py --check`.
3. Confirm `sitemap.xml` matches the exact indexable set (gate-enforced).
4. Confirm `robots.txt` includes:
   - `User-agent: *`
   - `Allow: /`
   - `Sitemap: https://brasse-bouillon.com/sitemap.xml`
5. Run local quality checks:

```bash
python3 scripts/quality_gate.py
python3 -m unittest discover -s tests
```

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
