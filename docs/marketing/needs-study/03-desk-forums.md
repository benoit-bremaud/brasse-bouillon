# Desk Research — Forums (HomeBrewTalk + brassageamateur.com)

**Method note:** HomeBrewTalk.com blocks automated fetches (HTTP 403), so HBT findings rely on
search-result snippets (titles + indexed excerpts), not full-thread reads. brassageamateur.com pages
were fetched directly. Frequency signals are qualitative (recurrence of distinct threads), not
scraped post-counts.

## Ranked recurring themes

### 1. Demand for clone recipes of specific commercial beers — VERY HIGH
The single most recurrent topic. Continuous "clone of X" request threads on both forums, plus
meta-threads asking where to *find* clones.
- HBT has a long-running clone culture ("Why I Clone Commercial Brews"; "Is there a Clone Recipe database?").
- brassageamateur has a **dedicated clone sub-forum: 133 threads / 170+ shared recipes** (Orval,
  Westmalle, Duvel, Rochefort 10, Westvleteren 12, Hoegaarden, Kronenbourg 1664, Guinness, Punk IPA),
  popular threads with 85–149 replies, active into 2025–2026.

**Assessment:** Clone demand is real, sustained, self-organizing. The recurring "is there a clone
database?" question is direct evidence of an unmet need for a *searchable, curated* clone repository
— the core angle. Caveat to manage in copy: 5-gal cloning can't perfectly match commercial conditions.

