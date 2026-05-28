# Desk Research — French Homebrew Market (snowball pass)

Snowball pass aimed at the biggest data gap: the size of the FRENCH / EU amateur-homebrewer base.
**Vocabulary kept strictly separate:** *brasseur amateur* (hobbyist — TARGET) vs *microbrasserie /
brasseur artisanal* (professional — adjacent, not the target). Reliability flags as in `03c`.

## French homebrewer population — the honest answer

**[N/F] There is NO official or reliable count of French amateur homebrewers**, confirmed by insiders:
- The admin of BrassageAmateur.com: *"Tu ne trouveras aucun chiffre officiel"* — no official figure exists.
- Expertise Bière Conseil (2023): *"Paradoxe : une pratique répandue et en croissance, mais des chiffres
  inexistants"* — no registry, no centralized monitoring.

**Best community-size proxies (no national total derivable):**
- **BrassageAmateur.com** (reference FR forum, since 2003): **~22,467 registered members, ~498k posts,
  36,250 topics**; peak 5,321 simultaneous users (Feb 2026). Cumulative registrations, francophone (not FR-only). [MED]
- **549 beer-related associations** in France's RNA (2020-04-01), one category being *brassage amateur*;
  no per-category membership; excludes Alsace-Moselle (real total higher); densest in North/Pas-de-Calais. [MED]
- **FNABRA** (Fédération Nationale des Associations Brassicoles, 2002; EBCU member 2022): *"plusieurs
  milliers de membres"* (mixes amateur brewers + tasting clubs — not a pure homebrewer count). [MED]
- **Paris Beer Club > 300 members**; runs an annual amateur brewing competition. [MED]
- Competition turnout (activity signal): Les Amis de la Bière 27th amateur competition (Sept 2025) judged
  **61 beers** (18 entrants at the 1998 first edition) — competitive participation grows slowly, small in absolute terms. [MED]

## French homebrew market signals

- **Recent legalization (strategically important):** amateur homebrewing was clarified/legalized
  **2021-01-01** via **Article 520 bis CGI** (2021 Finance Law). Home-brewed beer for personal/family/guest
  use is excise-exempt and freed from warehouse-keeper obligations, provided it is not sold. The hobby only
  fully left the legal grey-zone ~5 years ago — which partly explains the missing historical data and signals
  a young, expanding legal market. [HIGH]
- **Saveur Bière** (2007; FR online leader; AB InBev since 2016): ~105 employees, CA "plusieurs dizaines de
  millions d'euros"; reported rising demand; brewing kit among best-sellers. **Rebranded PerfectDraft Europe
  in 2023**, pivoting toward the draft-machine line (a partial move *away* from pure homebrew kit retail). [MED]
- **Mature France-based supplier ecosystem** (was import-dependent): Rolling Beers, Brouwland, Autobrasseur,
  Le Comptoir du Brasseur, Radis et Capucine, etc.; extract-kit vs all-grain segmentation; Amazon.fr "Kits de
  brassage maison" bestseller category. Qualitative growth, **no hard sales figures [N/F]**. [MED/LOW]

## FR amateur-brewing tooling shake-up (2025) — market signal

*Brewing software* are competitors (consistent vocabulary: they are tools for amateur brewers, hence on-target). Their
detailed profiles live in `01-desk-competitors` and `03b-desk-french`; what follows is the specifically-FR **market signal**,
refreshed May 2026:

- **Joliebulle, the historic FR software, shut down in early 2025.** Its own homepage states it in the past tense:
  *"c'était joliebulle, un logiciel pour les brasseurs amateurs et artisans, de 2010 à 2025"*. An open-source (GPL) desktop
  tool that turned partly paid (Gumroad distribution) at end of life. Its disappearance **displaces an FR user base** looking
  for a new home; **migrating Joliebulle files** to other tools is possible but imperfect (unit-conversion errors reported on
  XML import). [HIGH]
- **Little Bock (littlebock.fr) is the natural FR successor** — and the only French-built *web* recipe/brewing tool still
  active at scale. Structural caveat: it is a **single-maintainer** product, created and developed by one person (Michaël,
  aka "Micka", amateur brewer + developer + blog author). Fully browser-based (recipes accessible from any device), solid
  ingredient database, deep batch tracking, **brewer profiles + community recipe sharing**. **Freemium** model: free tier
  capped at **5 recipes + 5 batches**; **Premium €19.99/yr (or €1.99/mo)** → unlimited recipes/batches, cost management,
  stock alerts, API access, no ads. Community sentiment (BrassageAmateur forum) is **positive**: clear interface, coherent
  calculations, responsive creator. [MED]
- **Strategic read.** In 2025 the FR amateur-tooling market lost its historic player (Joliebulle) and now leans largely on a
  **solo product** (Little Bock) — a **fragility / durability** signal that directly serves Brasse-Bouillon's wedge (durable
  data, **versioned and credited** sharing, a present and plural maintainer). Little Bock's free cap (5 recipes) also leaves
  room for a more generous free tier. Here reliability is a **marketing message**, not just an SLA. [MED]

### Forum vs tool — who serves what (sourced figures)

Common confusion: **BrassageAmateur.com and Little Bock do not play the same role.** The former is a *forum* (community), the
latter a *software* (brewing app). They are not term-for-term comparable — they only overlap on the "recipe sharing" function.

| Player | Nature | Recipe sharing | Key figures (sourced) |
|---|---|---|---|
| **BrassageAmateur.com** | Reference FR community forum (since 2003) | Light layer via its **BrewRecipes** app (BeerXML import, filters, BJCP styles, comments/ratings, AI analysis, timeline) | ~**22,467 members**, ~498k posts, 36,250 topics [MED]; **BrewRecipes: 350+ shared recipes** [MED] |
| **Little Bock** | *Web* brewing software (recipe building + calculations + batch tracking + stock) | Built-in community library + brewer profiles | **No official total published [N/F]**; heavily-paginated brewer directory + profiles with tens/hundreds of recipes (official profile: 50 recipes, **2,288 followers**) → a community on the order of several thousand brewers [LOW/MED] |

