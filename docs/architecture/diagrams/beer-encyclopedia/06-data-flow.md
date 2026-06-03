# Diagramme de flux de données — beer-encyclopedia — import EAN & PII

> **Périmètre :** flux de données de `POST /beers/import-by-ean` + inventaire PII
> **Code concerné :** `importers/openfoodfacts.py`, `importers/persistence.py`,
> `db/models/beer.py`, `db/models/source.py`
> **ADR liés :** ADR-0003 (connecteur Open Food Facts)
> **Voir aussi :** `02-sequence-import-by-ean.md` · `../scan/06-data-flow.md` (PII image du scan) · `../../traceability-matrix.md`

## Contexte

Où circulent les données de bière pendant un import EAN, et quels champs sont sensibles.
Objectif : rendre **explicite la frontière de confidentialité** — **aucune identité
utilisateur n'est envoyée à la source externe**.

**Périmètre (simple d'abord)** : ce diagramme couvre l'import EAN (OFF). Le flux du **scan
d'étiquette** (UC5) et sa PII image (EXIF, `deviceName`) sont traités dans
`../scan/06-data-flow.md` — renvoi en note, pas de duplication.

## Diagramme (Mermaid — aperçu rapide)

```mermaid
flowchart LR
  Caller(("Appelant (mobile / NestJS)"))
  OFF["Open Food Facts (externe)"]
  subgraph PY ["beer-encyclopedia"]
    API["/beers/import-by-ean"]
    Map["map produit → ExternalBeerSnapshot"]
    Upsert["upsert_beer_from_snapshot"]
  end
  Beers[("beers")]
  Breweries[("breweries")]
  ES[("entity_sources (raw_data)")]

  Caller -->|"code EAN uniquement"| API
  API -->|"code EAN uniquement"| OFF
  OFF -->|"name, brand, abv, country, allergens, image_url, payload brut"| Map
  Map -->|"snapshot normalisé (faits bière, non-PII)"| Upsert
  Upsert -->|"name, abv, country, allergens, ean_code"| Beers
  Upsert -->|"brand → name"| Breweries
  Upsert -->|"external_id, payload OFF brut"| ES
  API -.->|"contributed_by : UUID utilisateur lâche — JAMAIS envoyé dehors"| Beers
```

_Même flux en **PlantUML** (notation magistrale). À garder **synchronisé** avec le bloc Mermaid._

```plantuml
@startuml
title dfd — beer-encyclopedia (import EAN & PII)
skinparam shadowing false
left to right direction

actor "Appelant\n(mobile / NestJS)" as Caller
cloud "Open Food Facts\n(externe)" as OFF

package "beer-encyclopedia" {
  component "/beers/import-by-ean" as API
  component "map → ExternalBeerSnapshot" as Map
  component "upsert_beer_from_snapshot" as Upsert
}

database "beers" as Beers
database "breweries" as Breweries
database "entity_sources\n(raw_data)" as ES

Caller --> API : code EAN uniquement
API --> OFF : code EAN uniquement
OFF --> Map : name, brand, abv, country,\nallergens, image_url, payload brut
Map --> Upsert : snapshot normalisé\n(faits bière, non-PII)
Upsert --> Beers : name, abv, country,\nallergens, ean_code
Upsert --> Breweries : brand → name
Upsert --> ES : external_id, payload OFF brut
API ..> Beers : contributed_by (UUID lâche)\nJAMAIS envoyé vers l'extérieur

note bottom
  Aucune PII vers OFF : seul le code EAN sort.
  Flux scan d'étiquette (UC5) + PII image (EXIF, deviceName)
  -> voir scan/06-data-flow.
end note
@enduml
```

## Notes

- **Aucune PII vers OFF** : la seule donnée envoyée à Open Food Facts est le **code EAN**.
  Ni `user_id`, ni données d'appareil, ni jeton d'auth ne franchissent la frontière.
- **`contributed_by` — divergence ouverte (#1163)** : ce UUID utilisateur lâche n'est
  jamais envoyé dehors (arête PII pointillée), **mais** le **stocker côté Python contredit
  ADR-0005 / ADR-0009** (« the encyclopedia carries no user data » — c'est une question de
  **possession**, pas seulement de transmission). Divergence code↔ADR pré-existante (le
  champ existe déjà dans `db/models/beer.py`). Décision différée : router l'identité via
  NestJS, ou exception encadrée — voir #1163. Ce diagramme la **signale**, ne la tranche pas.
- **Rétention `raw_data`** : le payload OFF complet est stocké dans
  `entity_sources.raw_data` pour re-transformer sans re-fetch et pour l'audit. Il contient
  des faits produit, pas de données personnelles.
- **Allergènes** normalisés en liste de tokens dédupliquée avant stockage (champ
  réglementaire ADR-0002), pas du texte libre.
- **Scan d'étiquette (UC5)** : la PII image (EXIF GPS, `Constants.deviceName`) et son
  stripping obligatoire sont hors de ce diagramme — voir `../scan/06-data-flow.md`.
