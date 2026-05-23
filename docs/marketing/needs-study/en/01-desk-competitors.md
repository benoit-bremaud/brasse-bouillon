# Desk Research — Competitor App Reviews

Source families: App Store / Google Play review summaries, Reddit/forum comparisons, comparison
blogs, official docs. **Caveat:** HomeBrewTalk and some review pages returned 403; Reddit thread
bodies were not retrievable, so a few claims lean on search snippets and are flagged. Star ratings
are listing summaries at time of search (May 2026).

## Per-competitor findings

### Brewfather (cloud-based; the sentiment leader)

**Praise**
- Best-in-class cross-device cloud sync (design on laptop, log gravity on phone) — the most-cited reason to switch.
- Clean, modern, non-overwhelming UI; fast onboarding.
- Strong batch system (each brew = a variation of a master recipe) + fermentation tracking; Tilt/Grainfather integrations (the in-app Tilt chart is a named purchase driver).
- Ad-free, responsive dev support, cheap (~$20/yr).

**Complaints / gaps**
- Subscription-only for full features; no one-time purchase — recurring-cost resentment is the most common con.
- Limited offline functionality (needs internet for most features).
- Can feel feature-overwhelming at first.
- Community library exists but **publishing recipes is paid-tier-gated**, and free users hit recipe-count limits even when *copying* a community recipe.

### BeerSmith Mobile (one-time purchase; desktop heritage) — worst-rated (≈2.9★ App Store)

**Praise**
- Most established/trusted calculation engine in the hobby; very accurate once tuned.
- Integrated brew-day timer with step-by-step reminders.
- One-time purchase, no subscription.

**Complaints / gaps**
- Painful sync: desktop → cloud → phone, so "the same recipe exists 3 times." **Strongest, most concrete pain in the set.**
- Clunky, slow, dated nested-folder UI; search breaks inside nested folders (dev acknowledged file-storage/menu complaints).
- Awkward flows (must go "back" to start the timer after editing).
- No `.bsmx` import on mobile; profiles re-entered per device; sharing requires a cloud download. High learning curve.

### Brewer's Friend (web-first + apps; calculators reputation)

**Praise**
- Best-regarded brewing calculators ("unparalleled") and water-chemistry tools.
- Fully web-based — recipes safe in the cloud.
- Direct ingredient purchasing; large public recipe database.

**Complaints / gaps**
- Free tier capped at 5 recipes **and shows ads**; sync/ad-removal require Premium.
- Weak mobile usability (timer hard to find); some "regret the annual fee" and switched away.
- Reported Android bugs (gravity not updating, metric↔imperial errors, edits not saving) with slow fixes.

### BrewBuddy (iOS utility) — contrast point, not a direct competitor
- Deliberately minimal offline calculators; no accounts, no data saved, no tracking.
- Confirms a niche that distrusts cloud/subscription apps and just wants offline tools.

### Adjacent / signal points
- **Grainfather app:** calculations diverge from Brewfather for the same recipe (equipment profiles) — friction moving recipes between ecosystems.
- **AHA Brew Guru** (recipe + deals + community app): **sunset Feb 1, 2026**, folded back into the AHA website; "limited content," mixed feedback. A dedicated community/recipe app that failed to sustain — a caution for the community hero.
- **Build-A-Beer:** free app whose headline feature is **AI clone-recipe generation** from a beer's characteristics + "share your creations." Direct competitor to the clone/share angle — track it.

## Top unmet needs (ranked by signal strength)

1. **Frictionless sync + true offline without paying or duplicating data** — *very frequent.* BeerSmith triple-copy is the loudest single complaint; Brewfather online dependency echoes it. Brewing happens in garages/cellars with poor connectivity.
2. **Subscription / paywall friction** — *very frequent.* Free tiers feel crippled (publishing, sync, import/export gated).
3. **Modern, uncluttered mobile UX** — *frequent.* Brewfather wins precisely by being clean — UX is a proven differentiator.
4. **Reliable recipe organization & search** — *moderate.* BeerSmith search breaks in nested folders.
5. **Easy, low-friction recipe sharing** — *moderate.* Sharing is awkward (cloud download / paid publishing). Demand exists but is partly served.
6. **Bug-free reliability & accurate calculations** — *moderate.* Cross-app calculation divergence undermines trust when moving recipes.
7. **Inventory / cost tracking, device integrations (Tilt)** — *occasional but loyalty-driving.*

