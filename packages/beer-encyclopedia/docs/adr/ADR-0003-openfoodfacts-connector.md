# ADR-0003: Open Food Facts connector as the primary external source

- Status: Accepted
- Date: 2026-05-01

## Context

After ADR-0002 the encyclopedia carries a French legal-reference layer
but still has no connection to any real-world product data. The
`Source` and `EntitySource` tables exist but are empty; `Beer.source`
already exposes `"openfoodfacts"` as a valid provenance value yet no
code imports from there. The `/scan` pipeline can detect a label and
extract a few fields by OCR but has nothing to match against, so a
scanned bottle goes nowhere.

We need a one-shot bridge that takes the most reliable identifier on
a beer label — its EAN barcode — and turns it into an enriched row in
our database. This is the precondition for every downstream story:
the user-facing scan flow, the community-contribution loop (PR3,
issue #803), and the catalog browsing experience (#708).

The candidate sources we evaluated:

- **Open Food Facts (OFF)** — public, crowd-sourced food product
  database with a free, well-documented HTTP API and ~2 M SKUs
  including thousands of beers across Europe. CC-BY-SA licence.
- **Open Brewery DB** (#547) — REST API for breweries only, no
  product-level data.
- **Untappd** — rich beer data but commercial, requires API keys and
  paid usage tiers above a low quota.
- **RateBeer** — useful editorial data, no public API.

OFF is the clear winner for PR2: free, public, EAN-indexed, no
auth, and already half-wired in the schema (`Beer.source` enum). The
others go on the backlog as future complementary sources.

## Decision

Introduce `importers/` as the home for all external-source clients
and ship an Open Food Facts implementation that maps a raw OFF
product into an internal `ExternalBeerSnapshot`. A dedicated
persistence helper consumes the snapshot and upserts the matching
`Beer`, `Brewery` and `EntitySource` rows. A new
`POST /beers/import-by-ean` route exposes the flow over HTTP, backed
by a small `Beer.ean_code` column on the existing `beers` table.

### Architecture

```
HTTP layer        api/routers/beers.py     POST /beers/import-by-ean
                          │
External fetch    importers/openfoodfacts  OpenFoodFactsClient.fetch_by_ean
                          │
Normalisation     importers/base           ExternalBeerSnapshot dataclass
                          │
Persistence       importers/persistence    upsert_beer_from_snapshot
                          │
Schema            db/models/beer.py        + Beer.ean_code (migration 004)
```

The `importers` package becomes the single landing place for any new
external source: an Untappd or RateBeer client added later only needs
to return an `ExternalBeerSnapshot`; the persistence layer and the
HTTP route do not change.

### Specific choices

1. **`importers/` over `services/sources/`** — `importers/*` is
   already declared in `pyproject.toml`'s `setuptools.packages.find`
   include list. Reusing the existing slot avoids a config change and
   matches the established naming convention in the package
   architecture (`api`, `db`, `ml`, `importers`).

2. **`Beer.ean_code` is `String(14)` nullable, with a UNIQUE
   constraint and a CHECK on the supported lengths (8, 12, 13, 14).**
   The column accepts EAN-8, UPC-A, EAN-13 and EAN-14, the four
   formats commonly found on European beverage packaging. NULL rows
   are allowed and do not collide (PostgreSQL and SQLite both treat
   NULL as unknown in unique constraints), so internal seeds and
   community drafts that have no barcode coexist freely.

3. **No GS1 mod-10 checksum validation.** External sources
   occasionally carry malformed barcodes that are still useful as
   match keys. Tightening to checksum validation would force us to
   reject those inputs and lose data. The format check (digits +
   length) is enough to catch typos and accidental swaps.

4. **`ExternalBeerSnapshot` is a `@dataclass`, not a Pydantic model
   or a Protocol.** Pydantic would buy us nothing here — there is no
   serialisation across the API boundary. A Protocol would defer
   construction to the importer instead of giving us a single concrete
   type to assert on in tests. The dataclass is the smallest thing
   that documents the contract and is testable in isolation.

5. **`upsert_beer_from_snapshot` is conservative on refresh.** A
   re-import only updates the fields the importer owns
   (`brewery_id`, `abv`, `country_of_origin`, `allergens`,
   `contributed_at`). It deliberately leaves `name`, `slug`,
   `description`, `style_id` and `legal_denomination` alone because
   those may have been edited by hand or refined by another source.
   The opinion: we never overwrite data we did not originate.

6. **HTTP semantics distinguish 201 from 200 from 404 from 503.**
   - `201 Created` — first import for this EAN.
   - `200 OK` — re-import refreshed an existing row.
   - `404 Not Found` — OFF reports no product for this EAN
     (`status: 0` in the OFF payload).
   - `503 Service Unavailable` — transport, payload, or seed-state
     failure (the operator has an actionable fix path).

   The split lets clients branch on "unknown product" vs "service
   hiccup" without parsing error strings.

7. **Source registration is a separate seed.** The `openfoodfacts`
   row in `Source` is created by `scripts/seed_sources.py`, not by
   the migration. Migrations stay schema-only; seed scripts stay
   re-runnable. A typed `SourceNotSeededError` surfaces the missing
   row as a 503 with a message pointing at the seed script, so the
   first failure tells the operator exactly what to do.

8. **Country resolution uses a small hard-coded slug map, not a
   library.** We resolve the dozen or so countries that show up most
   often on European beer labels and leave anything else as `None`.
   A full ISO library would be larger than the data it resolves; we
   add slugs as we observe gaps in production.

### Rejected alternatives

- **Bulk OFF dump ingestion** — OFF publishes a daily JSONL dump of
  the whole database (~100 GB uncompressed, ~10 M products). Useful
  for offline research, overkill for our current need (on-demand
  enrichment from scanned barcodes). Captured in the backlog for v0.3
  if we ever need full-catalog browsing without a live network call.
- **Wrapping the OFF Python client (`openfoodfacts-python`)** — adds
  a dependency, brings in code paths we do not use, and the OFF API
  is small enough to call directly with `httpx`. The mapping logic
  stays in our hands.
- **Inline persistence in the route handler** — would put SQLAlchemy
  upsert code into FastAPI route bodies. The dedicated
  `importers/persistence.py` keeps the route thin and lets PR3
  reuse the same upsert primitives for community contributions.
- **Eagerly fetching from `/scan`** — the import flow only triggers
  when a barcode is supplied. Hooking it into `/scan` requires the
  ML pipeline to detect barcodes (out of PR2 scope, deferred to a
  later ML-side change). The route is admin-callable today and will
  be wired into `/scan` once the detection lands.

## Consequences

### Positive

- The encyclopedia gets a real-data path. A `curl POST /beers/import-by-ean`
  with a known EAN now produces a populated `Beer` + `Brewery` +
  `EntitySource` row, validating the whole `Source` / provenance
  infrastructure end-to-end.
- The `EntitySource.raw_data` audit trail is finally exercised: every
  import keeps the original OFF payload so we can re-derive the
  mapping without a re-fetch when the importer evolves.
- The pattern is reusable — adding Untappd, RateBeer, or Open
  Brewery DB later only requires a new file under `importers/` that
  returns the same `ExternalBeerSnapshot`.
- The mobile demo for the soutenance has a credible scan-to-fiche
  story: scan a real beer, see the data come back from OFF.

### Trade-offs

- We depend on a third-party service for a non-trivial part of the
  user journey. Mitigated by graceful 404/503 handling and the fact
  that OFF is community-owned (no vendor lock-in).
- Mapping quality varies by product: French entries tend to be richer
  than entries from countries where OFF has fewer contributors. The
  conservative refresh policy means a poor first import will not
  overwrite better data added later by hand.
- The `_COUNTRY_SLUG_TO_ISO2` map is hand-maintained. We accept this
  cost in exchange for not pulling in a multi-megabyte ISO library
  for the dozen entries we actually resolve.
- No detection of demoted / withdrawn products. OFF does not flag
  these explicitly; if a product is removed upstream a re-import will
  return 404 but our row will stay. A later cleanup job (`scripts/
  audit_entity_sources.py`) can sweep stale audit rows — captured in
  the backlog.
