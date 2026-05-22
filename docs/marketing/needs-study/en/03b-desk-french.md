# Desk Research — French-Language Sources

Dedicated French pass to rebalance an English-skewed corpus (the product is bilingual FR + EN).
Covers FR blogs, software sites, the forum's own sharing app, FB/YouTube/Discord signal.
brassageamateur.com cited only where it adds NEW specifics. Confidence flagged per claim.

## Ranked French-specific themes / needs

### 1. Cloning commercial beers is mainstream, first-class — VERY HIGH
"Brasser un clone" is settled vocabulary; hundreds of clone recipes live in FR tool libraries and on blogs.
- https://comment-brasser-sa-biere.fr/recette-ipa/
- https://labrowar.blogspot.com/2016/01/recette-clone-orval.html
- https://www.littlebock.fr/recettes-bieres/24/nom/punk-ipa-clone

### 2. Tools must do the tedious math AND auto-rescale to the brewer's equipment — HIGH
FR blogs frame software value as offloading OG/FG, IBU, EBC/SRM, ABV, mash steps; mash-efficiency
customization that "automatically adjusts recipe quantities" is explicitly wanted. (Directly supports
the auto-rescale enabler of the hero.)
- https://blog.littlebock.fr/creer-recette-biere-logiciel-brassage/
- https://www.brassageamateur.com/forum/viewtopic.php?t=42555

### 3. French-language UI matters — English is a stated dealbreaker — HIGH (FR-specific)
Brewfather (the strongest tool) is repeatedly flagged as "en anglais, ce qui peut être rédhibitoire."
A genuine competitive lever absent from the English corpus.
- https://univers-biere.net/logiciels.php

### 4. Community recipe sharing is wanted — and ALREADY PARTIALLY SERVED in FR — HIGH
brassageamateur.com built its own "BrewRecipes" app (BeerXML import, search/filter, community ratings,
350+ recipes); Little Bock's public library is a core draw. So in FR the sharing angle competes against
incumbents, not a vacuum.
- https://www.brassageamateur.com/wiki/Beerxml
- https://www.littlebock.fr/

### 5. Brew/fermentation tracking expected but bolted on — MEDIUM-HIGH
Per-brassin notes/measures, history, fermentation graph, brew-day reminders. Brewfather wins via device
integrations (iSpindel, Tilt, Plaato); Little Bock offers per-brassin notes. Caveat: in the main
"quel logiciel" debate, the focus was ease-of-use/offline/calc accuracy, not tracking.
- https://apps.apple.com/fr/app/brewfather/id1488585822

### 6. Tool reliability / data-durability anxiety — MEDIUM (strategically important)
Little Bock suffered a major hosting outage (OVH SBG3) with a degraded read-only backup; some calc
distrust. Joliebulle's shutdown amplifies fear of losing recipe history. → BeerXML import/export +
reliability are TRUST features, not nice-to-haves.
- https://www.brassageamateur.com/forum/viewtopic.php?t=37899

