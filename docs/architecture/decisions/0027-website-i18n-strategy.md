# ADR-0027 — Website Internationalization Strategy (Bilingual FR+EN Marketing Site)

**Status**  Proposed
**Date**    2026-07-10
**Owners**  @benoit-bremaud

---

## Context

The marketing site (`packages/website`) is an intentionally **build-less** static
HTML/CSS/JS site on Cloudflare Pages (ADR-0014). It is French-first: the English
home (`index-en.html`) is an 83-line "coming soon" stub, `noindex,follow`, with a
canonical pointing to the FR home — a **deliberate de-indexing decision** recorded
in `SEO_RUNBOOK.md`. The 4 EN legal twins (`legal-en`, `privacy-en`, `cookies-en`,
`terms-en`) exist and were rewritten for LCEN/RGPD compliance in PR #1379, but are
also `noindex` while EN is a stub.

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
   localStorage, no analytics — and `cookies(-en).html` / `privacy(-en).html`
   explicitly promise it (made accurate in #1379). Any language-preference
   persistence must keep those pages truthful.

### Documented study (why we are not guessing)

A full repo reconnaissance (2026-07-10) inventoried: the page pairs and their
URL scheme (`-en.html` suffix served at clean URLs), the exact `<head>` SEO state
of every pair (FR home advertises `fr` + `x-default` only; legal pairs advertise
`fr`+`en`), the 9 quality-gate check functions and which ones hard-code the
current EN policy, the `_site/` staging steps, and the absence of any storage
API usage in `site.js`. The matrices below score against those facts, not
assumptions.

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
   Translatable elements are annotated with `data-i18n="<key>"` (attribute
   variants — `alt`, `aria-label`, `content` — via `data-i18n-attrs`).
2. English strings live in `packages/website/i18n/home.en.json`
   (key → EN HTML fragment).
3. `scripts/build_i18n.py` (Python 3, **stdlib only**, same standard as
   `quality_gate.py`) generates `en.html` from `index.html` + the catalog + a
   head-override table (title, description, canonical — **self-referential to
   `/en` from the first generation, even while S1 ships dark** (see D5 clause
   1) —, hreflang, OG/Twitter, FAQPage JSON-LD, `lang` attributes, hidden form
   `lang` field, `…Fr` → `…En` DOM id suffixes expected by `BBShared`).
4. The generated `en.html` is **committed** (deploy stays build-less). It opens
   with a `<!-- GENERATED FILE — edit index.html + i18n/home.en.json instead -->`
   marker. CI enforces: (a) regeneration is clean (`build_i18n.py` then
   `git diff --exit-code`), (b) **key parity** — every `data-i18n` key has a
   catalog entry and vice versa. A FR copy change without its EN translation
   fails CI: that is the drift guard.
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
2. New `_redirects` file with `/index-en /en 301`; `index-en.html` is deleted.
   `website-deploy.yml` adds `_redirects` to its fail-loud copy list; the gate
   adds it to `REQUIRED_FILES`.
3. Legal EN pages keep their existing `-en` suffix URLs (already public,
   already paired via hreflang).

### D3 — EN forms reuse the FR Formspree endpoints

The EN home posts to the **same** Formspree endpoints (`mqaqqvab` newsletter,
`xeellqan` questionnaire) with the existing hidden `lang` field set to `en` —
the discriminator is already in place on the FR forms. `site.js` gains an EN
status/error message table (the `BBShared` `fr`/`en` parameter already selects
DOM ids). The `_gotcha` honeypot is replicated. *Rejected alternative*: dedicated
EN endpoints — splits submissions, burns Formspree free-tier form quota, and adds
nothing the `lang` field doesn't already provide.

### D4 — Language switcher: visible toggle, suggestion banner, no auto-redirect

1. A visible **FR/EN toggle** (plain `<a>` links `/` ↔ `/en`) in the header nav
   and footer of both homes — same pattern as the legal pages' `.lang-switch`.
   Works without JavaScript (progressive enhancement).
2. A **one-time suggestion banner** on the two homes only: shown when
   `navigator.language` prefers the other language and no choice is stored.
3. Any explicit action (toggle click, banner accept or dismiss) stores the
   choice in `localStorage` key **`bb-lang`**; a stored choice suppresses the
   banner permanently. **No automatic redirect, ever** — redirecting by
   `Accept-Language`/`navigator.language` risks cloaking-style SEO issues
   (crawlers mostly present `en-US`) and violates the project's
   "advisory, never coercive" design philosophy (educated default + override).
4. **Privacy disclosure**: `bb-lang` is a functional, user-initiated preference —
   exempt from prior consent (CNIL functional-storage exemption) but it **must be
   disclosed**. `cookies.html` + `cookies-en.html` gain a "Local storage" section
   (key, purpose, lifetime, why no consent banner is required) in the same PR
   that introduces the storage. The pages' "no tracking / no analytics" claims
   remain true and untouched.

### D5 — SEO switch (reverses the SEO_RUNBOOK de-index decision)

1. Remove `noindex,follow` from the EN home and the 4 EN legal pages. Every EN
   page canonicals to **itself** — the legal twins already do today, and the EN
   home is generated self-canonical from S1 (D1 clause 3; Google honors
   `noindex` regardless of canonical), so this clause reduces to dropping the
   robots meta.
2. Reciprocal hreflang cluster (`fr`, `en`, `x-default`) on **every** FR/EN pair.
   `x-default` stays the **FR** page (FR-first project, status quo on the home).
3. `sitemap.xml` lists exactly the two landing pages: `/` and `/en` (the
   "landing pages only" sitemap policy is kept, not widened to legal pages).
   `check_sitemap_policy` becomes an explicit allowlist — **coordinate with the
   2026-07 audit Lot 5**, which also patches this check.
4. The EN home gets full OG/Twitter meta and an EN FAQPage JSON-LD (the gate's
   ban on `SoftwareApplication`/`Review`/`aggregateRating` schema applies to it
   unchanged).
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
- Mixed URL scheme: `/en` home vs `-en` suffixed legal pages.

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
| **S1 — Real EN home** | D1 mechanism (annotations, catalog, `build_i18n.py`, committed `en.html`), D2 URL (`/en` + `_redirects` + workflow copy), D3 forms (`lang=en`, EN messages), EN OG/Twitter/JSON-LD, header/footer lang links, gate + pytest updates. `noindex` **kept** (ship dark, QA live); `en.html` self-canonical from day one so S2 is a robots-meta flip. | **Unblocks direct-link Reddit posting** |
| **S2 — SEO switch** | D5 in full: de-noindex, self-canonicals, reciprocal hreflang, sitemap allowlist (coordinate Lot 5), SEO_RUNBOOK reversal. | Search traffic |
| **S3 — Switcher UX** | D4: toggle polish, suggestion banner, `bb-lang` persistence, **cookies-page disclosure (FR+EN)**. | Language UX |
| **S4 — Process hardening** | D1 clause 5 (legal freshness stamps), `packages/website/CLAUDE.md` § Languages rewrite (twin rule → source+catalog rule for home), CONTRIBUTING/README updates. | Anti-drift process |

Coordination: the parallel "Académie" home-section work edits `index.html`
(FR authored source) — whichever of it and S1 lands second rebases; if the
Académie section lands **after** S1, its PR must add `data-i18n` keys + catalog
entries, which the CI guard enforces automatically. EN copy voice/tone and the
Reddit-readiness checklist live in `packages/website/docs/EN_LAUNCH_PLAYBOOK.md`.

Deferred (explicitly out of scope): EN `404.html`; `/en/` folder migration;
bilingual mobile-app UI (separate epic, #1075); year-round content localization
beyond the home + legal set.

## Verification

- **CI (quality gate)**: regen-diff on `en.html`; `data-i18n` ↔ catalog key
  parity; legal freshness stamps; `en.html` HTML rules (lang, marker, canonical,
  schema bans); sitemap allowlist; cookies pages must list `bb-lang` once S3
  lands.
- **Tests**: `tests/test_quality_gate.py` extended; new `tests/test_build_i18n.py`
  (happy: clean generation; sad: missing/orphaned key fails; edge: attribute
  translations, JSON-LD, id-suffix rewrite).
- **pr-pre-reviewer checklist**: flag any `packages/website` diff that edits
  `en.html` by hand, or edits FR home copy without touching
  `i18n/home.en.json`.

## Relation to other ADRs / References

- **ADR-0014** — hosting stays Cloudflare Pages, deploy stays build-less: the
  generator runs at authoring time and its output is committed.
- **Epic #1075** (marketing needs study) — bilingual FR+EN reach is the
  international wedge this ADR implements for the marketing site.
- **PR #1379** — rewrote the 8 legal pages (LCEN/RGPD); their accuracy
  constraint drives D4 clause 4 (disclosed `bb-lang` storage).
- **`packages/website/docs/SEO_RUNBOOK.md`** — records the EN de-index
  decision that D5 reverses; updated in slice S2.
- **`packages/website/docs/EN_LAUNCH_PLAYBOOK.md`** — editorial companion
  (voice/tone, transcreation calibration, Reddit-readiness checklist).