- **Link between them: none.** No affiliation; Little Bock's only listed partner is Brewspot (brewing workshops). [HIGH]
- **Implication.** In FR, "recipe sharing" is already partly served by **both** — the forum's social layer (BrewRecipes) *and* the Little Bock app. But neither offers **versioned lineage + author credit + automatic rescaling**: precisely the gap Brasse-Bouillon targets. [MED]

## French craft microbrewery context (PROFESSIONAL — adjacent, well documented)

Useful for beer-culture vitality, clone targets, B2B/partnership angles — **not the target**:
- **~2,500–2,589 breweries in France (2024–2025); France is #1 in Europe by brewery count**; 10,000+ references. [HIGH]
- Growth then maturation: ~200 (2006) → 1,600 (2018) → ~2,500 (2024); ~7× between 2011–2022; +15% over 5 years. [HIGH]
- **Now plateauing:** 2025 ≈ 209 closures vs 213 openings (~4 closures/week) — professional segment matured. [HIGH]
- Sector employment ~130,500; FR per-capita consumption ~33 L/yr (lowest in EU); SNBI represents independents. [HIGH/MED]

## Homebrewer profile / demographics

- **France: [N/F]** — no demographic study found (only anecdote: more curious newcomers starting).
- **US proxy (use cautiously):** AHA/Brewers Association 2017 (18k+ respondents): 1.1M (now ~1.2M); avg age
  **42**, 52% aged 30–49, predominantly male, 68% college-educated, ~68% household income ≥$75k; **40% started
  within the prior 4 years** (strong newcomer influx). [HIGH for US]

## New leads / snowball threads to follow

- **BrassageAmateur.com** — largest FR community; single best venue for a direct user survey to fill the data gap + competition (BRASSAM) reach.
- **FNABRA** — could be asked directly for an aggregate member/club estimate.
- **Projet Amertume** (already bookmarked in memory) — brewery time-series + associations list.
- Regional/club leads: Les Amis de la Bière (FIBA), ABAHF, Paris Beer Club, BAF, Elsassbrau.
- Events/salons: Salon du Brasseur, Saint-Malo Craft Beer Expo, CRAB, FIBA.
- Supplier blogs/communities as funnels: Saveur Bière/PerfectDraft, Rolling Beers, Brouwland, Autobrasseur, Carnet d'un brasseur amateur.
- Studies to chase: AHA full demographic deck (US benchmark); Belgian Brewers Federation report (only structured EU data, per forum admin); EBCU.

## Strategic note

**Reinforces the strategy.** The absence of any official homebrewer count is itself a moat — no incumbent owns
this data; Brasse-Bouillon could *become* the dataset by instrumenting its own community. Recent (2021)
legalization + a now-mature FR supplier ecosystem + a saturating *professional* microbrewery market all point
to a young, under-served, growing *hobbyist* base whose natural pull is community + clone/share. Caveat: the
only hard demographics (age 30–49, male, educated, affluent, recent starters) are US — validate on FR users in interviews.

## Sources
- https://www.brassageamateur.com/forum/ftopic23796.html
- https://expertise-biere-conseil.com/2023/03/brassage-amateur-etat-des-lieux-dune-activite-en-expansion/
- https://www.brassageamateur.com/forum/
- https://www.happybeertime.com/blog/2020/10/06/recensement-des-associations-liees-a-la-biere-en-france/
- https://www.fnabra.org/associations-membres/
- https://www.parisbeerclub.fr/concours-de-brassage
- https://www.amis-biere.org/category/brassage-amateur/
- https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006163065
- https://www.assemblee-nationale.fr/dyn/15/amendements/3360C/CION_FIN/CF1540
- https://www.lejournaldesentreprises.com/hauts-de-france/article/saveur-biere-fait-face-une-hausse-de-la-demande-et-recrute-495310
- https://brasseurs-de-france.com/tout-savoir-sur-la-biere/le-marche-de-la-biere/
- http://projet.amertume.free.fr/html/evolution_nombre_brasseries.htm
- https://fr.statista.com/statistiques/830080/nombre-micro-brasseries-france/
- https://homebrewersassociation.org/news/1-1-million-americans-homebrew-beer/
- https://www.insee.fr/fr/statistiques/6535287
- https://joliebulle.org/ (homepage in past tense: "de 2010 à 2025" — closure confirmed)
- https://colibre.org/jolibulle-le-logiciel-de-brassage-amateur-open-source/ (GPL history → end of life)
- https://www.littlebock.fr/fonctionnalites-et-tarifs (freemium: free 5 recipes/5 batches; Premium €19.99/yr)
- https://www.littlebock.fr/a-propos (single-maintainer project — founder Michaël)
- https://www.brassageamateur.com/forum/viewtopic.php?t=35668 (Little Bock community sentiment)
- https://superpotion.fr/etat-des-lieux-marche-brassicole/ (2026 brewing-market state of play — plateau/consolidation)
- https://www.brassageamateur.com/ (forum's BrewRecipes app — 350+ recipes, BeerXML import, BJCP styles, AI analysis, timeline)
- https://www.littlebock.fr/brasseurs/ (Little Bock brewer directory — profiles, recipes, followers)
- https://docs.littlebock.fr/ (Little Bock documentation)
- https://www.littlebock.fr/partenaires (sole listed partner: Brewspot — no affiliation with BrassageAmateur)
