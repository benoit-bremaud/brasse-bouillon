# SEO Runbook (FR-first website)

This runbook documents the operational SEO process for **brasse-bouillon.com** while the product is still in pre-launch.

## 1) Current SEO policy

- Primary indexed page: `https://brasse-bouillon.com/`
- `sitemap.xml` contains **only `/`**
- `robots.txt` is minimal and points to the sitemap
- English page (`/index-en.html`) is kept available for users but set to:
  - `meta robots="noindex,follow"`
  - `canonical` to `https://brasse-bouillon.com/`
- Structured data currently uses **Organization** (no SoftwareApplication entity yet)

## 2) Release checklist (every SEO PR)

1. Validate metadata in `index.html`
   - title, meta description
   - Open Graph tags
   - Twitter card tags
   - canonical URL (`/`)
2. Confirm `sitemap.xml` only contains `/`
3. Confirm `robots.txt` includes:
   - `User-agent: *`
   - `Allow: /`
   - `Sitemap: https://brasse-bouillon.com/sitemap.xml`
4. Confirm `index-en.html` stays `noindex,follow` + canonical to `/`
5. Run local quality checks:

```bash
python3 scripts/quality_gate.py
```

## 3) Google Search Console (GSC) procedure

### 3.1 Submit sitemap

1. Open property `https://brasse-bouillon.com/`
2. Go to **Sitemaps**
3. Submit/re-submit: `sitemap.xml`
4. Verify status = **Success**

### 3.2 Inspect canonical URL

Use **URL Inspection** for:

- `https://brasse-bouillon.com/` (should be indexable and canonical)
- `https://brasse-bouillon.com/index-en.html` (should show noindex/canonicalized)

### 3.3 Request indexing

After important metadata/content changes on `/`, use **Request indexing** on `https://brasse-bouillon.com/`.

## 4) GA4 validation procedure

Measurement ID used on pages: `G-RVCT6NGFVG`.

After deployment:

1. Open GA4 **Realtime** report
2. Visit `/` in an incognito window
3. Confirm at least one realtime event (e.g. `page_view`)
4. Check that landing page path is `/`

Weekly checks:

- Sessions / users trend
- Top landing page paths
- Unexpected traffic on non-canonical pages

## 5) PR Evidence section (mandatory)

Each SEO PR should include a section named **"SEO Evidence"** with:

1. **Diff summary**
   - changed files (`index.html`, `index-en.html`, `sitemap.xml`, `robots.txt`, etc.)
2. **GSC screenshots**
   - sitemap success
   - URL Inspection for `/`
   - URL Inspection for `/index-en.html`
3. **GA4 screenshot**
   - Realtime view after deployment verification
4. **Command output**
   - `python3 scripts/quality_gate.py` result

## 6) Future switch (when app page is ready)

When `app.html` is launched, move app-specific SEO/entity there:

- add SoftwareApplication schema on `app.html`
- keep homepage focused on brand/entity discovery
- revisit sitemap strategy (add `app.html` when it should be indexed)
