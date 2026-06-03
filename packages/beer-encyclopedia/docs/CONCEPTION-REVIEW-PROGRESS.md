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
- **Monorepo conservé ; split multi-repos différé** (aucun déclencheur). **Toute la
  conception est centralisée** sous `docs/architecture/` : diagrammes par feature dans
  `docs/architecture/diagrams/beer-encyclopedia/` (comme les 11 autres features), matrice
  de traçabilité `docs/architecture/traceability-matrix.md`. Plus d'exception in-package.
  (repo ADR-0013, clause 4)
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
| `02-sequence-import-by-ean.md` | ✅ revu | FR | UC4 — **réalisation backend** (option A) |
| `02-sequence-scan.md` (UC5) | ✅ revu & validé | FR | identification (Mermaid + PlantUML) ; délègue le pipeline à `scan/02b` ; divergence `/scan`→recettes tracée #1156 |
| `03-component.md` | ✅ revu & validé (simple) | FR | Mermaid + PlantUML ; OFF = seule source dessinée (active) ; pipeline OCR/IA + importers Untappd/RateBeer = cible, renvoi `scan/03-component` (**à peaufiner** plus tard) ; divergences #1156 / #1161 |
| `04-class.md` | ✅ revu & validé | FR | Mermaid + PlantUML ; conforme `db/models/*` ; `source=scan` en vue cible (#1156) ; CHECK `ck_media_parent_required` ; divergence inter-études `scan/04-class` #1148 |
| `05-state.md` | ⬜ à revoir | EN | cycle de vie correction (UC6→UC9) ; provenance Beer |
| `06-data-flow.md` | ⬜ à revoir | EN | PII / import OFF |

## Fait le 2026-05-29

- **Audit conception** : confirmé qu'il manquait l'étude UML du backend (UML-first non respecté).
- **Doc 1 (use-case)** revu cas par cas et finalisé (FR, 2 notations, 9 fiches Cockburn).
  Décisions : généralisation d'acteurs ; UC4 identifier code-barres ; UC5 «extend» (étiquette)
  ; UC4 «include» UC3 ; UC4/UC5 = identification ; recettes hors périmètre ; UC8/UC9 via admin
  ; UC9 enrichie (priorité+réputation, notifications, amendement, historique, conflits).
- **Doc 2 (séquence import-by-ean / UC4)** traduit en FR, recadré « cible ».
- **ADR-0013** complété (clauses 6 « conception fait foi » + 7 « étude en FR »).
- **Issues créées** : #1151, #1152, #1153, #1154, #1155 (voir ci-dessous).
- **Décision repo** : rester en **monorepo**, split **différé** (cf. principe ci-dessus).
- **Matrice de traçabilité** créée : `docs/architecture/traceability-matrix.md` (niveau système).
- **Séquence UC4** recadrée **option A** (réalisation backend ; scan+affichage = séquence mobile à venir).
- Outils : extension VSCode `jebbs.plantuml` + rendu **local** (`plantuml.render: Local`).

## Prochaines étapes (reprise de session)

_(Ordre : les **séquences** d'abord — juste après les cas d'usage — puis composant / classes / états / data-flow.)_

1. **Séquence UC5 (scan d'étiquette)** : recadrer `02-sequence-scan` en *identification* (FR) ;
   la reco recettes sort du périmètre → le **code s'adapte** ; renvoi à l'étude `scan/`.
2. **Doc 3 — composant** : revue + FR. Frontière api → ml/db/importers + inter-backend (ADR-0005).
3. **Doc 4 — classes** : revue + FR ; conformité champ-à-champ avec `db/models/*` ;
   divergence `scan/04-class` (#1148).
4. **Doc 5 — états** : revue + FR ; cycle de vie `CommunityCorrection` (pending→approved/rejected)
   + historique/audit (#1155) + provenance `Beer`.
5. **Doc 6 — data-flow** : revue + FR ; PII (rien vers OFF) ; flux d'import.
6. **Cohérence finale** : compléter la **matrice de traçabilité**, vérifier les renvois croisés,
   puis entrée `PROJECT_LOG.md` à la fusion de la PR #1146.

_Rappel : UC1/2/3/7/8 n'ont **pas** de séquence (texte suffit) ; séquences = UC4 ✅, UC5, UC9 (plus tard)._

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
