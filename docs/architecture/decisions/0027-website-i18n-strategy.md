# ADR-0027 — Website Internationalization Strategy (Bilingual FR+EN Marketing Site)

**Status**  Accepted
**Date**    2026-07-10 (accepted 2026-07-10, after a 6-reviewer adversarial conception review folded in)
**Amended** 2026-07-13 — D4 clause 1: footer switcher mirror dropped (maintainer UX review; sticky header keeps the primary switcher always visible)
**Owners**  @benoit-bremaud

---

## Context

The marketing site (`packages/website`) is an intentionally **build-less** static
HTML/CSS/JS site on Cloudflare Pages (ADR-0014). It is French-first: the English
home (`index-en.html`) is an 83-line "coming soon" stub, `noindex,follow`, with a
canonical pointing to the FR home — a **deliberate de-indexing decision** recorded
in `packages/website/docs/SEO_RUNBOOK.md`. The 4 EN legal twin files
(`legal-en.html`, `privacy-en.html`, `cookies-en.html`, `terms-en.html`, served
at their `-en` clean URLs) exist and were rewritten for LCEN/RGPD compliance in
PR #1379, but are also `noindex` while EN is a stub.

The goal is now to promote the project on Reddit and international homebrewing
communities (mostly English-speaking). A French-only landing page wastes that
traffic. Bilingual FR+EN is already back in scope per epic #1075.

Constraints and observations that shaped this decision:

1. **Twin-drift pain is real and recent.** The house rule ("every FR change
   requires an EN update in the same PR", `packages/website/CLAUDE.md`
   § Languages) is enforced by discipline only. The 8 legal twins drifted before
   #1379 fixed them. The home page is the **most-edited page** of the site
   (Kinetic refresh, feature sections, an "Académie" section being designed in
   parallel) — hand-maintained twins there guarantee drift.
2. **The site must stay deploy-simple.** `website-deploy.yml` glob-copies flat
   files into `_site/` and pushes to Cloudflare Pages. Any mechanism must not
   force a deploy-time build.
3. **A Python precedent exists.** `scripts/quality_gate.py` (stdlib-only, tested
   by `tests/test_quality_gate.py`, run by the `website:` CI job) already polices
   structural invariants — including, today, the `index-en.html` noindex and the
   "sitemap = FR home only" policy, both of which this epic must update.
4. **Groundwork is already in place.** Both Formspree forms already post a hidden
   `lang=fr` field; `site.js` (`BBShared`) is already parameterized `fr`/`en` for
   form/menu DOM ids. The legal pages already have visible `.lang-switch` links.
