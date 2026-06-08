# Diagramme de séquence — mobile-catalog — Variantes d'erreur (404 / timeout / hors-ligne)

> **Réalise :** branches d'erreur **transverses** de UC1/UC2/UC3 (réalisation mobile)
> **Code concerné (cible) :** `features/beer-catalog/data/beer-catalog.api.ts`, `application/*`, `core/http/http-error.ts`, `core/query/QueryClient`
> **ADR liés :** repo ADR-0005 (encyclopédie-seule, pas de secours NestJS), repo ADR-0013 (la conception fait foi)
> **Voir aussi :** `02-sequence-browse.md` · `03-sequence-search.md` · `04-sequence-fiche.md` · `07-state-list-screen.md` (états error/offline) · `../../traceability-matrix.md`

## Contexte

Séquence **transverse** des cas d'erreur, factorisée pour les trois chemins heureux (`02`–`04`).
Trois variantes : **404** (introuvable), **timeout / 5xx / réseau** (avec le `retry:1` de
TanStack), **hors-ligne** (cache périmé servi vs erreur). Distingue l'erreur **au chargement
initial** (plein écran) de l'erreur **de page suivante** (pied de liste, la liste reste
visible) — distinction reprise par `07-state-list-screen.md`.

## Diagramme (Mermaid — flux cible)

```mermaid
sequenceDiagram
  autonumber
  participant S as Écran (liste / fiche)
  participant H as Hook (useInfiniteQuery / useQuery)
  participant Q as Cache TanStack
  participant API as beer-catalog.api (request, auth:false)
  participant E as beer-encyclopedia (FastAPI)

  alt 404 introuvable (fiche)
    H->>API: getBeer(id)
    API->>E: GET /beers/{id}
    E-->>API: 404
    API-->>H: HttpError(404) → CatalogNotFoundError
    H-->>S: « bière introuvable » (pas de secours NestJS)
  else timeout / 5xx / réseau
    H->>API: fetch page / fiche
    API->>E: GET …
    E--xAPI: timeout / 503 / échec réseau
    API-->>H: HttpError → CatalogUnavailableError
    H->>H: retry:1 (un réessai silencieux)
    H->>API: re-fetch
    API->>E: GET …
    E--xAPI: échec persistant
    API-->>H: HttpError
    alt chargement initial (pas de données)
      H-->>S: écran d'erreur plein + « Réessayer » (refetch)
    else page suivante (données déjà là)
      H-->>S: erreur en pied de liste — liste conservée, réessai en place
    end
  else hors-ligne
    H->>API: fetch
    API--xE: pas de réseau
    alt cache présent (stale)
      Q-->>H: pages/fiche périmées
      H-->>S: contenu servi du cache + bannière « hors-ligne »
    else cache absent
      H-->>S: écran hors-ligne + « Réessayer »
    end
  end
```

*Même flux en **PlantUML** (à garder synchronisé avec le bloc Mermaid).*

```plantuml
@startuml
title sd — mobile-catalog — Variantes d'erreur (404 / timeout / hors-ligne)
autonumber
participant "Écran (liste / fiche)" as S
participant "Hook\n(useInfiniteQuery / useQuery)" as H
participant "Cache TanStack" as Q
participant "beer-catalog.api\n(request, auth:false)" as API
participant "beer-encyclopedia" as E

alt 404 introuvable (fiche)
  H -> API : getBeer(id)
  API -> E : GET /beers/{id}
  E --> API : 404
  API --> H : HttpError(404) -> CatalogNotFoundError
  H --> S : « bière introuvable » (pas de secours NestJS)
else timeout / 5xx / réseau
  H -> API : fetch page / fiche
  API -> E : GET ...
  E -->x API : timeout / 503 / échec réseau
  API --> H : HttpError -> CatalogUnavailableError
  H -> H : retry:1 (un réessai silencieux)
  H -> API : re-fetch
  API -> E : GET ...
  E -->x API : échec persistant
  API --> H : HttpError
  alt chargement initial (pas de données)
    H --> S : écran d'erreur plein + « Réessayer »
  else page suivante (données déjà là)
    H --> S : erreur en pied de liste — liste conservée, réessai en place
  end
else hors-ligne
  H -> API : fetch
  API -->x E : pas de réseau
  alt cache présent (stale)
    Q --> H : pages/fiche périmées
    H --> S : contenu du cache + bannière hors-ligne
  else cache absent
    H --> S : écran hors-ligne + « Réessayer »
  end
end
@enduml
```

## Notes

- **Mapping d'erreurs.** `404 → CatalogNotFoundError` (« introuvable ») ;
  `503 / timeout / réseau → CatalogUnavailableError` (« service indisponible / réessayer »).
  Réutilise `HttpError(status, message, details)` de `core/http/http-error.ts`. Le `422`
  (q vide) est évité en amont par la garde de recherche (`03-sequence-search.md`).
- **`retry:1`.** Un seul réessai silencieux (config `core/query`) avant de remonter l'erreur à
  l'UI — absorbe les coupures transitoires sans boucle.
- **Initial vs page suivante.** Erreur **initiale** (aucune donnée) → écran plein + « Réessayer ».
  Erreur de **page suivante** (`isFetchingNextPage` en échec) → **pied de liste** en erreur, la
  liste déjà chargée **reste visible** (ne pas tout jeter). Repris dans `07-state-list-screen.md`
  (états `Error` vs `NextPageError`).
- **Hors-ligne.** Cache **en mémoire** uniquement (pas d'`AsyncStorage` en MVP) : « hors-ligne
  avec contenu » n'existe que si la donnée a déjà été chargée dans la session (`gcTime 5min`).
  Une vraie persistance hors-ligne est un **fast-follow** (cf. `11-data-flow.md`).
- **Encyclopédie-seule.** Aucune bascule vers NestJS sur 404 (≠ scan UC4 transitoire) : le
  catalogue lit uniquement Python (ADR-0005).
- **Conformité.** Le code doit produire ces mappings d'erreur et distinguer initial/page
  suivante. Implémentation après validation.
