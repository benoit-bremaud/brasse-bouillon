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
- [ ] `og:image`: the EN home serves the localized `og-image-en.png` card
      (shipped in S2 — the FR card's tagline is French; the generator swaps
      `og:image`/`twitter:image` from the catalog's `head.ogImage`).
- [ ] Both forms accept EN submissions (`lang=en`) with EN success/error
      messages (the message tables are moved into `site.js`/the catalog in S1,
      so EN strings come from the catalog like any other text).
- [ ] The "app is French-first" honesty line is visible in or immediately
      below the hero section.
- [ ] The FR-interface screenshots are disclosed: the `journey.screensNote`
      EN-only note sits above the FIRST screenshots section (linear readers and
      the root `/en` link we promote both pass it; deep anchor links skip it —
      accepted tradeoff over repeating the note 4x). The app UI is French-only
      until the mobile-app i18n epic (#1075) ships; re-shoot EN screenshots then.
- [ ] EN legal pages linked in the EN footer (already true today).
- [ ] Lighthouse spot-check on `/en` (SEO/A11y/BP — parity with FR scores).

Shipped with slice S2 (2026-07-13): noindex removed on `/en` + the 4 EN legal
twins, reciprocal hreflang clusters (gate-enforced), `/en` in the sitemap,
localized EN share card. Nothing SEO-side blocks posting anymore.

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

## 8. Launch post — frozen draft (2026-07-13)

Validated with the maintainer on 2026-07-13. Constraints baked in: **no
"build in public" claim** (maintainer decision), **no beta-tester
recruiting** (the app UI is French-only; recruiting anglophone testers would
either frustrate them or create delivery pressure on the EN UI), recipe
studio/management leads the feature list, waitlist is the only CTA.

### 8.1 Account runway

The post goes out from the maintainer's **existing personal account** — the
right kind: r/Homebrewing culture trusts people, not brand accounts, and a
fresh or brand-named account posting a project link gets auto-removed
(AutoMod age/karma filters) or read as astroturfing. The handle is
deliberately NOT recorded here: posting will publicly link it to the project
(and, via the site's legal pages, to the maintainer's real name) — that
linkage is made at posting time, not before.

Before the launch post:

1. **Check the account clears the bar**: reasonable age and karma (young or
   near-zero-karma accounts trip AutoMod), and a quick self-review of the
   public history — everything visible there gets associated with the
   project the moment the post lands.
2. **Build r/Homebrewing-specific history (~2–4 weeks, less if the account
   is already seasoned)** — nothing to fake: ask real first-batch questions
   in the Daily Q&A (water profile, hop schedule, kettle sizing), then post
   the actual first 4 L blonde brew day as a genuine "first all-grain batch"
   post. That content is beloved there and builds subreddit trust without
   any growth-hacking.
3. **Then post the launch draft below**, ideally referencing the brew post:
   "I posted my first batch here a few weeks ago — this is the app I built
   alongside it."

### 8.2 Title options

- A. I'm a French homebrewer + developer building a companion app that walks
  you through your first batch — honest feedback welcome
- B. Building an app so first-timers can brew without the fear of screwing it
  up — what do you wish had guided YOUR first batch? *(preferred: asks the
  community a real question)*
- C. My first all-grain batch scared me into building a brewing companion app
  — roast my feature list

### 8.3 Body (frozen)

> Hey r/Homebrewing,
>
> French homebrewer here, career-changer into software. When I planned my
> first real all-grain batch (a modest 4 L blonde), I realized what I
> actually wanted didn't exist: not another calculator, but something that
> tells a beginner what to do, when, and — the part that matters — **why**,
> at every step from recipe to first pour.
>
> So I've been building it for the past year, alongside the batch itself.
> It's called **Brasse-Bouillon** — roughly "brew-broth", a French nod to
> homebrew kettles. What it does today:
>
> - **Recipe studio + your own notebook**: build and tweak recipes with the
>   numbers recalculating live as you touch the grain bill or hop schedule
>   (IBU, ABV, color) — including a reverse hop calculator (target IBU → your
>   additions) and BU:GU balance. Batches scale to YOUR actual kettle and
>   fermenter, not a generic 5 gal assumption. Keep recipes private or share
>   them.
> - **Community clone recipes**: pick a rated, battle-tested recipe instead
>   of improvising your first batch — or import one into your notebook and
>   make it yours. Scan a commercial beer's label and it suggests equivalent
>   community recipes.
> - **Brew-day guidance**: mash/boil/chill steps with timers, target temps,
>   and the reasoning behind each move — no jargon walls, no mental math.
> - **Fermentation tracking**: days, gravity, temperature — one glance and
>   you know where you stand.
> - **A brewing academy**: sourced articles + glossary, because the goal is
>   that you eventually don't need the app at all.
>
> Full honesty, because you'd find out in one tap anyway: it's
> **pre-release** (waitlist only), the app UI ships **in French first**
> (English UI is on the roadmap — the website is already fully in English so
> you can follow along), and it's a **solo project**.
>
> What I'd love from you: what do you wish had guided your first batch? What
> almost made you quit? I'd rather build that than another feature nobody
> needs.
>
> Site (English): https://brasse-bouillon.com/en

### 8.4 Prepared replies (the two inevitable questions, §6)

**"Where's the app? / Can I try it?"**

> Not yet — progressive beta in 2026, waitlist first. I'd rather ship
> something that actually survives contact with a first-time brewer than
> rush it. The site has the full feature tour with real screenshots (French
> UI for now — that's what ships first).

**"Why French?"**

> Because I built it alongside my own first real batch, in my own language,
> and I'd rather nail the guidance in one language than be mediocre in two.
> English UI is on the roadmap; the site is already fully English so
> English-speaking brewers aren't locked out in the meantime.

### 8.5 Mod pre-message (optional)

> Hi mods — French homebrewer/dev here. I'd like to post a "building a
> first-timer companion app, honest feedback welcome" post (pre-release, no
> sales, waitlist only). Happy to adjust framing to fit the self-promo
> rules. OK to post?
