# Class diagram — beer-encyclopedia — domain model (as built)

> **Feature**: encyclopedia normalized domain model
> **Source code**: `db/models/*.py`
> **Related ADRs**: ADR-0002 (legal fields), ADR-0003 (ean_code, Source/EntitySource),
> repo ADR-0013 (Beer normalized = canonical source of truth)

## Context

The **10 ORM entities exactly as coded**. This is the canonical, **normalized** model
(`Beer` references `Brewery` and `Style` by FK) — the agreed source of truth, distinct
from the denormalized `ScanCatalogItem` cache described in `docs/architecture/diagrams/scan/`.

All entities inherit `id: UUID` (PK) and most inherit `created_at` / `updated_at`
(`TimestampMixin`); these mixin fields are omitted below for readability except where a
table defines `created_at` explicitly (`EntitySource`, `CommunityCorrection` — no
`TimestampMixin`). `?` marks a nullable column.

## Diagram

```mermaid
classDiagram
  class Beer {
    +str name
    +str slug
    +UUID brewery_id
    +UUID style_id
    +Decimal abv
    +int ibu
    +int srm
    +str description
    +bool is_active
    +bool is_verified
    +str source
    +UUID contributed_by
    +datetime contributed_at
    +datetime approved_at
    +str legal_denomination
    +str country_of_origin
    +list~str~ allergens
    +int alcohol_group
    +str ean_code
  }
  class Brewery {
    +str name
    +str slug
    +str brewery_type
    +str city
    +str country
    +Decimal longitude
    +Decimal latitude
    +str website_url
    +int founded_year
    +bool is_verified
  }
  class Style {
    +str name
    +str slug
    +str category
    +Decimal abv_min
    +Decimal abv_max
    +int ibu_min
    +int ibu_max
    +int srm_min
    +int srm_max
  }
  class Ingredient {
    +str name
    +str category
    +str description
  }
  class BeerIngredient {
    +UUID beer_id
    +UUID ingredient_id
    +str amount
    +str usage_phase
  }
  class TastingProfile {
    +UUID beer_id
    +str aroma
    +str flavor
    +int bitterness
    +int sweetness
    +int body
    +int carbonation
  }
  class Media {
    +UUID beer_id
    +UUID brewery_id
    +str media_type
    +str url
    +bool is_primary
    +str uploaded_by
  }
  class LegalDenomination {
    +str code
    +str label
    +str description
    +str legal_reference
    +int min_aging_days
    +Decimal max_alcohol_pct
  }
  class Source {
    +str name
    +str source_type
    +str base_url
    +str description
  }
  class EntitySource {
    +UUID source_id
    +str entity_type
    +UUID entity_id
    +str external_id
    +datetime last_synced_at
    +dict raw_data
    +datetime created_at
  }
  class CommunityCorrection {
    +str entity_type
    +UUID entity_id
    +str field_name
    +str old_value
    +str new_value
    +str status
    +str submitted_by
    +str reviewed_by
    +datetime created_at
  }

  Brewery "1" o-- "0..*" Beer : produces (SET NULL)
  Style "1" o-- "0..*" Beer : classifies (SET NULL)
  Beer "1" *-- "0..1" TastingProfile : cascade
  Beer "1" *-- "0..*" BeerIngredient : cascade
  Ingredient "1" *-- "0..*" BeerIngredient : cascade
  Beer "1" *-- "0..*" Media : cascade
  Brewery "1" *-- "0..*" Media : cascade
  Source "1" o-- "0..*" EntitySource : cascade
```

## Notes

- **`Media` exactly-one parent**: a CHECK enforces `beer_id` XOR `brewery_id`
  (`ck_media_exactly_one_parent`).
- **Polymorphic-by-value, no FK**: `EntitySource` and `CommunityCorrection` reference a
  target via `(entity_type, entity_id)` with **no foreign key** — `entity_type` ∈
  `{beer, brewery}`. Drawn unlinked on purpose.
- **`LegalDenomination` is a reference table**: `Beer.legal_denomination` matches a
  `LegalDenomination.code` **by value**, enforced by a CHECK against
  `LEGAL_DENOMINATION_VALUES`, not by a FK. Drawn unlinked on purpose.
- **`EntitySource` uniqueness**: `(source_id, entity_type, external_id)` — the idempotency
  key for re-imports.
- **Provenance**: `Beer.source` ∈ `{openfoodfacts, internal, community}` is a shorthand
  discriminant duplicated for query speed alongside the `EntitySource` audit trail.

### Column constraints (not shown on the diagram, taken from `db/models/*`)

- **Nullability**: members are listed by name + type only; nullability follows the ORM.
  NOT NULL columns are: `Beer.{name, slug, is_active, is_verified, source}`,
  `Brewery.{name, slug, is_verified}`, `Style.{name, slug}`,
  `Ingredient.{name, category}`, `BeerIngredient.{beer_id, ingredient_id}`,
  `TastingProfile.beer_id`, `Media.{media_type, url, is_primary}`,
  `LegalDenomination.{code, label, description, legal_reference}`,
  `Source.{name, source_type}`,
  `EntitySource.{source_id, entity_type, entity_id, created_at}`,
  `CommunityCorrection.{entity_type, entity_id, field_name, new_value, status,
  created_at}`. Everything else is nullable.
- **Unique**: `Beer.slug`, `Beer.ean_code`, `Brewery.slug`, `Style.name`, `Style.slug`,
  `Ingredient.name`, `LegalDenomination.code`, `Source.name`, `TastingProfile.beer_id`,
  and the composite `EntitySource(source_id, entity_type, external_id)`.
- **Composite PK**: `BeerIngredient(beer_id, ingredient_id)`.
- **CHECKs**: `Beer.source`, `Beer.legal_denomination`, `Beer.alcohol_group`,
  `Beer.country_of_origin` length, `Beer.ean_code` length; `TastingProfile` 1–5 scales;
  `Media` exactly-one-parent; `LegalDenomination` positivity guards.
- **Defaults**: `Beer.source = 'internal'`, `Beer.is_active = true`,
  `*.is_verified = false`, `Media.is_primary = false`,
  `CommunityCorrection.status = 'pending'`.
