# ADR-0002: French legal reference for beer denominations and labels

- Status: Accepted
- Date: 2026-05-01

## Context

The encyclopedia stores beer rows that the mobile app surfaces to French
consumers. Until now the schema had no anchor on the regulatory framework
that governs beer composition and labelling in France, so the data layer
could not enforce — or even express — the categories defined by the law.

The applicable framework is:

- Decree n°92-307 of 31 March 1992, modified by decree n°2016-1531 of
  15 November 2016 — beer composition and labelling
- EU regulation 1169/2011 — consumer information on food
- Order of 2 October 2006 — mandatory health message on alcoholic
  drinks above 1.2 %vol
- Article L-3321-1 of the French Code de la santé publique — five-group
  alcohol classification (group 2 was historically merged into group 3)
- Article 16 of the decree-law of 30 July 1935 — capacity etching on
  beer glassware (out of scope for the data layer; tracked for UI later)

We need this knowledge represented in the schema for three reasons:

1. **Validation** — the brewer-facing flow (and later the community
   contribution flow) must reject claims that violate the law (e.g. a
   beer labelled `pur_malt` while the recipe contains adjuncts).
2. **Discovery** — users want to filter on legal categories that are
   familiar to them in France ("bière de garde", "panaché"), not only
   on BJCP-style taxonomies that come from the homebrewing world.
3. **Compliance trail** — every regulatory field (allergens, country of
   origin, alcohol group) must be queryable independently for export
   and for future moderation tooling.

## Decision

Introduce a dedicated `legal_denominations` reference table holding the
ten canonical French denominations, plus four nullable regulatory
columns on `beers` (`legal_denomination`, `country_of_origin`,
`allergens`, `alcohol_group`).

Specifically:

1. **`legal_denominations` table** — controlled vocabulary table with a
   unique `code`, a `label` (French wording, displayed in the FR
   mobile UI), the discriminating `description`, the `legal_reference`
   text, and two category-specific structured fields (`min_aging_days`,
   `max_alcohol_pct`). Seeded by `scripts/seed_legal_denominations.py`
   (idempotent upsert). Internationalisation will be handled later by
   a `LegalDenominationLabel(locale, label)` sibling table rather than
   by suffixing column names — keeps the table aligned with the rest of
   the package (`Style.name`, `Brewery.name`, etc. carry no language
   suffix).
2. **`beers.legal_denomination`** — nullable `VARCHAR(50)`, CHECK
   constrained to the same ten codes. Cross-referenced with the
   reference table by application code, not by foreign key, so historical
   rows without a denomination remain valid and the table can be
   re-seeded without the FK getting in the way.
3. **`beers.country_of_origin`** — nullable `CHAR(2)`, ISO 3166-1
   alpha-2; uppercased at the ORM layer.
4. **`beers.allergens`** — nullable JSONB on PostgreSQL (JSON elsewhere)
   storing a normalised string array.
5. **`beers.alcohol_group`** — nullable `SMALLINT`, CHECK in (1, 3, 4, 5)
   (group 2 explicitly excluded, see context).

All four columns on `beers` are nullable. Pre-existing rows and rows
imported from non-FR sources legitimately leave them blank.

### Rejected alternatives

- **Pure enum on `Beer.legal_denomination`** (no reference table).
  Rejected because the enum cannot carry the discriminating criterion,
  the legal reference text, or the per-category structured fields
  (`min_aging_days`, `max_alcohol_pct`). Those need a row.
- **Foreign key from `beers.legal_denomination` to
  `legal_denominations.code`**. Rejected to avoid coupling a slow-moving
  reference table to the high-volume beer table; the CHECK constraint
  gives the same correctness guarantee at lower migration cost.
- **One row per regulation in a generic `regulations` table**. Rejected
  as premature generalisation — denominations and labelling rules have
  distinct shapes and lifecycles; a single table would force a JSON
  blob and lose the value of typed columns.
- **Encode the regulation in code only (no table)**. Rejected because
  the mobile UI and the future moderation flow both need to render the
  list and explain each category to non-expert users; that data has to
  live somewhere queryable.

## Rationale

- The reference table makes the regulation a first-class artefact,
  versioned alongside the schema and usable from any client.
- Nullable columns on `beers` keep the migration non-breaking and let
  non-FR data coexist without a kludgy `country = "FR"` toggle.
- Storing values in their original French snake_case (`biere_de_garde`,
  `panache`) preserves traceability with the regulation; there is no
  English equivalent that carries the same legal meaning.
- The duplication of `LEGAL_DENOMINATION_VALUES` between the model and
  the migration mirrors the convention introduced by ADR-0001 work and
  by migration 002 — historical migrations stay runnable even if the
  model evolves.

## Consequences

### Positive

- Beers can carry their regulated category and be queried, filtered,
  and validated against it.
- Allergens and country of origin are explicit columns rather than
  buried inside a description string; both are required by the EU
  regulation for any beer sold in France.
- The reference table is queryable from the mobile app for dropdowns
  and explanatory tooltips without bundling the regulation client-side.
- The Open Food Facts importer (next PR) can populate
  `country_of_origin` and `allergens` directly from its `countries_tags`
  and `allergens_tags` payload.

### Trade-offs

- Scope is France-only for now. Belgium, Germany, etc. will require a
  parallel table or a discriminator column when we expand. Documented
  here so the next iteration is intentional.
- The values are opinionated French snake_case strings; consumers
  outside the FR locale will see them as opaque codes unless the UI
  joins on `label_fr`. Acceptable: the mobile UI is already French.
- A foreign key would have prevented the rare drift case (a `Beer.legal_denomination`
  pointing to a code that was later removed from the reference). We
  accept this trade-off in exchange for migration simplicity and seed
  re-runnability; a later integrity sweep can detect orphans cheaply.
