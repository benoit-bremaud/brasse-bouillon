# Synthesis — Needs Map & Positioning

Consolidation of six desk-research passes (`01` competitors, `02` Reddit, `03` forums, `03b` French
sources, `03c` market/quant data, `03d` French market). This is a hypothesis set built from secondary
research; it is **not yet confirmed** by primary research (interviews). Read `00-method.md` for
limitations. Later passes largely **confirmed** earlier findings (a saturation signal) while adding the
FR-specific and market-context refinements below.

## Headline

The differentiating hypothesis — **a community for cloning and sharing recipes** — is **supported**
by all three sources, and **sharpened**: the defensible wedge is not "social" or "clone list" alone,
but their intersection.

## The sharpened wedge

> The place where the community collaboratively dials in the clone of a specific beer, with a
> recipe that is **versioned, credited to its authors, and auto-rescaled** to each brewer's equipment.

No incumbent owns this. Today the market splits into:
- **Static clone lists** (AHA, Beer Maverick, BrewDog DIY Dog) — no iteration loop, no rescaling.
- **Calculators with a recipe library** (Brewfather, Brewer's Friend, BeerSmith) — publishing
  paywalled, sharing strips authorship, no conversation around a recipe.

## Needs map (ranked by signal, with hero/foundation tag)

| # | Need | Signal | Role |
|---|---|---|---|
| 1 | Searchable, curated **clone** repository for specific beers | Very high | **Hero** |
| 2 | **Versioned / community-validated** clones (not a static, often-wrong PDF) | High | **Hero** |
| 3 | Low-friction **sharing with author credit** (multi-group, bulk, attribution kept) | Med-high | **Hero** |
| 4 | Auto **rescaling** of a shared recipe to the recipient's equipment | Medium | Hero enabler |
| 5 | Reliable **organization & search** (tags by style/ingredient/outcome) | High | Foundation |
| 6 | Solid **brew-day / fermentation tracking** (logs, notes, history) | High | Foundation |
| 7 | **Frictionless sync + offline** without paying or duplicating data | Very high | Foundation / table-stakes |
| 8 | **Fair pricing** (subscription/paywall fatigue; crippled free tiers) | Very high | Table-stakes |
| 9 | **Data portability** — BeerXML/BeerJSON import/export, no lock-in, no data loss | High | Table-stakes |
| 10 | Modern, uncluttered **mobile UX** | Frequent | Table-stakes |

Heroes 1-4 are where Brasse-Bouillon can win. 5-10 are required to be credible and to retain, but
do not differentiate (incumbents already do most, and win on calculation).

## What the evidence says about each risky belief

- **Do brewers want to clone specific beers?** Yes — strong, durable, emotionally-driven. *Validated.*
- **Will they share their own recipes (not just consume)?** Net-positive culture, but with a
  consumption skew and a hard condition: **attribution/credit must be preserved**. *Plausible, to confirm in interviews.*
- **Is the need already met elsewhere?** No — clones are wrong/static, sharing tools strip authorship
  and paywall publishing, and there's no conversation layer. *Gap is real.*
- **Would they switch tools?** Risky — incumbents are entrenched on calculation and own the user's
  history. Mitigation: don't fight on calc; lead with the clone/community loop + BeerXML import to
  lower switching cost. *Highest-risk belief — test explicitly.*

## Strategic guardrails (from the evidence)

- **Don't compete on calculation.** Moat = curation + community + reliability + fair pricing + interop.
- **Frame community as connective tissue around clone-sharing**, not standalone social
  (cf. AHA Brew Guru community app sunset Feb 2026).
- **Bilingual ≠ duplicated.** Localize clone seed-content per region; respect the FR audience's
  higher price-sensitivity and expectation of a present maintainer.
- **Watch Build-A-Beer** (AI clone generation + share) — the closest direct competitor to the wedge.

## Market context (from `03c` / `03d`)

- **TAM anchor:** ~$2B home-brewing *hobby-equipment* market, ~7.5% CAGR (ignore the $26B–$85B "machine"
  reports — different scope). US homebrewers ≈ 1.1–1.2M; r/Homebrewing ≈ 1.2M members.
- **Incumbent recipe corpora are large** (Brewer's Friend 320k+ public recipes) but lead with *repository +
  calculators*, not clone-lineage/social — quantitatively confirming the wedge is open.
- **France: no official homebrewer count exists** (confirmed by insiders) — a data gap that is itself a moat:
  Brasse-Bouillon could *become* the dataset by instrumenting its community. Proxies: brassageamateur ≈ 22.5k
  members; 549 beer associations; FNABRA "several thousand" members.
- **French hobby only legalized 2021** (Art. 520 bis CGI) → young, expanding legal market; mature FR supplier
  ecosystem; the *professional* microbrewery market (France #1 in Europe, ~2,500) is now plateauing.
- **Only hard demographics are US** (age 30–49, male, educated, affluent, 40% recent starters) — validate on FR.

## French-specific refinements (from `03b`)

- **French-first UI is a real competitive lever** — Brewfather's English-only is a stated dealbreaker
  for part of the FR audience. Bilingual is not just localization; it is a wedge in FR.
- **In FR, sharing is already partially served** (brassageamateur's own BrewRecipes app + Little Bock's
  public library). So FR differentiation cannot be "sharing exists" — it must be
  **versioning + author credit + auto-rescale**.
- **Joliebulle closed (2010–2025, confirmed)** → a displaced FR user base is actively seeking a new home.
  Concrete acquisition opportunity; BeerXML import lowers their switching cost.
- **Data durability + BeerXML portability are trust-critical in FR** after recent tool failures
  (Joliebulle death, Little Bock outage). Reliability is a marketing message, not just an SLA.
- **FR clone targets** skew Belgian / Trappist (Orval, La Chouffe, Westmalle) + craft (Punk IPA).
  French macro lager did NOT surface as a meaningful target (corrects an earlier assumption).
- **Attribution-sensitivity is strong in EN but under-evidenced in FR** — do not assume it transfers;
  test explicitly in interviews (see below).

## One-sentence positioning (draft, to validate)

> For regular homebrewers who want to reliably recreate the beers they love, Brasse-Bouillon is the
> community recipe app where clones are collaboratively refined, credited, and rescaled to your own
> setup — with the recipe organization and brew tracking you'd expect, and no lock-in.

## Next step: primary research

Confirm or refute with 10-15 interviews of regular homebrewers, recruited from r/Homebrewing (EN) and
brassageamateur (FR). Priority beliefs to test: (a) **attribution-sensitivity** — strong in EN,
under-evidenced in FR, so probe both audiences; (b) **switching** — would they leave an entrenched tool;
(c) whether the **versioning + auto-rescale** angle is felt as a real need or a nice-to-have. The
interview guide is in `05-interview-guide.md` (built with the `customer-research` skill). Findings feed `06-report.md`.