### 2. Tool/app dissatisfaction & comparison shopping — HIGH
Constant "which software / X vs Y" threads; users not fully satisfied with any. Specific complaints:
- **Data loss / not trusting the tool as source of truth** ("I have lost enough recipes... I stopped using brewing software as my source").
- **Subscription fatigue** ("I don't see the value in the subscription model").
- **Weak inventory↔recipe linkage** (Brewer's Friend "still lacks inventory management"; can't filter recipes by stock).
- **Poor data portability / migration pain** (BeerXML import losing data; can't separate recipes from batches).
- Apps are "largely self-learning" (steep, undocumented UX).

**Assessment:** Openings = reliability/no-data-loss, fair pricing, gentle onboarding, real
recipe↔inventory linkage. Incumbents are mature on calculation — competing on calc alone loses.

### 3. Recipe organization pain ("too many recipes, no good system") — HIGH
Persistent threads ("Organizing recipes?", "Personal Recipe Database/Records?", "Organization Tips").
Users fall back to **binders, BJCP-category tabs, Evernote tags, Google Docs, multi-tab spreadsheets**
— i.e. they *leave the brewing apps* to organize. BeerSmith folders criticized as rigid.

**Assessment:** Tagging/filtering (by style, ingredient, batch outcome) is a concrete requested win.
Users defecting to general-purpose tools = brewing apps under-serve organization.

### 4. Brew-day / fermentation tracking ("I built my own because nothing was good enough") — HIGH
Heavy volume on logging brew day + fermentation. Strong DIY signal — multiple users built their own
apps (e.g. "I couldn't find a good fermentation log-app for cider/mead, so I built one"). Growing
interest in connected hydrometers (Tilt, iSpindel) feeding fermentation graphs.

**Assessment:** Tracking is a validated foundation feature; "built my own" threads = unmet need.
Tilt/iSpindel import is a recurring ask — flag as v0.2+ (scope).

### 5. Recipe sharing & willingness to share — MEDIUM-HIGH, mostly POSITIVE
Homebrewers are culturally open ("flattered to share... an honor"; "willing to share any recipe").
Existing mechanisms are fragmented/fading: BeerSmith Cloud search, the defunct Hopville, BeerXML
export; recurring "download a full BeerXML database" requests. brassageamateur effectively *is* a
communal recipe library.

**Assessment:** Willingness is high; the gap is a *good* sharing/discovery surface — the bar is
"better than a forum thread + BeerXML file," needing frictionless BeerXML/BeerJSON import/export to
interoperate (not lock-in). Caveat: commercial breweries are protective; *homebrewer-to-homebrewer*
is the open lane.

## English (HomeBrewTalk) vs French (brassageamateur)

| Dimension | HomeBrewTalk (EN) | brassageamateur (FR) |
|---|---|---|
| Scale & cadence | Very large, high-volume, many parallel threads | Smaller but tight-knit; structured sub-forums; multi-year threads |
| Clone targets | US/UK craft + macro (Manny's, Heineken, Spaten, Smithwick's) | Belgian/Trappist + French (Orval, Westvleteren, Duvel, Kronenbourg 1664, Météor) |
| Tooling | Commercial apps: BeerSmith, Brewfather, Brewer's Friend | Free/open + homegrown: **Beerxcel (Excel), Joliebulle (open-source), Little Bock**, BYOB |
| Sharing model | App clouds + BeerXML files; forum text | Forum *is* the shared library; communal Beerxcel/recipe DBs; values free tools |
| Pricing sensitivity | Subscription-skeptical but pays | More resistant to paywalls (Little Bock going paid drew friction) |
| Instability | Mature, stable incumbents | **Joliebulle status uncertain** (one source: closed early 2025; but joliebulle.org + "Joliebulle Studio" appear active) — *conflicting/unconfirmed* |

**Bilingual implications**
- Localize clone seed-content per region (Belgian/Trappist + French macro for FR; US/UK craft for EN) — clone catalogs are not interchangeable.
- FR audience more price-sensitive and free-tool-loyal → the freemium boundary matters more there (consistent with keeping BeerXML/BeerJSON export paid only if the free tier stays genuinely useful).
- FR expects responsive, present maintainers → community management is part of the product.
- BeerXML import/export is table-stakes both sides (capture migrants from BeerSmith/Brewfather EN, Joliebulle/Little Bock FR).

## Net read for positioning
The differentiator (community for cloning + sharing) maps directly onto the two highest-frequency
unmet needs: a searchable curated *clone* database (#1) and a *better sharing surface than forum
threads* (#5), on top of two validated foundations users currently hack together — organization (#3)
and tracking (#4). The moat is **not** calculation; it is curation + community + reliability + fair
pricing + frictionless import/export.

**Key uncertainties:** HBT findings snippet-based (403); frequency qualitative; Joliebulle closure unconfirmed.

## Sources
- https://www.homebrewtalk.com/threads/is-there-a-clone-recipe-database.679618/
- https://www.homebrewtalk.com/threads/why-i-clone-commercial-brews.678756/
- https://www.brassageamateur.com/forum/viewforum.php?f=95
- https://homebrewtalk.com/threads/comparing-homebrewing-software.679134/
- https://homebrewtalk.com/threads/brewfather-vs-brewers-friend.673669/
- https://homebrewtalk.com/threads/scaling-with-beersmith-vs-brewfather-troubles.692447/
- https://homebrewtalk.com/threads/organizing-recipes.232447/
- https://www.homebrewtalk.com/threads/personal-recipe-database-records.99384/
- https://homebrewtalk.com/threads/organization-tips-for-homebrewers.678855/
- https://homebrewtalk.com/threads/i-couldnt-find-a-good-fermentation-log-app-for-cider-mead-so-i-built-one.738999/
- https://homebrewtalk.com/threads/phone-app-for-detailed-brew-day-notes.484531/
- https://homebrewtalk.com/threads/brew-logs-and-recipe-tracking.498700/
- https://www.homebrewtalk.com/threads/recipes-kept-secret.199276/
- https://homebrewtalk.com/threads/where-can-i-download-a-full-beerxml-database.486803/
- https://www.brassageamateur.com/forum/viewtopic.php?t=42555
- https://www.brassageamateur.com/forum/viewtopic.php?t=29232
- https://joliebulle.org/
- https://univers-biere.net/logiciels.php
