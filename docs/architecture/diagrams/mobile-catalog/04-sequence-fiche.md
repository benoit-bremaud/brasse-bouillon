# Diagramme de séquence — mobile-catalog — Consulter une fiche bière (UC3, + tap brasserie/style)

> **Réalise :** UC3 — Consulter la fiche d'une bière, **côté mobile** (GET by id + amorçage cache + navigation brasserie/style)
> **Code concerné (cible) :** `features/beer-catalog/presentation/BeerDetailScreen.tsx`, `application/useBeer.ts`, `data/beer-catalog.api.ts`
> **ADR liés :** repo ADR-0005 (lecture publique), ADR-0017 (intervalles → EBC d'affichage), repo ADR-0013 (la conception fait foi)
> **Voir aussi :** `01-use-case.md` (UC3) · `09-class-domain.md` (`CatalogBeerDetail`) · `10-class-view-model.md` (`BeerDetailVM`) · `05-sequence-errors.md` (404) · `../../traceability-matrix.md`

## Contexte

Séquence **cible** de la fiche bière. Montre l'**amorçage du cache** (la ligne de liste porte
déjà un `CatalogBeer` → la fiche s'affiche partiellement **avant** la réponse `GET /beers/{id}`),
la branche **404**, et la **navigation** vers la fiche brasserie/style (tap → `GET /breweries/{id}`
/ `GET /styles/{id}`). C'est une lecture simple **par entité**, mais les branches (cache /
404 / navigation) la rendent non triviale côté client.

## Diagramme (Mermaid — flux cible)

```mermaid
sequenceDiagram
  autonumber
  actor U as Visiteur
  participant L as Liste (UC1/UC2)
  participant FS as BeerDetailScreen
  participant H as useBeer (useQuery)
  participant Q as Cache TanStack
  participant API as beer-catalog.api (request, auth:false)
  participant E as beer-encyclopedia (FastAPI)

  U->>L: tape une bière (id)
  L->>FS: navigue /(app)/beer-catalog/beer/[id]
  FS->>H: useQuery(["beer", id]) + placeholderData (CatalogBeer de la liste)
  H-->>FS: rendu partiel immédiat (depuis la liste)
  alt fiche complète en cache et fraîche
    H->>Q: lit ["beer", id]
    Q-->>H: CatalogBeerDetail
    H-->>FS: fiche complète (sans réseau)
  else cache absent / périmé
    H->>API: getBeer(id)
    API->>E: GET /beers/{id}
    alt 200 trouvée
      E-->>API: 200 BeerRead
      API->>API: mappe → CatalogBeerDetail
      API-->>H: CatalogBeerDetail
      H-->>FS: fiche complète (nom, brasserie, style, ABV, IBU/SRM→EBC, mentions légales, provenance)
    else 404 introuvable
      E-->>API: 404
      API-->>H: HttpError(404) → CatalogNotFoundError
      H-->>FS: « bière introuvable »
    end
  end

  opt tap brasserie
    U->>FS: tape la brasserie
    FS->>API: getBrewery(breweryId)
    API->>E: GET /breweries/{id}
    E-->>API: 200 BreweryRead
    API-->>FS: fiche brasserie (navigation)
  end
  opt tap style
    U->>FS: tape le style
    FS->>API: getStyle(styleId)
    API->>E: GET /styles/{id}
    E-->>API: 200 StyleRead
    API-->>FS: fiche style (navigation)
  end
```

*Même flux en **PlantUML** (à garder synchronisé avec le bloc Mermaid).*

```plantuml
@startuml
title sd — mobile-catalog — Consulter une fiche bière (UC3)
autonumber
actor Visiteur as U
participant "Liste (UC1/UC2)" as L
participant "BeerDetailScreen" as FS
participant "useBeer (useQuery)" as H
participant "Cache TanStack" as Q
participant "beer-catalog.api\n(request, auth:false)" as API
participant "beer-encyclopedia" as E

U -> L : tape une bière (id)
L -> FS : navigue /(app)/beer-catalog/beer/[id]
FS -> H : useQuery(["beer", id]) + placeholderData (de la liste)
H --> FS : rendu partiel immédiat
alt fiche complète en cache et fraîche
  H -> Q : lit ["beer", id]
  Q --> H : CatalogBeerDetail
  H --> FS : fiche complète (sans réseau)
else cache absent / périmé
  H -> API : getBeer(id)
  API -> E : GET /beers/{id}
  alt 200 trouvée
    E --> API : 200 BeerRead
    API -> API : mappe -> CatalogBeerDetail
    API --> H : CatalogBeerDetail
    H --> FS : fiche complète
  else 404 introuvable
    E --> API : 404
    API --> H : HttpError(404) -> CatalogNotFoundError
    H --> FS : « bière introuvable »
  end
end

opt tap brasserie
  U -> FS : tape la brasserie
  FS -> API : getBrewery(breweryId)
  API -> E : GET /breweries/{id}
  E --> API : 200 BreweryRead
  API --> FS : fiche brasserie (navigation)
end
opt tap style
  U -> FS : tape le style
  FS -> API : getStyle(styleId)
  API -> E : GET /styles/{id}
  E --> API : 200 StyleRead
  API --> FS : fiche style (navigation)
end
@enduml
```

## Notes

- **Amorçage du cache (liste → détail).** La ligne de liste porte déjà un `CatalogBeer` ;
  `useQuery(["beer", id])` reçoit ce `CatalogBeer` en `placeholderData` (ou `initialData`) →
  la fiche s'affiche **immédiatement** (titre, brasserie, style, ABV) pendant que `GET
  /beers/{id}` complète les champs lourds (`CatalogBeerDetail` : mentions légales, provenance).
- **404.** `HttpError(404)` (de `core/http`) → `CatalogNotFoundError` → message « bière
  introuvable ». Les autres erreurs (timeout / hors-ligne) : `05-sequence-errors.md`. Le
  catalogue est **encyclopédie-seule** (pas de secours NestJS, contrairement au scan UC4).
- **Navigation brasserie/style.** Tap → `getBrewery`/`getStyle` (clés `["brewery", id]` /
  `["style", id]`). C'est de la **navigation** (UC3 pour une autre entité), pas un «include».
  Les routes sont portées par `TapTargetVM` (`10-class-view-model.md`).
- **Affichage couleur.** SRM (bornes) → EBC d'affichage via `srmToEbc`/`ebcToHex` réutilisés du
  **scan** ; calcul au **view-model** (`10`), pas au domaine. Cf. `11-data-flow.md`.
- **Conformité.** `useBeer` = `useQuery` (pas `useInfiniteQuery`) ; `getBeer`/`getBrewery`/
  `getStyle` via `request()` `auth:false`. Implémentation après validation.
