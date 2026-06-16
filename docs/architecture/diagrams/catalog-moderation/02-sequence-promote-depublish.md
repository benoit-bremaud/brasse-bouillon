# Diagramme de séquence — catalog-moderation — le CREATOR promeut / dépublie

> **Feature :** épic #1175 (réalise ADR-0015) — surface de modération in-app
> **Réalise :** M2 (promouvoir) et M3 (dépublier) de `01-use-case.md`
> **ADR liés :** ADR-0018 (auth à l'API NestJS), ADR-0002 (mobile ↔ NestJS seul), ADR-0015 (D4 promotion humaine), ADR-0012 (#1155 audit)

## Contexte

Scénario critique : la modération traverse **trois composants** (mobile → NestJS
→ encyclopédie). Cette séquence montre **où l'autorisation est vérifiée**
(au niveau NestJS, ce qui ferme #1151) et **que le mobile n'écrit jamais
directement** dans l'encyclopédie (ADR-0002). Le détail structurel est dans
`03-component.md` ; les états résultants dans `04-state-entry-lifecycle.md`.

## Diagramme

```mermaid
sequenceDiagram
  actor C as CREATOR
  participant M as Mobile (mode créateur)
  participant N as NestJS API (admin)
  participant E as Encyclopédie (Python)
  participant H as Historique (audit #1155)

  Note over M,N: ADR-0002 — le mobile ne parle qu'à NestJS

  C->>M: Ouvrir la file de validation (M1)
  M->>N: GET /admin/catalog/pending (Bearer JWT)
  N->>N: Vérifie JWT puis rang CREATOR (RolesGuard)
  alt rang insuffisant
    N-->>M: 403 Forbidden
    M-->>C: Accès refusé
  else autorisé
    N->>E: Lire les entrées en attente (is_verified faux)
    E-->>N: Liste des entrées en attente
    N-->>M: 200 file en attente
    M-->>C: Affiche la file (source, champs, provenance)
  end

  Note over C,E: M2 — Promouvoir une entrée

  C->>M: Tap Promouvoir sur une entrée
  M->>N: PATCH /admin/catalog/beers/ID/promote (Bearer JWT)
  N->>N: Vérifie JWT puis rang CREATOR
  N->>E: Basculer is_verified faux vers vrai
  E-->>N: 200 entrée promue
  N->>H: Consigner qui, quand, ancien vers nouveau
  N-->>M: 200 promue
  M-->>C: L'entrée rejoint le catalogue partagé

  Note over C,E: M3 — Dépublier une entrée non conforme

  C->>M: Tap Dépublier (ex. bouteille d'eau)
  M->>N: PATCH /admin/catalog/beers/ID/depublish (Bearer JWT)
  N->>N: Vérifie JWT puis rang CREATOR
  N->>E: Basculer la publication off (réversible)
  E-->>N: 200 entrée dépubliée
  N->>H: Consigner la décision et le motif
  N-->>M: 200 dépubliée
  M-->>C: L'entrée disparaît du catalogue public
```

*Même séquence en **PlantUML** (notation UML 2.5). À garder **synchronisé** avec
le bloc Mermaid ci-dessus.*

```plantuml
@startuml
actor "CREATOR" as C
participant "Mobile\n(mode créateur)" as M
participant "NestJS API\n(admin)" as N
participant "Encyclopédie\n(Python)" as E
participant "Historique\n(audit #1155)" as H

note over M, N: ADR-0002 — le mobile ne parle qu'à NestJS

C -> M : Ouvrir la file de validation (M1)
M -> N : GET /admin/catalog/pending (Bearer JWT)
N -> N : Vérifie JWT puis rang CREATOR (RolesGuard)
alt rang insuffisant
  N --> M : 403 Forbidden
  M --> C : Accès refusé
else autorisé
  N -> E : Lire les entrées en attente (is_verified faux)
  E --> N : Liste des entrées en attente
  N --> M : 200 file en attente
  M --> C : Affiche la file (source, champs, provenance)
end

note over C, E: M2 — Promouvoir une entrée

C -> M : Tap Promouvoir sur une entrée
M -> N : PATCH /admin/catalog/beers/ID/promote (Bearer JWT)
N -> N : Vérifie JWT puis rang CREATOR
N -> E : Basculer is_verified faux vers vrai
E --> N : 200 entrée promue
N -> H : Consigner qui, quand, ancien vers nouveau
N --> M : 200 promue
M --> C : L'entrée rejoint le catalogue partagé

note over C, E: M3 — Dépublier une entrée non conforme

C -> M : Tap Dépublier (ex. bouteille d'eau)
M -> N : PATCH /admin/catalog/beers/ID/depublish (Bearer JWT)
N -> N : Vérifie JWT puis rang CREATOR
N -> E : Basculer la publication off (réversible)
E --> N : 200 entrée dépubliée
N -> H : Consigner la décision et le motif
N --> M : 200 dépubliée
M --> C : L'entrée disparaît du catalogue public
@enduml
```

## Notes

- **#1151 fermée au bon endroit.** L'autorisation (`JWT` + rang `CREATOR`) est
  vérifiée **dans NestJS**, pas dans l'UI mobile. Une requête sans `CREATOR`
  reçoit `403` avant tout effet de bord — masquer le bouton côté mobile ne
  suffirait pas (ADR-0018).
- **L'encyclopédie ne fait confiance qu'à NestJS.** Les écritures
  (`promote`/`depublish`) arrivent par le canal interne authentifié
  NestJS→Python ; aucune écriture publique non authentifiée ne subsiste (la
  suppression directe de la bouteille d'eau, faite à la main via l'endpoint
  ouvert, était précisément l'exploitation de #1151).
- **Réversibilité + audit.** `depublish` bascule un statut (réversible via M4),
  jamais un `DELETE` ; chaque action écrit l'historique (#1155, ADR-0012).
- **Pas d'auto-promotion (ADR-0015 D4).** `promote` n'est jamais déclenché par
  le système — toujours par le tap du CREATOR.
- **Le `GET /admin/catalog/pending` voit le staging ; les lectures publiques
  non.** La file expose les entrées `is_verified=false` ; `GET /beers` public
  les filtre (`04-state`).
