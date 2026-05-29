# Sequence diagram — beer-encyclopedia — import a beer by EAN

> **Feature**: `POST /beers/import-by-ean`
> **Source code**: `api/routers/beers.py`, `importers/openfoodfacts.py`,
> `importers/persistence.py`
> **Related ADRs**: ADR-0003 (Open Food Facts connector)

## Context

The DB-first import scenario as actually coded. Shows the four HTTP outcomes
(200 / 201 / 404 / 503) and the conservative upsert + audit-trail write. Field
mapping and refresh policy are summarized in the notes, not duplicated here.

## Diagram

```mermaid
sequenceDiagram
  actor C as Caller (mobile / NestJS)
  participant API as FastAPI (/beers/import-by-ean)
  participant DB as PostgreSQL (beers)
  participant OFFAPI as Open Food Facts
  participant P as upsert_beer_from_snapshot

  C->>API: POST /beers/import-by-ean {ean}
  API->>DB: SELECT beer WHERE ean_code = ean
  alt Local hit (DB-first)
    DB-->>API: existing beer
    API-->>C: 200 OK (BeerRead)
  else Local miss
    API->>OFFAPI: GET /api/v2/product/{ean}.json
    alt Transport / payload error
      OFFAPI-->>API: error
      API-->>C: 503 (off_unavailable)
    else Product not found
      OFFAPI-->>API: status 0 / 404
      API-->>C: 404 (not_found)
    else Product found
      OFFAPI-->>API: ExternalBeerSnapshot
      API->>P: upsert(snapshot, source="openfoodfacts")
      alt Source row not seeded
        P-->>API: SourceNotSeededError
        API-->>C: 503 (source_not_seeded)
      else Upsert OK
        P->>DB: upsert brewery (by name) + beer (by ean_code)
        P->>DB: upsert EntitySource (audit, raw_data)
        P-->>API: UpsertResult{beer, created}
        API-->>C: 201 if created else 200 (BeerRead)
      end
    end
  end
```

## Notes

- **DB-first** (`api/routers/beers.py`): a local `ean_code` hit returns 200 without
  any network call — Open Food Facts is only queried on a miss.
- **Conservative refresh** (`importers/persistence.py`): a re-import never overwrites
  hand-edited fields (`name`, `slug`, `description`, `style_id`, `legal_denomination`)
  and never clears a field — it only writes a value the snapshot actually carries.
- **Audit trail**: every successful import upserts an `EntitySource` row keyed by
  `(source_id, entity_type='beer', external_id=ean)`, keeping the raw OFF payload in
  `raw_data`.
- **Seed dependency**: the `openfoodfacts` row must exist in `sources` (via
  `scripts/seed_sources.py`) or the import surfaces as 503, not a silent failure.
