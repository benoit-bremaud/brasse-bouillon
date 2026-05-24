# Component diagram — recipes — structure & boundaries

> **Feature**: epic #740; write CRUD #410–#420.
> **ADRs**: ADR-0002 (centralized NestJS backend), ADR-0005 (recipes are product
> data → product API, not the encyclopedia).

## Context

How the recipes feature is structured across packages and layers. Confirms the
single network egress and the Clean Architecture layering. Same shape as the
brewing-session component diagram (consistency is intentional).

## Diagram

```mermaid
flowchart LR
  subgraph Mobile ["packages/mobile-app — features/recipes"]
    direction TB
    Screens["presentation/ (RecipesScreen, RecipeDetailsScreen + 5 tabs, RecipeEditorScreen NEW)"]
    UCs["application/recipes.use-cases (list/get/scale/import done; create/edit/delete/fork NEW)"]
    Domain["domain/recipe.types (Recipe, RecipeStep, stats, ingredient refs)"]
    Data["data/recipes.api"]
    HTTP["core/http/http-client (sole egress)"]
    DataSrc["core/data/data-source (demo toggle)"]
    Screens --> UCs
    UCs --> Domain
    UCs --> DataSrc
    UCs --> Data
    Data --> HTTP
  end

  subgraph API ["packages/api/src/recipe — recipe module"]
    direction TB
    Ctrl["RecipeController (REST: CRUD, GET/PATCH steps, ingredients, import-from-community)"]
    Svc["RecipeService (versioning, deep-copy, provenance) — fork = domain service, not yet exposed"]
    Ent["entities: Recipe + Step/Hop/Fermentable/Yeast/Additive/Water (TypeORM)"]
    Ctrl --> Svc
    Svc --> Ent
  end

  DB[("SQLite (better-sqlite3, TypeORM)")]

  HTTP -->|"HTTPS REST"| Ctrl
  Ent --> DB
```

## Notes

- **Egress**: all recipe network calls go through `data/recipes.api` →
  `core/http/http-client`. No direct `fetch` in screens.
- **Gap made visible**: the mobile `application` + `presentation` write path
  (create/edit/delete + RecipeEditorScreen) is the missing layer — the backend
  already exposes **create/update/delete + GET/PATCH steps + import-from-community**.
  **Fork is not yet a REST route** (only a pure domain service today, #882/#883) —
  it needs both an endpoint and the mobile UI.
- **ADR-0005**: recipe data is product data → `packages/api`, never the
  beer-encyclopedia service. The encyclopedia only feeds *scan* matching (a
  recipe's `style` tag is used there, read-only).
- **Demo toggle** mirrors every other feature: use-cases short-circuit to
  `demoRecipes` when `useDemoData`.