### 7. Strong price sensitivity / low-cost ethos — MEDIUM-HIGH
Recurrent "brasser pour pas cher"; pro tools rejected as overkill ("Easybeer 29€/mois… beaucoup trop
cher… un simple fichier Excel suffit"). A generous free tier is near-mandatory; paid features must be
clearly amateur-relevant (consistent with export-as-paid).
- https://www.happybeertime.com/blog/2016/12/26/5-conseils-brasser-amateur-facon-low-cost/

## French tooling landscape

- **Little Bock** (littlebock.fr) — FR online recipe builder + community library + profiles + per-brassin
  notes + inventory. **Active, freemium** (free tier capped). Often called the best/most intuitive FR tool;
  criticized for a limited free tier, carbonation calc overestimation, and a past outage. Maintainer
  present but slowed.
- **Joliebulle** (joliebulle.org) — open-source desktop tool, loved for being simple/offline/free.
  **CLOSED — confirmed** (lifespan stated 2010–2025; site in past tense). No official successor; community
  redirects to Little Bock / Brewfather / Brewtarget. → **displaced user base actively seeking a home =
  concrete acquisition opportunity.** (A Gumroad page persists; purchasability post-shutdown uncertain.)
- **Beerxcel** — free Excel all-in-one; comprehensive but hard to learn; dev active on forum. Active, free.
- **Brewtarget** — open-source, free, cross-platform, FR manual; functional but dated (v4.01, Aug 2024).
- **Brewfather** — online, freemium; best fermentation tracking via device integrations; recurrent
  complaint = English-only.
- **BeerSmith** — FR translation/community exists; legacy paid heavyweight, not heavily tested by FR users.
- **BiboWeb** — could NOT be confirmed this pass. **Unverified** — probe before citing.
- Also: BYOB (free web), Brewy (free Android), Easybeer (pro, 29€/mo, "too expensive" for amateurs).

Sources: https://univers-biere.net/logiciels.php · https://joliebulle.org/ · https://www.littlebock.fr/fonctionnalites-et-tarifs

## French clone targets

- **Belgian / Trappist** (strong FR/BE cultural anchor): Orval, La Chouffe, Westmalle Triple, Belgian
  quad. Lean on *Brew Like a Monk*, EBC/IBU/attenuation matching.
- **International craft icons**, dominated by **BrewDog Punk IPA** (many clone versions, fed by BrewDog's
  "DIY DOG" release); general IPA/APA clones common.
- **French macro lager (Kronenbourg/1664, Heineken-style) did NOT surface as a meaningful clone target** —
  demand skews Belgian abbey/Trappist + craft IPA. (Soft/negative finding; corrects an earlier assumption
  that FR macro lager was a primary clone target.)

Sources: https://univers-biere.net/rec_chouffe.php · https://labrowar.blogspot.com/2016/01/recette-clone-orval.html · https://www.littlebock.fr/recettes-bieres/24/nom/punk-ipa-clone

## French audience specifics (marketing)

- **High, culturally explicit price sensitivity.** Generous free tier near-mandatory; paid must be amateur-relevant.
- **Free/open-tool loyalty.** A purely closed SaaS meets cultural friction (Joliebulle/Brewtarget/Beerxcel ethos).
- **High expectations of maintainer presence + data durability.** Active devs are rewarded; tool deaths/outages
  created real anxiety → portability + reliability are trust levers.
- **Where the FR community congregates:**
  - **Forum (brassageamateur.com)** = structured hub — and hosts its own recipe-sharing app, so it is a
    *partial direct competitor* on the sharing axis.
  - **Facebook** = high-volume informal layer (national "brassage.amateur.biere" + regional groups).
  - **Discord** = support/chat layer (Joliebulle ran a praised one), not a recipe repository.
  - **YouTube** FR channels active (Bricole Brassicole, Brassage TV, Craft My Brewery) — partnership/marketing, tutorial-skewed.
  - **Local clubs/associations** (ABAHF, Fauve Homebrew Club) = real in-person layer.

Sources: https://www.brassageamateur.com/wiki/Beerxml · https://fr-fr.facebook.com/brassage.amateur.biere/ · https://abahf.ovh/ · https://www.youtube.com/c/BricoleBrassicole

## Does FR confirm or diverge from EN?

Mostly **CONFIRMS** (a good saturation signal), with FR-specific sharpenings:

- Clone demand high → **confirmed**, arguably stronger/more legitimate in FR.
- Sharing wanted → **confirmed**, BUT already partially served in FR (forum BrewRecipes + Little Bock) →
  differentiation must come from **versioning + credit/attribution + auto-rescale**, not "sharing exists."
- Attribution-sensitivity → **only weakly corroborated in FR** (strong in EN). **Do not assume it transfers —
  test explicitly in interviews.**
- Organization/tracking hacked together → **confirmed**; no FR tool unifies organization + versioned sharing + tracking.
- Don't compete on calculation → **confirmed and reinforced** (calc is table-stakes; tools already trusted/distrusted on it).

**FR-specific strategic adds:** (1) French-first UI is a real competitive lever; (2) Joliebulle's 2025 death =
displaced users seeking a home; (3) data durability + BeerXML portability are trust-critical after recent FR tool failures.

## Uncertainties flagged
- BiboWeb unverified.
- Joliebulle Gumroad purchasability post-shutdown unclear.
- FR attribution-sensitivity under-evidenced — do not assume parity with EN.
- FB group member counts not retrieved.
