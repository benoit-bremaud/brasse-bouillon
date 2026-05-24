# Sequence diagram — ingredients — create a custom ingredient & use it

> **Feature**: custom ingredients Strategy B #915 / #624.
> **Source**: mobile `features/ingredients` + API `catalog` module.

## Context

The Strategy-B flow: a brewer authoring a recipe hits a missing exotic
ingredient, creates a custom one with partial metadata, and references it
immediately. This is the open #915/#624 path; browsing/filtering the curated
catalog already works and is not repeated.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant R as "Mobile — RecipeEditor / ingredient picker"
  participant S as "Mobile — CustomIngredientForm"
  participant UC as "Mobile — ingredients.use-cases (add createCustomIngredient)"
  participant HTTP as "core/http/http-client"
  participant API as "API — catalog controller (per-category routes)"
  participant DB as "DB"

  B->>R: Search "Nelson Sauvin" — not in catalog
  R->>S: Open "Créer un ingrédient" (category=hop)
  B->>S: Enter name + known specs (alpha % only)
  S->>UC: createCustomIngredient(category, partialSpecs)
  UC->>HTTP: POST /catalog/hops (or /malts | /yeasts), isCustom=true (PLANNED route)
  HTTP->>API: forward
  API->>DB: insert ingredient (isCustom=true, ownerId=user, partial specs)
  API-->>S: 201 { ingredient }
  S-->>R: return to picker, new ingredient selected
  R->>R: add RecipeIngredientRef(ingredientId, amount, unit) to the recipe
```

## Notes

- **Egress**: screen → use-case → `core/http/http-client`; no direct `fetch`.
- **Partial metadata**: the form requires only `name` + `category`; specs are
  optional so the brewer is never blocked. Missing specs degrade gracefully
  (recipe calculators use defaults / flag low-confidence).
- **Scoping**: the created ingredient is private (`ownerId`); it appears only in
  the owner's picker/catalog, never in others' — until a Maintainer promotes it.
- **Demo mode**: today the demo catalog is sourced from exported constants
  (`demoIngredients`); the custom-create path would branch on the data-source
  toggle to add to an in-memory/persisted custom list (to build with #915).
- **Route shape**: the custom-create endpoint is **planned** — the existing
  catalog API exposes per-category read routes (`GET /catalog/hops`, …); #915 adds
  the writable custom-ingredient path.
