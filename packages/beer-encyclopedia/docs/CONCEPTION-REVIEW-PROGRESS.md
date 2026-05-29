# Revue de conception — beer-encyclopedia — journal de progression

> Fichier de suivi **vivant** de la revue de l'étude de conception du backend
> `beer-encyclopedia`. À mettre à jour à chaque session. Sert de « todo de session »
> et de point de reprise.
>
> **Branche :** `docs/beer-encyclopedia-conception` · **PR :** #1146

## Principes actés (la conception fait foi)

- **La conception est la source de vérité ; le code s'y conforme** (jamais l'inverse).
  Toute évolution se fait des deux côtés. Divergences code↔conception = tickets de travail.
  (repo ADR-0013, clause 6)
- **Étude de conception en français** — exception assumée à la règle « docs en anglais »
  (projet perso, support d'apprentissage). Reste en anglais : code, commits, corps de PR,
  issues, ADR. (repo ADR-0013, clause 7)
- **Diagrammes in-package** (`packages/beer-encyclopedia/docs/diagrams/beer-encyclopedia/`)
  en prévision d'un futur découpage multi-repos. (repo ADR-0013, clause 4)
- **Modèle `Beer` normalisé = canonique** ; `scan_catalog_items` (NestJS) = cache transitoire.
  (repo ADR-0013, clauses 1-2)
- **Deux notations** par diagramme de cas d'usage : Mermaid (aperçu rapide) + PlantUML
  (notation magistrale). À garder synchronisées.
- **Scan = identification uniquement** ; la reco de recettes proches est un autre service
  (domaine Recette), hors périmètre encyclopédie.
- **Maintenance via une interface web admin dédiée** (Mainteneur), jamais via le mobile.

## État des diagrammes

| Diagramme | État | Langue | Notes |
|-----------|------|--------|-------|
| `01-use-case.md` | ✅ revu & validé (UC1→UC9) | FR | Mermaid + PlantUML + 9 fiches Cockburn |
| `02-sequence-import-by-ean.md` | ✅ revu | FR | flux cible UC4 |
| `02-sequence-scan.md` | ⬜ à revoir | EN | décrit la reco recettes (à recadrer : UC5 = identification → le code s'adapte) |
| `03-component.md` | ⬜ à revoir | EN | |
| `04-class.md` | ⬜ à revoir | EN | + divergence `scan/04-class` (#1148) |
| `05-state.md` | ⬜ à revoir | EN | cycle de vie correction (UC6→UC9) ; provenance Beer |
| `06-data-flow.md` | ⬜ à revoir | EN | PII / import OFF |
| séquence UC5 (scan d'étiquette) | ⬜ à créer | FR | identification ; renvoie au détail de l'étude `scan/` |

## Fait le 2026-05-29

- **Audit conception** : confirmé qu'il manquait l'étude UML du backend (UML-first non respecté).
- **Doc 1 (use-case)** revu cas par cas et finalisé (FR, 2 notations, 9 fiches Cockburn).
  Décisions : généralisation d'acteurs ; UC4 identifier code-barres ; UC5 «extend» (étiquette)
  ; UC4 «include» UC3 ; UC4/UC5 = identification ; recettes hors périmètre ; UC8/UC9 via admin
  ; UC9 enrichie (priorité+réputation, notifications, amendement, historique, conflits).
- **Doc 2 (séquence import-by-ean / UC4)** traduit en FR, recadré « cible ».
- **ADR-0013** complété (clauses 6 « conception fait foi » + 7 « étude en FR »).
- **Issues créées** : #1151, #1152, #1153, #1154, #1155 (voir ci-dessous).
- Outils : extension VSCode `jebbs.plantuml` + rendu **local** (`plantuml.render: Local`).

## Prochaines étapes (reprise de session)

1. **Doc 3 — composant** : revue + FR. Frontière api → ml/db/importers + inter-backend (ADR-0005).
2. **Doc 4 — classes** : revue + FR ; vérifier la conformité champ-à-champ avec `db/models/*` ;
   acter la divergence `scan/04-class` (#1148).
3. **Doc 5 — états** : revue + FR ; cycle de vie `CommunityCorrection` (pending→approved/rejected)
   + intégrer l'historique/audit (#1155) et la provenance `Beer`.
4. **Doc 6 — data-flow** : revue + FR ; PII (rien vers OFF) ; flux d'import.
5. **Séquence UC5 (scan d'étiquette)** : créer ; identification → fiche / proposition ;
   recadrer `02-sequence-scan` (la reco recettes sort → le code s'adapte).
6. **Cohérence finale** : relire l'ensemble, vérifier les renvois croisés, puis entrée
   `PROJECT_LOG.md` à la fusion de la PR #1146.

## Issues ouvertes (suivi)

- **#1146** — PR : étude UML + ADR (en cours).
- **#1147** — Épic : mise en ordre conception beer-encyclopedia.
- **#1148** — Corriger la divergence `scan/04-class.md` (ADR-0013).
- **#1149** — Endpoints corrections + médias (UC6/UC9 / modélisés, pas d'API).
- **#1150** — ETL `scan_catalog_items` → `beers`.
- **#1151** — Sécurité : endpoints d'écriture sans auth.
- **#1152** — Interface web admin Mainteneur dédiée (maintenance hors mobile).
- **#1153** — Modération : priorité par agrégation + réputation contributeur.
- **#1154** — Modération : notifier le contributeur (cross-backend).
- **#1155** — Historique / audit des changements de catalogue.

## Rappels techniques

- **Rendu Mermaid** (validation) : `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome mmdc -p <pptr.json> -i <fichier.md> -o <out.svg>`.
- **Rendu PlantUML** : `plantuml -tpng -o <dir> <fichier.puml>` (Java + Graphviz présents) ;
  dans VSCode, **Alt+D** dans le bloc ` ```plantuml ` (extension `jebbs.plantuml`, rendu local).
- **Aperçu Markdown VSCode** : `Ctrl+Shift+V` (Mermaid via `bierner.markdown-mermaid`).
- Chantier `chore/review-pipeline` mis de côté dans un `git stash`
  (`git checkout chore/review-pipeline && git stash pop` pour le reprendre).