## Signal on the SHARING / CLONING / COMMUNITY hero hypothesis

- **Cloning commercial beers: strong, durable demand.** AHA 50-state clone guides, BrewDog *DIY Dog*, Beer Maverick 100+, Build-A-Beer all exist because demand is real and recurring. Validates the clone angle.
- **Community recipe libraries: validated but partly served and hard to monetize.** Brewfather/Brewer's Friend show users want to browse/copy others' recipes — but publishing is paywalled and copying is capped, leaving an opening for a more open, sharing-first model. Caution: Brew Guru's Feb-2026 sunset shows in-app social is unproven as a *primary* retention driver; most "community" lives on Reddit/Discord/Facebook/forums today.
- **Implication:** the *cloning + open sharing* combination is the most defensible hero. Frame pure "social" as connective tissue around clone-sharing, not a standalone feature. Foundation features target the top-4 unmet needs and are table-stakes for retention.

## Positioning map

A **positioning map** places competitors on two axes that matter to the user, to make the **corner nobody
occupies** visible. The two axes, drawn from the desk research:

- **horizontal**: *Simple / guided* ←→ *Powerful / calc-expert*;
- **vertical**: *Solo / private* ←→ *Community (recipe sharing)*.

|  | **Simple / guided** | **Powerful / calc-expert** |
|---|---|---|
| **Community (sharing)** | ◎ **Brasse-Bouillon** (target) · Build-A-Beer | Brewer's Friend |
| **Solo / private** | Little Bock | Brewfather · BeerSmith |

**Placements (desk perception, confidence level):**

- **BeerSmith** — far *powerful + solo*: desktop heritage, deep calculations, near-zero sharing, duplicated data. [HIGH]
- **Brewfather** — *powerful + mostly solo*: modern UX, but library/publishing paywalled → community capped. [HIGH]
- **Brewer's Friend** — *powerful + somewhat community*: reputed calculators + recipe browsing/copying, publishing capped. [MED]
- **Little Bock** (FR) — *fairly simple + somewhat community*: accessible FR tool, recipe base, free. [MED]
- **Build-A-Beer** — *simple + community*: AI clone-recipe generation + sharing, free. **Sole occupant of our corner.** [HIGH]
- **Brasse-Bouillon** (target) — *simple/guided + community*: beginner assistant first, then versioned/credited/rescaled clone.

**Strategic reading:**

- The *simple + community* corner (top-left) is **near-empty**: only **Build-A-Beer** sits there → that is our battleground, **not** Brewfather/BeerSmith (who dominate the bottom-right *powerful + solo*, terrain we avoid — consistent with "don't compete on calculation").
- Differentiation *within* the corner, against Build-A-Beer: disposable AI generation is not a **versioned + credited + rescaled** community clone recipe backed by a **guided assistant**. That is the depth Build-A-Beer lacks.
- Guardrail: the community zone is lethal if led *alone* (Brew Guru sunset, Feb 2026) → enter via the **assistant** (bottom-left → top-left), community as a **retention layer**.

*Hypothesis to confirm in the field: these placements reflect desk-derived perception, not a measurement.*

## Sources
- https://homebrewacademy.com/brewing-software-comparison/
- https://play.google.com/store/apps/details?id=com.warpkode.brewfather&hl=en_US
- https://docs.brewfather.app/library
- https://docs.brewfather.app/faq
- https://hazyandhoppy.com/why-i-switched-to-the-brewfather-app/
- https://apps.apple.com/us/app/beersmith-mobile-home-brewing/id640670118
- https://apps.apple.com/us/app/brewers-friend/id1580297037
- https://apps.apple.com/us/app/brewbuddy-homebrew-tools/id6450740421
- https://homebrewersassociation.org/news/brew-guru-sunsetting-feb-1/
- https://homebrewersassociation.org/top-50-commercial-clone-beer-recipes/
- https://beermaverick.com/over-100-commercial-beer-clone-recipes-from-the-breweries-themselves/
- https://buildabeer.app/
