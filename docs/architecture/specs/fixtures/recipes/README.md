# Recipe fixtures corpus — BeerXML 1.0 canonical reference

Verbatim BeerXML 1.0 fixtures pulled from <https://www.beerxml.com/> (the spec author's reference site). Used as the working corpus for:

- **#869** — canonical DB schema reference doc (`docs/architecture/specs/recipe-schema-reference.md`, to be drafted)
- **#866** — BeerJSON vs BeerXML format-choice spike (ADR-0006, to be drafted)
- **#708** — Database schema audit + recipe ingestion brainstorm (validation corpus)
- **#865** — BeerXML 1.0 import parser (test inputs)
- **#778** — BeerXML export serializer (round-trip targets)
- **#779 follow-up** — Recipe Catalog UI design (RecipeDetailsScreen accordion structure derived from BeerXML records)

## Curation principle

Each file is **verbatim from beerxml.com** — no Brasse-Bouillon extensions inside the fixture. Extensions live in the schema reference doc and in our own seed files.

The corpus is meant to **diversify** the data shapes we ship against, so the parser / UI / schema audit catch every gap.

## Inventory (2026-05-03 pull)

### Recipes — `recipes/`

| File | Recipes | Notes |
|------|---------|-------|
| `01-beerxml-canonical-recipes.xml` | **4** : Burton Ale · Dry Stout · Porter · Wit | The official 4-recipe sample published with the BeerXML 1.0 spec. Brad Smith's Dry Stout (single mash step, single hop addition) is the smallest fully-valid recipe and is referenced in his sample on `beerxml.htm`. |

### Libraries — `libraries/`

Reference catalogues for each BeerXML record type. Useful for seeding our own ingredient / style / equipment / mash-profile catalogues, and for parser test fixtures.

| File | Entries | Highlights |
|------|---------|------------|
| `style.xml` | **5** styles | BJCP 1999 — American Wheat, Bohemian Pilsner, California Common Beer, Dry Stout (Irish), Traditional Bock |
| `mash.xml` | **5** profiles · 18 steps | Temperature Mash 1-Step Light Body, Single Infusion Light Body No Mash Out, Single Infusion Full Body, Double Infusion Medium Body — each with named MASH_STEPs (Mash In / Saccharification / Mash Out / Protein Rest) |
| `grain.xml` | **4** fermentables | Pale base + specialty grains |
| `hops.xml` | **5** hops | Cascade · Galena · Goldings B.C. · Northern Brewer · Tettnang |
| `yeast.xml` | **5** yeasts | English Ale · European Ale · Irish Ale · Kolsch · Northwest Ale — White Labs + Wyeast Labs entries with PRODUCT_ID, ATTENUATION, FLOCCULATION, MIN/MAX_TEMPERATURE |
| `misc.xml` | **5** misc | Finings, spices, etc. |
| `water.xml` | **5** waters | Burton on Trent + named regional profiles |
| `equipment.xml` | **2** profiles | Brew pot + cooler combos with TUN_VOLUME / TUN_WEIGHT / etc. |

## How to use

- **Designing a screen / form** — open `01-beerxml-canonical-recipes.xml` next to the screen mockup. Every visible field on the screen must map to a BeerXML element (or be an explicit Brasse-Bouillon extension documented in `recipe-schema-reference.md`).
- **Designing a parser test** — load the fixture in the test harness, parse it, assert the resulting entity matches the expected ORM tree.
- **Designing a serializer test** — round-trip: parse → serialize → string-equal the original (modulo whitespace normalisation).
- **Seeding our own catalogues** — the `libraries/` files give us a concrete starting point for our own `style`, `ingredient`, `mash_profile`, `water_profile`, `equipment_profile` catalogues. Cross-reference with our existing seeds to identify gaps.

## Known parser quirks (verbatim from beerxml.com)

Because we keep these fixtures **byte-for-byte verbatim** from beerxml.com (no Brasse-Bouillon sanitisation), the official BeerXML files ship with a few well-known content quirks. Any consumer (parser, validator, seed importer) MUST handle them defensively rather than assuming strict numeric content.

| File(s) | Element(s) | Quirk | Expected consumer behavior |
|---------|------------|-------|----------------------------|
| `libraries/style.xml` | `<CARB_MAX>` | Trailing `>` typo on every record (e.g. `<CARB_MAX>2.6></CARB_MAX>`) | Strip the trailing `>` before float parsing |
| `recipes/01-beerxml-canonical-recipes.xml` | `<IBU>` | Includes the unit suffix (e.g. `<IBU>30.0 IBU</IBU>`) | Parse the leading numeric prefix only |
| `recipes/01-beerxml-canonical-recipes.xml` | `<ABV>` | Includes the `%` suffix (e.g. `<ABV>5.5 %</ABV>`) | Parse the leading numeric prefix only |
| `recipes/01-beerxml-canonical-recipes.xml` | `<EST_OG>` / `<EST_FG>` / `<EST_COLOR>` and `<DISPLAY_*>` variants | Often include a unit suffix (`SG`, `SRM`) | Parse the leading numeric prefix only; never strict `parseFloat` on the raw element text |
| `libraries/mash.xml` | `<DISPLAY_STEP_TEMP>` | Sometimes contains the literal placeholder string `DISPLAY_STEP_TEMP` instead of a value | Treat as missing; fall back to computing display from `STEP_TEMP` |

These quirks come from BeerSmith's exporter on beerxml.com (which freely interleaves machine-readable and human-readable values inside the same element). Our parser (#865) and seed importer (#708) will treat all numeric fields with a tolerant `extract leading number` strategy — never strict `parseFloat`.

## Planned additions (ordered)

| Filename | Source | What it adds |
|----------|--------|---------------|
| `02-brewdog-diy-dog-corpus.xml` | DIY DOG 2019 v8 PDF (`docs/product/references/`) | 67 commercial recipes — multi-step fermentation, dry hop, dry yeast (US-05). Validation corpus for #708 — must ingest losslessly. |
| `03-brasse-bouillon-signature-recipes.xml` | Curated by us (#884) | 5-10 Brasse-Bouillon originals, authored from scratch in BeerXML 1.0 strict. Validates we can author in the spec, not just parse. |

The numeric prefix is just an ordering hint; nothing in code parses it. New fixtures are appended with the next free number.

## Encoding

BeerXML 1.0 fixtures stay in `ISO-8859-1` per the spec — do not convert to UTF-8 (would break compliance with downstream industry tools that expect the spec encoding). Future BeerJSON fixtures (when #866 lands) will be UTF-8 per JSON convention.

## Source URLs (audit trail)

```
https://www.beerxml.com/recipes.xml   → 01-beerxml-canonical-recipes.xml
https://www.beerxml.com/style.xml     → libraries/style.xml
https://www.beerxml.com/mash.xml      → libraries/mash.xml
https://www.beerxml.com/grain.xml     → libraries/grain.xml
https://www.beerxml.com/hops.xml      → libraries/hops.xml
https://www.beerxml.com/yeast.xml     → libraries/yeast.xml
https://www.beerxml.com/misc.xml      → libraries/misc.xml
https://www.beerxml.com/water.xml     → libraries/water.xml
https://www.beerxml.com/equipment.xml → libraries/equipment.xml
```

Pull date: **2026-05-03**. The site is static reference material; no expected drift, but a re-pull validates the contents have not changed if a downstream consumer ever flags an inconsistency.
