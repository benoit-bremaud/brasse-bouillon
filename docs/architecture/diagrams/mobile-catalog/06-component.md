# Diagramme de composant — mobile-catalog — couches mobile ↔ API encyclopédie

> **Périmètre :** structure interne de la feature `beer-catalog` (mobile) + frontière vers l'API encyclopédie
> **Code concerné (cible) :** `packages/mobile-app/src/features/beer-catalog/{domain,data,application,presentation}/`, `packages/mobile-app/app/(app)/beer-catalog/`, `packages/mobile-app/src/core/{http,query,config}/`
> **ADR liés :** repo ADR-0005 (split backend — le mobile lit les faits bière chez Python), repo ADR-0013 (la conception fait foi)
> **Voir aussi :** `01-use-case.md` · `09-class-domain.md` · `02-sequence-browse.md` · `../beer-encyclopedia/03-component.md` (vue backend) · `../../traceability-matrix.md`

## Contexte

Décomposition structurelle de la feature mobile `beer-catalog` (couches Clean :
`app` → `presentation` → `application` → `data` → `core/http`) et **frontière ADR-0005**
avec le service Python. Répond à « comment c'est structuré », pas « qui veut quoi »
(ça, c'est `01-use-case.md`).

**Points que ce diagramme rend explicites** : (1) l'**egress unique** est
`core/http/request()` — aucun `fetch` direct dans la feature (motif interdit projet) ;
(2) les lectures catalogue sont **`auth:false`** sur `baseUrl: env.encyclopediaUrl`
(l'encyclopédie est publique, ADR-0005) ; (3) **un seul hook** `useBeerCatalogPagination`
(`useInfiniteQuery`) sert *parcourir* et *rechercher* ; (4) la `presentation` n'importe
jamais `data/` en direct — elle passe par `application/`.

## Diagramme (Mermaid — aperçu rapide)

```mermaid
flowchart TB
  Enc["beer-encyclopedia (FastAPI) — brasse-bouillon-encyclopedia.fly.dev"]

  subgraph MOBILE ["packages/mobile-app — feature beer-catalog"]
    subgraph APP ["app (Expo Router)"]
      Routes["(app)/beer-catalog: index · search · beer/[id] · brewery/[id] · style/[id]"]
    end
    subgraph PRES ["presentation"]
      Browse["BeerCatalogBrowseScreen"]
      Search["BeerCatalogSearchScreen"]
      Detail["BeerDetailScreen / BreweryDetailScreen / StyleDetailScreen"]
      Card["BeerListItem (carte)"]
    end
    subgraph APPL ["application"]
      Hook["useBeerCatalogPagination (useInfiniteQuery)"]
      Debounce["useDebouncedValue"]
      UseCases["use-cases: listBeers / searchBeers / getBeer / getBrewery / getStyle"]
      NextParam["computeNextPageParam (pur, testé)"]
    end
    subgraph DATA ["data"]
      Api["beer-catalog.api.ts (request, auth:false)"]
      Mapper["beer-catalog.mapper.ts (DTO snake_case → domaine)"]
    end
    subgraph DOMAIN ["domain"]
      Types["beer-catalog.types.ts (CatalogBeer, Page<T>, PaginationMeta)"]
    end
    subgraph CORE ["core (transverse)"]
      HTTP["http/request()"]
      Query["query/QueryClient (retry 1, staleTime 30s, gcTime 5min)"]
      Env["config/env (encyclopediaUrl, encyclopediaUrlIsConfigured)"]
    end
  end

  Routes --> Browse
  Routes --> Search
  Routes --> Detail
  Browse --> Card
  Search --> Card
  Browse --> Hook
  Search --> Hook
  Search --> Debounce
  Detail --> UseCases
  Hook --> UseCases
  Hook --> NextParam
  UseCases --> Api
  Api --> Mapper
  Mapper --> Types
  Api --> HTTP
  Hook --> Query
  Api --> Env
  HTTP -->|"GET /beers · /beers/search · /beers/{id} · /breweries/{id} · /styles/{id} — auth:false (ADR-0005)"| Enc
```

*Même structure en **PlantUML** (notation magistrale). À garder **synchronisée** avec le bloc Mermaid.*

```plantuml
@startuml
title cmp — mobile-catalog (couches mobile <-> API encyclopédie)
skinparam componentStyle rectangle
skinparam shadowing false

cloud "beer-encyclopedia (FastAPI)\nbrasse-bouillon-encyclopedia.fly.dev" as Enc

package "packages/mobile-app — feature beer-catalog" as MOBILE {
  package "app (Expo Router)" {
    component "(app)/beer-catalog\nindex · search · beer/[id] · brewery/[id] · style/[id]" as Routes
  }
  package "presentation" {
    component "BeerCatalogBrowseScreen" as Browse
    component "BeerCatalogSearchScreen" as Search
    component "BeerDetailScreen /\nBreweryDetailScreen / StyleDetailScreen" as Detail
    component "BeerListItem (carte)" as Card
  }
  package "application" {
    component "useBeerCatalogPagination\n(useInfiniteQuery)" as Hook
    component "useDebouncedValue" as Debounce
    component "use-cases\nlistBeers / searchBeers / getBeer / getBrewery / getStyle" as UseCases
    component "computeNextPageParam\n(pur, testé)" as NextParam
  }
  package "data" {
    component "beer-catalog.api.ts\n(request, auth:false)" as Api
    component "beer-catalog.mapper.ts\n(DTO snake_case -> domaine)" as Mapper
  }
  package "domain" {
    component "beer-catalog.types.ts\n(CatalogBeer, Page<T>, PaginationMeta)" as Types
  }
  package "core (transverse)" {
    component "http/request()" as HTTP
    component "query/QueryClient\n(retry 1, staleTime 30s, gcTime 5min)" as Query
    component "config/env\n(encyclopediaUrl, encyclopediaUrlIsConfigured)" as Env
  }
}

Routes --> Browse
Routes --> Search
Routes --> Detail
Browse --> Card
Search --> Card
Browse --> Hook
Search --> Hook
Search --> Debounce
Detail --> UseCases
Hook --> UseCases
Hook --> NextParam
UseCases --> Api
Api --> Mapper
Mapper --> Types
Api --> HTTP
Hook --> Query
Api --> Env
HTTP --> Enc : "GET /beers · /beers/search · /beers/{id} · /breweries/{id} · /styles/{id}\nauth:false (ADR-0005)"

note bottom of HTTP
  Egress unique. Aucun fetch direct dans la feature
  (motif interdit). baseUrl = env.encyclopediaUrl.
end note
@enduml
```

## Notes

- **Egress unique** : seul `core/http/request()` parle au réseau ; `beer-catalog.api.ts`
  l'appelle avec `baseUrl: env.encyclopediaUrl` + `auth: false`. Aucun `fetch()` direct (motif
  interdit, CLAUDE.md). Garde `encyclopediaUrlIsConfigured` → `HttpError(503)` si l'URL n'est
  pas configurée (même garde que la feature `scan`).
- **Règle de dépendance (Clean)** : `presentation → application → data → core`. La
  `presentation` n'importe **jamais** `data/` ; `domain/` n'importe rien. La feature ne dépend
  pas de `scan` (mappers **dupliqués**, pas partagés — cibles différentes, voir `11-data-flow.md`).
- **Un seul hook paginé** : `useBeerCatalogPagination` (`useInfiniteQuery`) sert *parcourir*
  (`listBeers`) et *rechercher* (`searchBeers`) ; seule la **clé de cache** et l'endpoint
  changent (`["beer-catalog","browse"]` vs `["beer-catalog","search",q]`). `computeNextPageParam`
  est **pur et testé** isolément (math 1-based, cf. `02-sequence-browse.md`).
- **Frontière ADR-0005** : le mobile lit les **faits bière** chez Python (catalogue), et garde
  NestJS pour les **données utilisateur** (hors de ce diagramme). NestJS n'est **pas** sur le
  chemin catalogue.
- **Conformité** : le code (cible `features/beer-catalog/`) doit se conformer à cette
  structure. Implémentation **après** validation de la conception (`Part A`).
