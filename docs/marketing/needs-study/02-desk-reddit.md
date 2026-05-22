# Desk Research — r/Homebrewing

**Method / uncertainty flag:** Reddit blocks automated fetching (both `www.reddit.com` and
`old.reddit.com`), and `site:reddit.com` queries were deflected. Findings are triangulated from
(a) the closely-mirrored HomeBrewTalk and Brewer's Friend forums, (b) high-traffic clone-recipe
compilations whose existence is itself a demand signal, and (c) the official Brewfather sharing
model. Frequency signals are **inferred**, not thread counts. Ranking is directional.

## Ranked recurring themes

### 1. Demand to clone a specific commercial/craft beer — VERY HIGH
Reproducing a named beer is one of the most common goals. Structural signal: large editorial
compilations exist purely to satisfy it (AHA "Top 50 Commercial Clone Recipes," Beer Maverick
"100+ Commercial Beer Clone Recipes," style-specific roundups). Most-cloned targets cluster around
hype/hard-to-get beers: Pliny the Elder, Tree House Julius, WeldWerks Juicy Bits, Founders,
Deschutes. Driven by aspiration (recreate a beer you love / can't easily buy).

### 2. "Clone recipes are only a starting point" — accuracy/reproducibility frustration — HIGH
Published clones often don't taste like the original or are outdated. The canonical 2009 Pliny
recipe was called "horribly bitter" and "didn't taste anything like Pliny." Brewers treat published
recipes as a base guideline and adapt them to their own system. This is a need for *iterative,
versioned, community-validated* clones — not one static PDF.

### 3. Recipe organization / brew-log tracking — chronic, unsolved-feeling — HIGH
Persistent thread genre about keeping recipes, brew logs, tasting notes and batch history in one
reviewable place. People bounce between Excel, Word, notebooks and BeerSmith; the frustration is
wanting "everything in one view" and notes that stay "meaningful when reviewing them later."

### 4. App churn & feature gaps (Brewfather vs Brewer's Friend vs BeerSmith) — HIGH
Comparing/switching apps is perennial. Drivers: BeerSmith powerful but dated/clunky; Brewfather
modern UI + multi-device (the current darling); Brewer's Friend web-based but weaker mobile and
confusing water calculators. Migration friction and water-chemistry UX are the loudest specifics.

### 5. Recipe-SHARING tooling is weak — attribution, multi-group, bulk export — MEDIUM-HIGH
From Brewer's Friend feature requests: sharing **strips authorship** ("intellectual property
concerns"); you can share with only **one group** at a time (users want multi-club sharing with
credit preserved); no **bulk export** of selected recipes. Sharing is wanted but feels like an afterthought.

### 6. Recipe discovery & social layer is thin — MEDIUM
Brewfather's public Library has browse/search, key stats, and up/down votes/views/downloads — but
**no comments, no following, limited profiles**, and **publishing requires a paid subscription**.
Discovery exists; conversation around a recipe does not. Clear whitespace.

### 7. Recipe scaling / efficiency conversion when adopting someone else's recipe — MEDIUM
A recipe built on another brewer's equipment/efficiency doesn't translate cleanly — the hidden tax
on any sharing feature. Sharing only works if the platform re-scales to the recipient's system.
(Lower confidence — inferred from calculator discussions.)

## Targeted assessments

- **Desire to clone specific beers:** strong and central, not niche. Validates the hero angle.
- **Willingness to share own recipes vs just consume:** net-positive but with a consumption skew.
  Genuine sharing culture exists, but more people *seek* clones than *publish* polished ones, and
  sharers care about **attribution/credit**. A low-effort, credited sharing flow could convert lurkers.
- **Do they complain current sharing is bad?** Yes, concretely: authorship stripped, single-group-only,
  no bulk export (Brewer's Friend); paywalled publishing, no comments/follows (Brewfather).

## Signal on the community/clone hero hypothesis

**Supported, with caveats.** Cloning a specific beer is a top-tier, emotionally-driven motivation,
and the dissatisfaction is not "no tools exist" but "tools clone poorly, share clumsily, and don't
talk to each other." The strongest differentiated wedge is the **intersection**: a
community-validated, versioned, credited, auto-rescaled clone recipe — i.e. solving themes 2, 5, 6, 7
together. Nobody owns "the place where the community collaboratively dials in the Pliny/Julius clone
and you fork it to your system." Foundation features (organization + tracking) are demanded
(themes 3, 4) and must be solid, but they are not where you win.

**Caveat / next step:** relative frequency of "clone" vs "organization" vs "sharing" is inferred,
not measured on the subreddit. Harden by sampling r/Homebrewing threads via the Reddit API and
tagging by theme. Note r/TheBrewery skews pro/commercial — weaker proxy for the intermediate-homebrewer persona.

## Sources
- https://homebrewersassociation.org/top-50-commercial-clone-beer-recipes/
- https://beermaverick.com/over-100-commercial-beer-clone-recipes-from-the-breweries-themselves/
- https://beermaverick.com/top-recipes-to-homebrew-the-most-iconic-hazy-ipas-ever/
- https://www.brewersfriend.com/forum/threads/has-anyone-in-this-forum-attempted-a-pliny-clone.11917/
- https://www.brewersfriend.com/forum/threads/suggested-fixes-and-features.12138/
- https://homebrewtalk.com/threads/brew-logs-and-recipe-tracking.498700/
- https://homebrewtalk.com/threads/brewfather-or-brewers-friend.694796/
- https://homebrewtalk.com/threads/brewfather-vs-brewers-friend.673669/
- https://docs.brewfather.app/library
- https://homebrewacademy.com/brewing-software-comparison/