5. **Privacy claims are load-bearing.** The site uses **no** cookies, no
   localStorage, no analytics. `cookies(-en).html` / `privacy(-en).html` promise
   **no tracking cookies and no audience measurement/analytics** (made accurate
   in #1379) — they do **not** literally claim "zero storage of any kind". A
   functional, never-transmitted language preference contradicts none of those
   sentences, but terminal storage must still be **disclosed** per ePrivacy
   (see D4 clause 5).

### Documented study (why we are not guessing)

A full repo reconnaissance (2026-07-10), extended by an adversarial 6-reviewer
conception review, inventoried: the page pairs and their URL scheme (`-en.html`
suffix served at clean URLs), the exact `<head>` SEO state of every pair — the FR
home advertises `fr` + `x-default` only (**it does not yet advertise `en` → this
epic must add it**, D5 clause 2); the legal pairs advertise `fr`+`en` but carry
**no `x-default`** (which D5 clause 2 must add) — the 9 quality-gate check
functions and which ones hard-code the current EN policy (`index-en.html` appears
in **five** gate constants, see D2 clause 2), the `_site/` staging steps, the
inline `<script>` at the bottom of `index.html` that holds the Formspree
endpoints + form message tables + toggle labels (relevant to D1/D3), and the
absence of any storage API usage in `site.js`. The matrices below score against
those facts, not assumptions.

## Decision

### D1 — Content-maintenance strategy: hybrid (weighted decision matrix)

Options considered:

- **A. Guarded twins** — keep hand-maintained FR/EN twin files for every page;
  add CI guards (structure-parity check + a freshness stamp: each EN page embeds
  a hash of the FR twin it translates, recomputed by the gate).
- **B. Full generation** — single content source for **all** public pages;
  a stdlib Python script generates both languages; generated output committed.
- **C. Hybrid (chosen)** — generation for the **home pair only** (the volatile
  page); guarded twins (option A mechanics) for the **legal pages** (stable,
  legally distinct prose that would be painful and pointless to templatize).

| Criterion (weight) | A. Guarded twins | B. Full generation | **C. Hybrid** |
|---|---|---|---|
| Drift risk (30%) | 3 | 5 | **5** |
| Recurring maintenance cost (20%) | 2 | 4 | **4** |
| Contributor UX (15%) | 4 | 2 | **4** |
| Tooling complexity (15%) | 4 | 2 | **3** |
| Deploy-workflow impact (10%) | 5 | 4 | **4** |
| Quality-gate compatibility (10%) | 4 | 3 | **4** |
| **Weighted score** | **3.40** | **3.60** | **4.15** |

Score rationale:

- *Drift risk*: A only **detects** drift (CI red), a human still ports every
  change twice; B and C make structural drift on generated pages impossible and
  turn missing translations into CI failures.
- *Recurring maintenance*: the home is edited weekly; A doubles every edit. B and
  C reduce a copy change to "edit FR + update the flagged catalog keys".
- *Contributor UX*: A and C keep plain hand-edited HTML where humans write prose
  (all pages in A; legal pages and the FR home in C). B forces template
  indirection everywhere, including page-long legal prose — the worst fit.
- *Tooling complexity*: B must template 10 pages including legal prose extraction;
  C scopes the generator to one page and reuses A's cheap stamp for the rest.
- *Deploy impact*: B and C commit generated output, so the deploy workflow is
  untouched except copying one new file; CI gains a regeneration-diff step.

**Adopted mechanism (numbered clauses, citable in review):**

1. `index.html` remains the **single authored source** for home content.
   Translatable elements carry `data-i18n="<key>"` for their text content, and
   `data-i18n-attrs="<attr>[:<key>][,<attr>…]"` for translatable attributes
   (`alt`, `aria-label`, `title`; `<meta content>` is head-only and handled by
   the head-override table, clause 3, not by `data-i18n-attrs`). **Attribute-key
   convention**: `<elementKey>@<attr>` (e.g. `hero.logo@alt`). **Key convention**
   (per the `i18n` skill): semantic, hierarchical, stable, one case style
   (`home.hero.title`, `nav.faq`) — never the English string as the key, never a
   key reused across two contexts. EN-only content that has **no FR source**
   (e.g. the "app ships in French first" honesty line, D-note below) is authored
   as a `data-i18n-en-only="<key>"` placeholder element that renders **empty in
   FR** and is filled from the catalog in EN.
2. Translated strings live in `packages/website/i18n/home.en.json` — a flat map
   `key → EN HTML fragment` (whole elements; **never concatenated fragments**),
   plus an `insertions` section for the `data-i18n-en-only` keys.
3. `scripts/build_i18n.py` (Python 3, **stdlib only**, same standard as
   `quality_gate.py`) generates `en.html` from `index.html` + the catalog. It
   substitutes annotated spans/attributes **in place** and applies a
   **head-override table**: title, description, canonical (**self-referential to
   `/en` from the first generation, even while S1 ships dark**, see D5 clause 1),
   hreflang, OG/Twitter **including `og:locale=en_US` + `og:locale:alternate`**,
   `lang` attributes, hidden form `lang` field. It also localizes the **bottom
   inline `<script>` block**: the `…Fr` → `…En` DOM id suffixes expected by
   `BBShared`, `TOGGLE_LABELS.en`, and the inline `onclick('fr' → 'en')` calls.
   **Decided (S1):** the form **message/error tables** are **moved out of the
   inline `<script>` into `site.js` / the catalog** so the page's inline bootstrap
   is language-neutral — the generator swaps DOM-id suffixes and the `onclick`
   language argument, but does **not** rewrite JS string literals (a regex over
   JS is fragile). This is a small one-time refactor of the existing FR home.
   The **FAQPage JSON-LD is derived from the same catalog keys as the visible
   `<details>` FAQ** — a single EN source, never a separately authored head
   entry — so the structured data cannot drift from the visible copy. The
   consent-note legal links are rewritten `/{terms,privacy,cookies}` →
   `/{…}-en`.
4. The generated `en.html` is **committed** (deploy stays build-less). It opens
   with a `<!-- GENERATED FILE — edit index.html + i18n/home.en.json instead -->`
   marker. The generator is **deterministic**: it performs targeted in-place
   substitution and **never re-serializes** the document (no HTML parser
   round-trip that would flip attribute order / quotes / whitespace); output is
   newline- and encoding-normalized. CI enforces: (a) regeneration is clean
   (`build_i18n.py` then `git diff --exit-code`, byte-identical on re-run);
   (b) **key parity** — every `data-i18n`/`data-i18n-attrs`/`data-i18n-en-only`
   key has a catalog entry and vice versa; (c) **source-hash freshness** — each
   catalog entry records a `srcHash` of the FR source text/attribute it
   translates, and CI fails when the FR source changed but the EN value (and its
   `srcHash`) were not updated. Clause (c) is the load-bearing drift guard:
   without it, editing FR text **inside an already-annotated element** leaves the
   key and catalog unchanged, regeneration stays clean, key parity still passes,
   and stale EN would ship green.
5. Legal twins stay hand-maintained. Each EN legal page embeds
   `<!-- i18n-src: sha1:<hash of the FR twin> -->`; the quality gate recomputes
   it and fails when the FR page changed without the EN twin being re-reviewed.
   A helper (`build_i18n.py --stamp`) refreshes the stamp.
6. `404.html` stays single and locale-agnostic (out of scope).

### D2 — EN URL scheme (weighted decision matrix)

Options: (a) keep `/index-en`; (b) rename the EN home file to `en.html`, served
at **`/en`**, with a `301 /index-en → /en` in a new `_redirects` file; (c) migrate
all EN pages into an `/en/` folder.

| Criterion (weight) | a. Keep `/index-en` | **b. `/en` home, keep `-en` legal** | c. `/en/` folder |
|---|---|---|---|
| Promoted-URL quality (40%) | 2 | **5** | 5 |
| Migration cost (20%) | 5 | **4** | 2 |
| Workflow/gate impact (20%) | 5 | **4** | 2 |
| Scheme consistency (20%) | 4 | **3** | 5 |
| **Weighted score** | **3.60** | **4.20** | **3.80** |

**Chosen: (b).** `https://brasse-bouillon.com/en` is the URL that goes on Reddit
posts and stays forever; `/index-en` leaks an implementation detail. The EN pages
are still `noindex` today, so **now is the cheapest moment ever** to fix the
promoted URL — nothing is indexed yet. Option (c)'s folder purity is not worth
recursive gate globs, `_site/` subfolder staging, and 4 legal-URL redirects on a
10-page site. Clauses:

1. EN home file = `en.html` (flat), served at `/en` by Cloudflare Pages'
   clean-URL behavior — same mechanics as `privacy-en.html` → `/privacy-en`.
2. New `_redirects` file with **both** `/index-en /en 301` **and**
   `/index-en.html /en 301` (the SEO runbook and older links use the `.html`
   form; the clean-URL rule alone would 404 the deleted asset).
   `website-deploy.yml` adds `_redirects` to its fail-loud copy list. **Gate
   rename surgery (S1):** `index-en.html` is deleted and `en.html` created — this
   requires updating **five** hard-coded constants in `quality_gate.py` in the
   same PR, or CI goes red on a missing file: `REQUIRED_FILES` (drop
   `index-en.html`, add `en.html` + `_redirects`), `WIDGET_HTML_FILES`,
   `CHAT_WIDGET_HTML_FILES`, the `HTML_RULES` key, and the
   `DISALLOWED_HTML_PATTERNS` key. The `HTML_RULES` entry for `en.html` keeps the
   `noindex` requirement (S1 ships dark) but its **canonical rule flips from
   "must be `/`" to "must be `/en`"** (else S1's self-canonical fails CI). S2 then
   drops the `noindex` requirement (else S2's de-noindex fails CI).
3. Legal EN pages keep their existing `-en` suffix URLs (already public, already
   paired via hreflang). Their in-page nav is corrected in this epic: the "Home"
   link (currently `/index-en`, dead after the delete) → `/en`, and the "site
   form" link (currently `/#participerFr`, the FR home) → `/en#participer`.

### D3 — EN forms reuse the FR Formspree endpoints

The EN home posts to the **same** Formspree endpoints (`mqaqqvab` newsletter,
`xeellqan` questionnaire) with the existing hidden `lang` field set to `en` —
the discriminator is already in place on the FR forms. The form **status/error
message tables currently live inline in `index.html`'s bottom `<script>`**; S1
moves them into `site.js` / the catalog (D1 clause 3 decision) so they are
localized like any other string, keeping the inline bootstrap language-neutral.
The `_gotcha` honeypot (present on the
questionnaire form) is preserved. The RGPD **consent-checkbox label and the
consent note are `data-i18n` keys** (translated to EN), and the consent-note
legal links are rewritten to the `-en` pages (D1 clause 3) so an EN submitter
gets EN consent wording and lands on EN legal pages. *Rejected alternative*:
dedicated EN endpoints — splits submissions, burns Formspree free-tier form
quota, and adds nothing the `lang` field doesn't already provide.

### D4 — Language switcher: top-right autonym toggle, suggestion banner, no auto-redirect

Grounded in the `i18n` skill (Google Search Central, W3C, Nielsen Norman Group,
MDN). Clauses:

1. A visible language switcher in the **top-right of the header** (the
   conventional, expected placement — NN/G) on both homes. It is a pair of
   plain `<a>` links `/` ↔ `/en` — same mechanics as the legal pages'
   `.lang-switch` — so it works with **JavaScript disabled** (progressive
   enhancement). The switcher points at the **translated equivalent of the
   current page**, never the homepage. *(Amended 2026-07-13: the original
   clause also mirrored the switcher in the footer; the mirror was dropped
   after the maintainer's UX review — the header is sticky, so the primary
   switcher is already visible at every scroll position, making the footer
   copy redundant. On mobile the header switcher sits one tap away behind the
   burger; the S3 suggestion banner covers first-visit discovery.)*
2. **Labels are autonyms** — `Français` / `English` (a short `FR / EN` toggle is
   the compact variant), each language named in its own language. The active
   language is visually marked. **No flags** — a flag denotes a country, not a
   language ("flags are not languages", NN/G): English is not the US or UK flag,
   French is not only France's. This is an explicit rejection of the
   flag-toggle idea.
3. A **one-time, dismissible suggestion banner** on the two homes only: on first
   visit, if `navigator.languages` prefers the other language and no choice is
   stored, it offers the twin ("This page is available in English →" / the FR
   mirror). It **suggests**, it does not switch. Detection matches
   `navigator.languages` by BCP 47 lookup (fall back `en-US` → `en`).
4. Any explicit action (toggle click, banner accept or dismiss) stores the
   choice in `localStorage` key **`bb-lang`**; a stored choice suppresses the
   banner permanently. **No automatic redirect or auto-swap, ever.** Rationale
   (Google *Managing Multi-Regional and Multilingual Sites*): "Avoid
   automatically redirecting users … These redirections could prevent users
   (and search engines) from viewing all the versions of your site." Googlebot
   crawls from the US **without** an `Accept-Language` header, so a
   language/geo redirect can leave the localized version un-crawled and
   un-indexed. It also violates the project's advisory-never-coercive philosophy
   (educated default + override). The site is static on Cloudflare Pages: it
   cannot read `Accept-Language` at all without an edge worker — deliberately not
   added.
5. **Privacy disclosure**: `bb-lang` is a functional, user-initiated preference —
   exempt from prior consent (CNIL functional-storage exemption; aligns with
   WP29 Opinion 04/2012) but it **must be disclosed**. `cookies.html` +
   `cookies-en.html` gain a "Local storage" section (key `bb-lang`, purpose =
   remember language choice, **lifetime = persistent until the visitor clears
   site data**, why no consent banner is required) in the **same PR** that
   introduces the storage. The cookies page is the correct home (ePrivacy/CNIL
   treat cookies + localStorage as one `traceurs` family); the privacy page does
   not additionally need it. The pages' "no tracking / no analytics" claims
   remain true and untouched.

*Rejected alternatives:* **flags as language labels** (country ≠ language, NN/G);
**auto-display/redirect by browser language** (Google discourages it; un-crawled
localized pages; needs an edge worker this site deliberately avoids);
**English-by-default with a FR opt-out** (buries the current primary — French —
audience, inverts `x-default`, and contradicts the FR-first project identity per
`feedback_ui_french_only`; English visitors are already served by the
suggestion banner + a shareable `/en` URL without demoting French).

### D5 — SEO switch (reverses the SEO_RUNBOOK de-index decision)

1. Remove `noindex,follow` from the EN home and the 4 EN legal pages. Every EN
   page canonicals to **itself**. Note the EN home canonical is an **active
   defect being corrected**: `index-en.html` currently canonicals to the FR root
   (`/`), i.e. it canonicalizes a locale to the master — a real SEO bug that
   drops EN from the index. The generator must emit `canonical=/en` (never `/`)
   from S1; because S1 keeps `noindex` and Google honors `noindex` regardless of
   canonical, S2 reduces to dropping the robots meta.
2. Reciprocal hreflang cluster (`fr`, `en`, `x-default`) on **every** FR/EN pair.
   This requires two additions the recon surfaced: (a) the **FR home
   `index.html` gains `hreflang="en" → /en`** (today it advertises only `fr` +
   `x-default`); without the return tag the whole cluster is ignored by Google.
   (b) the **4 legal pairs gain `x-default` → the FR clean URL** (today they have
   none). `x-default` stays the **FR** page (FR-first project). A new gate check
   asserts hreflang **reciprocity + self-reference completeness** across every
   pair (not just the existing "no `.html` in href" guard).
3. `sitemap.xml`: **`check_sitemap_policy` was already widened by the
   now-merged PR #1384 (audit Lot 5, commit `803693a`)** to a set allowlist
   `{/, /legal, /privacy, /cookies, /terms}` (membership check) plus the matching
   `sitemap.xml` entries — the earlier "landing-pages-only" intent is superseded.
   This epic's contribution is **additive**: S2 adds `/en` to that allowlist and
   to `sitemap.xml`. Target end state = `{/, /legal, /privacy, /cookies, /terms,
   /en}`. The **4 EN legal pages stay OUT of the sitemap** even after S2
   de-noindexes them (secondary pages, paired to their FR twin via hreflang);
   S2 updates Lot 5's inline "because noindex" rationale comment accordingly.
4. The EN home gets full OG/Twitter meta **including `og:locale=en_US` +
   `og:locale:alternate=fr_FR`** (FR home gets `fr_FR` + `en_US` alternate);
   without `og:locale`, LinkedIn/Facebook default the card to `en_US` and the
   FR/EN distinction is invisible to scrapers. The EN FAQPage JSON-LD is
   catalog-derived (D1 clause 3), and the gate's ban on
   `SoftwareApplication`/`Review`/`aggregateRating` schema applies to `en.html`
   unchanged. **This OG/JSON-LD is shipped in S1** (see rollout); S2 only asserts
   it via the gate rather than re-authoring it.
5. `SEO_RUNBOOK.md` is rewritten to record the reversal (EN indexed from now on).

## Consequences

### Positive

- A real, promotable `https://brasse-bouillon.com/en` — unblocks Reddit and
  international community posting without wasting the traffic.
- Drift on the most-edited page becomes **structurally impossible**; missing
  translations become CI failures instead of silent rot.
- Legal twins finally get a freshness guard (the exact pain lived before #1379).
- Deploy stays build-less (generated output is committed); no new runtime
  dependency, no framework, no CDN.

### Negative

- A generation step now exists on a deliberately tool-free site: after editing
  home copy, a contributor must run `build_i18n.py` (CI fails loudly if
  forgotten).
- `data-i18n` attributes add markup noise to `index.html`; `en.html` diffs are
  generated noise in PRs.
- Mixed URL scheme: `/en` home vs `-en` suffixed legal pages. (Confirmed a
  cosmetic-only tradeoff: hreflang/canonical use absolute URLs and are
  scheme-agnostic — no reciprocity or indexing impact.)
- The generator scope is larger than "translate element text": it must also
  localize the inline bootstrap `<script>` (message tables, toggle labels,
  `onclick` language arg) and derive the FAQPage JSON-LD — the genuinely hard
  part of S1.

### Mitigations

- The script is stdlib-only, documented in `packages/website/CLAUDE.md` and
  `CONTRIBUTING.md`; the CI regen-diff makes "forgot to regenerate" impossible
  to merge.
- The generated-file marker + gate rule prevent hand edits to `en.html`;
  reviewers collapse it and review `index.html` + the catalog instead.
- Legal URLs are low-traffic and already public; hreflang pairs them correctly
  regardless of scheme. A full `/en/` migration remains possible later (deferred).

## Alternatives considered

- **Client-side runtime i18n** (one URL, JS swaps strings): SEO-hostile (crawlers
  and link previews see one language), breaks progressive enhancement, and makes
  the OG link card — critical for Reddit — single-language. Rejected.
- **Static-site generator** (Eleventy, Astro, …): solves i18n but contradicts the
  deliberate build-less architecture (ADR-0014 spirit), adds a dependency tree to
  a 10-page site, and forces a deploy-time build. Rejected.
- **Server-side language negotiation** (redirect by `Accept-Language`): SEO
  cloaking risk, removes user agency, cache complexity on Cloudflare. Rejected —
  detection is advisory only (D4 banner).
- **Full generation (option B)** and **guarded twins everywhere (option A)**:
  scored in the D1 matrix; rejected on contributor UX / drift grounds
  respectively.

## Rollout (epic slices)

| Slice | Content | Ships |
|---|---|---|
| **S1 — Real EN home** | D1 mechanism (annotations + attr/EN-only grammar, catalog with `srcHash`, `build_i18n.py`, committed `en.html`), D2 URL (`/en` + `_redirects` incl. `.html`, workflow copy, **5-constant gate rename** + canonical-rule flip to `/en`), D3 forms (`lang=en`, inline-script + consent localization, `-en` legal links), EN OG/Twitter incl. `og:locale`, catalog-derived FAQPage JSON-LD, the **"app ships in French first" honesty line + name gloss** (EN-only inserts), header autonym lang links (D4 clause 1, JS-free; the footer mirror shipped in S1 was dropped post-S1 — see the clause's 2026-07-13 amendment), EN legal in-page nav fix (`/en`, `/en#participer`), gate + pytest updates. `noindex` **kept** (ship dark, QA live); `en.html` self-canonical from day one so S2 is a robots-meta flip. | **Unblocks direct-link Reddit posting** |
| **S2 — SEO switch** | D5: de-noindex EN pages, add `hreflang="en"` to the FR home + `x-default` to the 4 legal pairs (reciprocity gate), add `/en` to the merged #1384 sitemap allowlist + `sitemap.xml`, SEO_RUNBOOK reversal. | Search traffic |
| **S3 — Switcher UX** | D4 clauses 3–5: suggestion banner (`navigator.languages`), `bb-lang` persistence, **cookies-page disclosure (FR+EN)**. (Clause 1–2 — the plain autonym toggle — already shipped in S1. This slice adds the only new privacy-disclosure surface; it is the first to cut if scope tightens.) | Language UX |
| **S4 — Process hardening** | D1 clause 5 (legal freshness stamps), `packages/website/CLAUDE.md` § Languages rewrite (twin rule → source+catalog rule for home), CONTRIBUTING/README updates. | Anti-drift process |

Coordination:

- **PR #1384 (audit Lot 5 — sitemap/social/favicon) is now MERGED** (`803693a`,
  2026-07-10). It edited `index.html`, all legal pages, `sitemap.xml`, and
  rewrote `check_sitemap_policy` to a legal-inclusive set allowlist. The epic
  branch **rebases onto the current `main`** (which includes it); S2 adds `/en`
  to the already-widened allowlist rather than defining a new one. Note #1384
  also added OG/Twitter meta to `index.html` and the (soon-replaced) EN stub —
  S1's generator work builds on that OG baseline.
- The parallel **"Académie" home-section** work also edits `index.html` (FR
  authored source) — whichever of it and S1 lands second rebases; if it lands
  **after** S1, its PR must add `data-i18n` keys + catalog entries, which the CI
  key-parity + `srcHash` guard enforces automatically.
- EN copy voice/tone and the Reddit-readiness checklist live in
  `packages/website/docs/EN_LAUNCH_PLAYBOOK.md`.

Deferred (explicitly out of scope): EN `404.html`; `/en/` folder migration;
bilingual mobile-app UI (separate epic, #1075); year-round content localization
beyond the home + legal set.

## Verification

- **CI (quality gate)**: regen-diff on `en.html` (byte-identical); key parity
  (`data-i18n`/`data-i18n-attrs`/`data-i18n-en-only` ↔ catalog); **`srcHash`
  freshness** (FR source changed ⇒ EN value + hash must change); **hreflang
  reciprocity + self-reference completeness** across every pair; **FAQPage
  JSON-LD text == visible `<details>` text**; legal freshness stamps; `en.html`
  HTML rules (lang, marker, canonical `= /en`, schema bans); sitemap allowlist
  (`/en` a member after #1384); cookies pages must list `bb-lang` once S3 lands.
- **Tests**: `tests/test_quality_gate.py` extended; new `tests/test_build_i18n.py`
  (happy: clean generation; sad: missing/orphaned key fails, FR-changed-without-
  EN fails via `srcHash`; edge: attribute translations, EN-only inserts, inline
  `<script>` message-table + `onclick` swap, catalog-derived JSON-LD, id-suffix
  rewrite, byte-identical re-run).
- **pr-pre-reviewer checklist**: flag any `packages/website` diff that edits
  `en.html` by hand, or edits FR home copy without touching
  `i18n/home.en.json`.

## Relation to other ADRs / References

- **ADR-0014** — hosting stays Cloudflare Pages, deploy stays build-less: the
  generator runs at authoring time and its output is committed.
- **Epic #1075** (marketing needs study) — bilingual FR+EN reach is the
  international wedge this ADR implements for the marketing site.
- **PR #1379** — rewrote the 8 legal pages (LCEN/RGPD); their accuracy
  constraint drives D4 clause 5 (disclosed `bb-lang` storage).
- **PR #1384** — audit Lot 5 (sitemap/social/favicon), merged `803693a`; widened
  `check_sitemap_policy` to `{/, /legal, /privacy, /cookies, /terms}`; S2 adds
  `/en` to it (see Coordination).
- **`packages/website/docs/SEO_RUNBOOK.md`** — records the EN de-index
  decision that D5 reverses; updated in slice S2.
- **`packages/website/docs/EN_LAUNCH_PLAYBOOK.md`** — editorial companion
  (voice/tone, transcreation calibration, Reddit-readiness checklist).

**Realized by** (UML deliverables):
- `docs/architecture/diagrams/website-i18n/01-use-case.md`
- `docs/architecture/diagrams/website-i18n/02-sequence-language-switch.md`
- `docs/architecture/diagrams/website-i18n/03-data-flow-content-pipeline.md`
