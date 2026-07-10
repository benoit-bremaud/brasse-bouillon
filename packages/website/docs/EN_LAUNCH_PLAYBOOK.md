# EN Launch Playbook — voice, transcreation and Reddit readiness

> Companion to ADR-0027 (website i18n strategy). This document owns the
> **editorial** side of the EN launch: how the English copy must sound, how the
> FR copy is transcreated (not translated), and what must be true before
> promoting the site on Reddit / international homebrewing communities.
> Not deployed — `website-deploy.yml` excludes `docs/` except `ROADMAP.md`.

## 1. Voice and tone

The FR voice is playful, direct, second-person singular ("Brasse ta première
bière sans peur de rater."). The EN voice must land for r/Homebrewing natives —
a community allergic to marketing speak. Principles:

1. **Transcreate, never translate literally.** Rewrite each segment for intent
   and rhythm; a faithful-but-flat translation is a failure.
2. **Peer-to-peer builder voice.** Sound like a homebrewer who codes, not a
   brand. First person allowed ("I'm building…") on community posts; the site
   itself stays product-voiced but plain.
3. **Banned register**: "revolutionary", "ultimate", "game-changer",
   "unleash", exclamation-mark stacking, feature hype. If a sentence would be
   downvoted as an ad on r/Homebrewing, rewrite it.
4. **Homebrewer-native vocabulary** (BJCP / BeerXML terms, per house rule):
   batch, mash, boil, pitch, OG/FG, IBU, ABV, fermentation, bottling day.
   Prefer "batch" over "beer" when referring to a brew run.
5. **Dry humor survives; puns must be earned.** Keep the reassuring,
   demystifying angle — the app's maître-mot is that it *teaches*.

## 2. Sample transcreations (calibration set)

| FR (authored) | EN (transcreation) | Why |
|---|---|---|
| Brasse ta première bière sans peur de rater. | Brew your first batch without the fear of screwing it up. | "batch" is native; keeps the reassurance, adds the community's own bluntness. |
| De la recette à la dégustation | From recipe to first sip | "tasting" is flat; "first sip" lands the payoff moment. |
| L'essentiel, rien que l'essentiel | The essentials. Nothing else. | Two fragments punch harder in EN than a mirrored repetition. |
| Une bière t'a plu ? Scanne-la. | Liked a beer? Scan it. | Preserves the two-beat rhythm. |
| Rejoins la première fournée | Join the first batch | The fournée/batch double meaning survives intact — keep it. |
| Les doutes avant de se lancer | The doubts before you brew | FAQ heading; "before you brew" beats a literal "before starting". |

These six are the calibration set: every other segment in `i18n/home.en.json`
is reviewed against their register.

## 3. Terminology and units

- **Metric-first, imperial gloss where cheap.** The app is metric (L, °C, EBC).
  Keep metric as primary; add a parenthetical gloss only in copy examples where
  it helps a US reader, e.g. "19 L (5 gal)". Never convert the app's actual UI
  values in screenshots or claims.
- **Color**: EBC in FR copy stays EBC in EN with SRM gloss if a value appears
  ("EBC 8 (~4 SRM)").
- Keep proper nouns and brand terms untouched: Brasse-Bouillon (with a one-line
  name gloss on the EN home — see Honesty rules).

## 4. Honesty rules (non-negotiable for Reddit credibility)

1. **Say the app ships in French first.** The EN home carries a plain line such
   as: "The app currently ships in French — an English UI is on the roadmap.
   The site, waitlist and questionnaire are fully in English." Reddit will find
   out in one tap; being upfront converts skeptics, hiding it burns the launch.
2. **Screenshots are the real (French) UI** — caption them as such rather than
   mocking up fake English screens.
3. **No app-store claims**: the app is pre-release; the only CTA is the
   waitlist + questionnaire. Never imply availability.
4. Explain the name once: "Brasse-Bouillon — roughly 'brew-broth', a French
   nod to homebrew kettles" (final wording at S1 copy review).

## 5. FAQ adaptation

Transcreate the 5 FAQ entries for an international audience; keep the FAQPage
JSON-LD in sync (generated, ADR-0027 D1 clause 3). France-specific content
(18+ responsibility band, legal references) stays as-is — the site is operated
from France and the EN legal twins already state it.

## 6. Reddit-readiness checklist

Technical — **must be true before any link is posted** (all land in slice S1):

- [ ] `https://brasse-bouillon.com/en` live, full feature parity with FR
      (hero, journey, pillars, scan, FAQ, forms), final URL (no later rename).
- [ ] EN OG/Twitter meta present, incl. `og:locale=en_US` — the Reddit link
      card is built from it.
- [ ] `og:image`: verify the shared `og-image.png` carries no baked-in French
      text; if it does, ship a localized EN card image (else the EN card shows
      French).
- [ ] Both forms accept EN submissions (`lang=en`) with EN success/error
      messages (the message tables are moved into `site.js`/the catalog in S1,
      so EN strings come from the catalog like any other text).
- [ ] The "app is French-first" honesty line is visible in or immediately
      below the hero section.
- [ ] EN legal pages linked in the EN footer (already true today).
- [ ] Lighthouse spot-check on `/en` (SEO/A11y/BP — parity with FR scores).

Recommended before posting (slice S2 — search benefit, not blocking for
direct links): noindex removed, reciprocal hreflang, `/en` in the sitemap.

Community etiquette — per subreddit, before posting:

- [ ] Read the target subreddit's self-promotion rules (r/Homebrewing enforces
      participate-first, roughly 9:1 contribution-to-promo etiquette).
- [ ] Post from an account with genuine participation history; consider
      messaging the mods first for a "I built a thing" post.
- [ ] Frame as a builder-journey post ("I'm building a free companion app to
      guide first-time brewers — honest feedback welcome"), never a bare link
      drop.
- [ ] Be upfront: pre-release, French-first UI, solo project.
- [ ] Prepare the two inevitable answers: "where's the app?" (waitlist,
      pre-release) and "why French?" (built alongside my own first real brew;
      English UI on the roadmap).
- [ ] Be available to reply for the first 24 h after posting.

## 7. Content cadence — keeping EN alive after launch

- A FR home copy change **cannot merge** without its EN counterpart: the CI key
  parity + regen-diff guard (ADR-0027 D1 clause 4) enforces it mechanically.
- Legal pages: the freshness stamp (D1 clause 5) forces an explicit EN
  re-review whenever a FR legal page changes.
- New home sections (e.g. the Académie section designed in parallel) are
  authored FR-first with `data-i18n` keys; their EN transcreation is written in
  the same PR, reviewed against the §2 calibration set.
