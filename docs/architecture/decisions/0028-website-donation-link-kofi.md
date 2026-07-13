# ADR-0028 — Website Donation Link: Ko-fi One-Off "Buy Me a Beer", Plain Outbound Link Only

**Status**  Accepted
**Date**    2026-07-13
**Owners**  @benoit-bremaud
**Related** ADR-0014 (Cloudflare Pages hosting), ADR-0027 (home i18n pipeline)

---

## Context

Brasse-Bouillon is a solo, self-funded personal project. The marketing site
(`packages/website`) should offer visitors a lightweight way to support the
project financially — the classic "buy me a coffee" pattern, beer-themed for
obvious brand reasons ("Offrez-moi une bière"). The gesture targeted is a
**casual one-off tip of a few euros**, not memberships or crowdfunding.

Constraints that shaped the decision:

1. **Sovereignty-first house rule.** French/EU vendors are preferred; US
   vendors only when no viable EU alternative exists.
2. **No company registration yet.** The founder has no SIREN /
   micro-entrepreneur status today (registration is a deferred item of the
   legal-compliance workstream). Any platform whose creator onboarding
   requires a French Stripe account (which expects a business status for
   activation) is blocked in practice.
3. **Zero-footprint privacy posture is load-bearing.** The site sets no
   cookies, runs no analytics, and `privacy(-en).html` lists exactly two
   subprocessors (Formspree, Cloudflare). `packages/website/CLAUDE.md` forbids
   third-party scripts before consent; `_headers` ships
   `Permissions-Policy: payment=()` (blocks in-page payment iframes) and a CSP
   is planned (#1032). Any integration that loads third-party JS would break
   this posture.
4. **The home page is bilingual via the ADR-0027 pipeline** — any new visible
   string must be `data-i18n`-annotated with an EN catalog entry, and
   `en.html` regenerated in the same PR.
5. **Primary site conversion is the beta waitlist.** A donation CTA must never
   compete with the waitlist CTA (header/nav/hero slots are reserved for it).

### Documented study (why we are not guessing)

Five candidates were researched on 2026-07-13 against **official, current
sources** (pricing/help pages fetched live; where a vendor blocks fetching,
Wayback snapshots of official articles or the vendor's own source code were
used): Liberapay (FR non-profit), Ko-fi (UK Ltd), Buy Me a Coffee (US Inc.),
Tipeee (FR SAS), and a DIY Stripe Payment Link. Key verified facts:

- **Liberapay**: 0 % platform fee, but one-off donations are officially
  unsupported (recurring-by-design; issue liberapay#415 open since 2016) and
  the donor **must create an account** (issue liberapay#2235). No item
  metaphor (fixed "Donate" button).
- **Ko-fi**: 0 % platform fee on one-off tips **provided the default-on
  "Contributor" status (5 %) is toggled off**; guest checkout (no donor
  account); money lands directly and instantly on the creator's own
  PayPal/Stripe (no wallet, no threshold) — a personal PayPal account
  suffices, no SIREN needed. Its embeddable overlay widget loads Google Fonts
  without consent (GDPR-sanctionable pattern) — only the plain link is clean.
- **Buy Me a Coffee**: 5 % fee, guest checkout, native beer theming, but US
  data processing and Stripe-only payouts ($10 threshold + review; the Stripe
  France activation likely requires a business status).
- **Tipeee**: 8 % fee (VAT incl.), donor account mandatory (~6-step flow),
  payouts monthly one month in arrears, both a bank account AND a PayPal
  account required.
- **Stripe Payment Link**: best raw economics (1.5 % + €0.25 EEA cards, 0 %
  platform) and full theming, but blocked by constraint 2 (KYC expects a
  registered business) and the proceeds are legally turnover, not donations.

Weighted decision matrix (scores 1–5; weight in parentheses):

| Criterion (weight) | Liberapay | Ko-fi | BMC | Tipeee | Stripe link |
|---|---|---|---|---|---|
| One-off donor friction (3) | 1 | **5** | 5 | 2 | 5 |
| FR/EU sovereignty (3) | 5 | 2 | 1 | 5 | 2 |
| Cost to creator (2) | 5 | **5** | 3 | 2 | 5 |
| Creator accessibility, no SIREN (2) | 4 | **5** | 2 | 3 | 1 |
| Host-site GDPR footprint, link-only (1) | 5 | 5 | 5 | 5 | 5 |
| Beer theming (1) | 1 | 3 | 5 | 2 | 5 |
| **Weighted total (/60)** | 42 | **49** | 38 | 38 | 43 |

## Decision

1. **Platform: Ko-fi** (`https://ko-fi.com/brassebouillon`), used for one-off
   tips with the PayPal payout rail, page currency EUR, and **Contributor
   status toggled OFF** (0 % platform fee on tips).
2. **Integration: plain outbound link ONLY** (`target="_blank"
   rel="noopener noreferrer"`). The Ko-fi overlay widget, tip panel, iframe or
   any third-party donation script is **forbidden** on the site — it would
   load Google Fonts without consent, contradict the "no third-party scripts"
   rule, be blocked by `Permissions-Policy: payment=()`, and complicate the
   planned CSP (#1032).
3. **Placements (home pair only)**: (a) a short support sentence at the end of
   the Participate section, **below** the waitlist form so it never competes
   with the primary CTA; (b) a one-line mention in the footer brand block.
   Both go through the ADR-0027 i18n pipeline (`data-i18n` keys + EN catalog +
   regenerated `en.html`). No header/nav/hero placement; legal pages and 404
   excluded.
4. **Privacy posture unchanged.** A plain outbound link processes no visitor
   data on the site: no subprocessor addition to `privacy(-en).html`, no
   cookie-policy change, no consent gating. This holds ONLY while clause 2
   holds — any future embed would reopen the privacy analysis.
5. **Beer framing lives in the site copy** ("Offrez-moi une bière" / "buy me a
   beer"). The hosted Ko-fi page may keep its generic "Support" wording: the
   coffee-metaphor rename is a paid Ko-fi perk we deliberately do not buy.
6. **Sovereignty deviation, recorded and bounded.** Ko-fi (UK) is an assumed
   exception to the sovereignty-first rule: both French candidates fail the
   core use case (Liberapay: no one-off, donor account required; Tipeee:
   donor account + 8 % + payout friction). Standing follow-up: re-evaluate if
   Liberapay ships guest one-off donations, or when the founder registers a
   business (making a Stripe Payment Link viable), or if an EU platform with
   guest one-off checkout emerges.
7. **Fiscal note.** Sums received are declarable income once significant,
   whatever the platform calls them; this is the founder's responsibility, not
   a site concern.

## Consequences

### Positive

- Donors tip in one guest flow (no account), the money reaches the founder's
  PayPal instantly, and the platform takes 0 %.
- Zero change to the site's privacy/cookie claims, headers, sitemap, or
  consent posture; the diff is copy + i18n only.
- The decision is reversible at link-swap cost: the CTA is a plain `<a href>`,
  so migrating platform later touches one URL (and its EN twin via the
  catalog).

### Negative

- Deviates from sovereignty-first: Ko-fi is a UK company and may process data
  outside the EEA (SCCs), payment rails are US-parented (PayPal/Stripe).
- The 0 % fee depends on a manual account setting (Contributor OFF) that Ko-fi
  could re-gate or reprice in the future.
- The hosted donation page is coffee/"Support"-branded, not beer-branded.

### Mitigations

- The donor-facing data relationship is between the donor and Ko-fi, on
  Ko-fi's own pages, under Ko-fi's policies — the site itself sends nothing
  (clause 2 keeps it that way).
- Clause 6 records explicit re-evaluation triggers; the plain-link integration
  makes any migration trivial.

## Alternatives considered

- **Liberapay (FR non-profit, 0 %)** — the best sovereignty and ethics fit,
  rejected because it structurally fails the "one beer, 30 seconds" gesture:
  one-off donations are unsupported by design and donors must create an
  account. Remains the preferred candidate for a future *recurring* support
  channel.
- **Tipeee (FR SAS)** — sovereign and one-off-capable, rejected for the
  mandatory donor account (~6 steps), the highest commission (8 % TTC plus
  donor-side transaction fees), and month-in-arrears payouts requiring both a
  bank and a PayPal account.
- **Buy Me a Coffee (US)** — polished guest UX and native beer theming,
  rejected for US data processing (worst sovereignty score), a 5 % fee, and
  Stripe-only payouts that likely require a business status the founder does
  not have.
- **Stripe Payment Link (DIY)** — best fees and full theming with zero
  platform, rejected today because French Stripe activation expects a
  registered business (SIREN) and recasts donations as commercial turnover;
  explicitly the fallback to revisit once the founder registers a business
  (clause 6).

## Verification

- PR review: any diff adding a script or iframe whose origin matches
  `ko-fi.com` / `storage.ko-fi.com` (or any donation widget) violates clause 2
  — flag citing "ADR-0028 clause 2". Grep pattern:
  `grep -rn "ko-fi" packages/website --include="*.html"` must only ever match
  plain `<a href>` links.
- The existing i18n gate (`quality_gate.py` `check_i18n_home_generated`)
  enforces clause 3's catalog/regeneration discipline automatically.
- The donation URL must stay identical in FR and EN (single language-neutral
  href, no `data-i18n-attrs` href key) unless a localized Ko-fi page ever
  exists.
