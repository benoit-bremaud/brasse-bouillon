# Matrice de traçabilité — conception Brasse-Bouillon

> **Artefact système / transverse** (foyer central, modèle C4). Relie chaque **cas d'usage**
> à ses **réalisations** (séquences, composant, classes, états, data-flow), où qu'elles
> vivent. Tous les diagrammes vivent **centralement** sous `docs/architecture/diagrams/<feature>/`
> (une règle, pas d'exception — repo ADR-0013, clause 4) ; cette matrice, **transverse**, vit
> à côté. Langue : **français** (cohérence avec l'étude de conception).

## Périmètre actuel

Couvre le domaine **beer-encyclopedia** (backend), la **réalisation mobile du catalogue**
(`mobile-catalog` — consommation de l'API encyclopédie) et la **modération du catalogue**
(`catalog-moderation` — surface mode créateur in-app, ADR-0018). S'étendra aux autres packages
au fil des revues. Études de cas d'usage :
[`beer-encyclopedia/01-use-case.md`](diagrams/beer-encyclopedia/01-use-case.md) (backend) ·
[`mobile-catalog/01-use-case.md`](diagrams/mobile-catalog/01-use-case.md) (mobile) ·
[`catalog-moderation/01-use-case.md`](diagrams/catalog-moderation/01-use-case.md) (modération) ·
[`academy/00-overview.md`](diagrams/academy/00-overview.md) (Académie brassicole, ADR-0023).

## État des diagrammes — beer-encyclopedia

| Diagramme | Fichier | État |
|-----------|---------|------|
| Cas d'usage | [`01-use-case.md`](diagrams/beer-encyclopedia/01-use-case.md) | ✅ |
| Séquence — UC4 (backend) | [`02-sequence-import-by-ean.md`](diagrams/beer-encyclopedia/02-sequence-import-by-ean.md) | ✅ |
| Séquence — UC5 (scan/identification) | [`02-sequence-scan.md`](diagrams/beer-encyclopedia/02-sequence-scan.md) | ✅ (délègue à `scan/02b`) |
| Composant | [`03-component.md`](diagrams/beer-encyclopedia/03-component.md) | ✅ (simple ; sources cibles → `scan/`) |
| Classes | [`04-class.md`](diagrams/beer-encyclopedia/04-class.md) | ✅ (conforme code ; `source=scan` cible) |
| Classes — contrat API (DTO) | [`07-class-api-contract.md`](diagrams/beer-encyclopedia/07-class-api-contract.md) | 🎯 cible (`BeerRead` + `brewery_name`/`style_name` dénormalisés ; code à conformer) |
| États | [`05-state.md`](diagrams/beer-encyclopedia/05-state.md) | ✅ (modération + provenance) |
| Data-flow | [`06-data-flow.md`](diagrams/beer-encyclopedia/06-data-flow.md) | ✅ (import EAN + PII) |
| Séquence mobile — UC4 (scan + affichage) | [`08-sequence-mobile-scan.md`](diagrams/beer-encyclopedia/08-sequence-mobile-scan.md) | 🎯 cible (encyclopedia-first ; cutover #1186 ; code à conformer) |

## État des diagrammes — mobile-catalog

Réalisation **mobile** de UC1/UC2/UC3 (catalogue de bières) consommant l'API encyclopédie.
Étude **conçue avant code** (ADR-0013) : tous les diagrammes sont 🎯 cible (code à conformer).

| Diagramme | Fichier | État |
|-----------|---------|------|
| Cas d'usage (mobile) | [`01-use-case.md`](diagrams/mobile-catalog/01-use-case.md) | 🎯 cible (UC1/2/3 mobile + extensions ; rubriques/filtres `<<fast-follow>>`) |
| Séquence — UC1 Parcourir | [`02-sequence-browse.md`](diagrams/mobile-catalog/02-sequence-browse.md) | 🎯 cible (scroll infini, `getNextPageParam`) |
| Séquence — UC2 Rechercher | [`03-sequence-search.md`](diagrams/mobile-catalog/03-sequence-search.md) | 🎯 cible (debounce + annulation) |
| Séquence — UC3 Fiche | [`04-sequence-fiche.md`](diagrams/mobile-catalog/04-sequence-fiche.md) | 🎯 cible (404 + amorçage cache + nav brasserie/style) |
| Séquence — variantes d'erreur | [`05-sequence-errors.md`](diagrams/mobile-catalog/05-sequence-errors.md) | 🎯 cible (404 / timeout / hors-ligne) |
| Composant | [`06-component.md`](diagrams/mobile-catalog/06-component.md) | 🎯 cible (couches mobile ↔ API ; frontière ADR-0005) |
| États — écran liste | [`07-state-list-screen.md`](diagrams/mobile-catalog/07-state-list-screen.md) | 🎯 cible (cycle de vie pagination, dérivé TanStack) |
| États — saisie recherche | [`08-state-search-input.md`](diagrams/mobile-catalog/08-state-search-input.md) | 🎯 cible (FSM debounce/cancel) |
| Classes — domaine | [`09-class-domain.md`](diagrams/mobile-catalog/09-class-domain.md) | 🎯 cible (`CatalogBeer`, `Page<T>`, `PaginationMeta`) |
| Classes — view-model | [`10-class-view-model.md`](diagrams/mobile-catalog/10-class-view-model.md) | 🎯 cible (`BeerListItemVM`, `CatalogListVM`, `SearchVM`) |
| Data-flow | [`11-data-flow.md`](diagrams/mobile-catalog/11-data-flow.md) | 🎯 cible (DTO→mapper→VM + cache ; aucune PII) |

## État des diagrammes — catalog-moderation

Réalisation **mode créateur in-app** de la modération du catalogue (domaine Curer), décidée par
ADR-0018. Étude **conçue avant code** : tous les diagrammes sont 🎯 cible. Réalise la **promotion**
(M2 → UC9 / ADR-0015 D4) et la **dépublication réversible** (M3 → UC7 suppression logique).

| Diagramme | Fichier | État |
|-----------|---------|------|
| Cas d'usage (modération) | [`01-use-case.md`](diagrams/catalog-moderation/01-use-case.md) | 🎯 cible (M1 trier · M2 promouvoir · M3 dépublier · M4 republier) |
| Séquence — promouvoir / dépublier | [`02-sequence-promote-depublish.md`](diagrams/catalog-moderation/02-sequence-promote-depublish.md) | 🎯 cible (Mobile → NestJS admin → encyclopédie ; fermera #1151 — cible, non livré) |
| Composant — frontière d'auth | [`03-component.md`](diagrams/catalog-moderation/03-component.md) | 🎯 cible (`JwtAuthGuard` + `RolesGuard CREATOR` ; ADR-0002) |
| États — cycle de publication | [`04-state-entry-lifecycle.md`](diagrams/catalog-moderation/04-state-entry-lifecycle.md) | 🎯 cible (staged → published → depublished → deleted ; correctif conformité ADR-0015 D1) |

## Matrice — cas d'usage → réalisations

Légende : ✅ fait · 🎯 conçu (cible, code à venir) · ⬜ à venir · — non applicable.

| UC | Domaine | Séquence | Composant | Classes | États | Data-flow | Statut | Suivi |
|----|---------|----------|-----------|---------|-------|-----------|--------|-------|
| UC1 Parcourir le catalogue | Consulter | backend — · **mobile** 🎯 `mobile-catalog/02` | `beer-encyclopedia/03` ⬜ · `mobile-catalog/06` | Beer, Brewery, Style · `mobile-catalog/09,10` | `mobile-catalog/07` | `mobile-catalog/11` | livré backend · mobile 🎯 conçu | — |
| UC2 Rechercher | Consulter | backend — · **mobile** 🎯 `mobile-catalog/03` | `beer-encyclopedia/03` ⬜ · `mobile-catalog/06` | Beer, Brewery · `mobile-catalog/09,10` | `mobile-catalog/08` | `mobile-catalog/11` | livré backend · mobile 🎯 conçu | — |
| UC3 Consulter une fiche | Consulter | backend — · **mobile** 🎯 `mobile-catalog/04` (+`05`) | `beer-encyclopedia/03` ⬜ · `mobile-catalog/06` | Beer, Brewery, Style, TastingProfile, Media · `mobile-catalog/09,10` | — | `mobile-catalog/11` | livré backend · mobile 🎯 conçu | — |
| UC4 Identifier par code-barres | Acquérir | **backend** ✅ `02-sequence-import-by-ean` **+** mobile ⬜ | 03 ⬜ (api, importers, db) | Beer, Brewery, Source, EntitySource | provenance Beer (05 ⬜) | import OFF / PII (06 ⬜) | livré (backend) | #878 (rate-limit) |
| UC5 Identifier par scan d'étiquette | Acquérir | ✅ `02-sequence-scan` (délègue à `scan/02b`) | 03 ⬜ | Beer (source=scan), BeerDataSuggestion (étude `scan/`) | — | 06 ⬜ | planifié | #1156 (divergence /scan), #1149, étude `scan/` |
| UC6 Proposer une correction | Contribuer | — (texte) | 03 ⬜ | CommunityCorrection | pending→… (05 ⬜) | — | planifié | #1149 |
| UC7 Gérer le catalogue (C/U/D) | Curer | 🎯 `catalog-moderation/02` (M3 dépublier = suppression logique) | `catalog-moderation/03` 🎯 | Beer, Brewery | `catalog-moderation/04` 🎯 | — | livré (CRUD) · modération in-app 🎯 | #1151 (auth), #1152 (re-cadré ADR-0018), #1175 |
| UC8 Alimenter les référentiels | Curer | — | 03 ⬜ | Style, LegalDenomination, Source | — | — | livré | #1152 |
| UC9 Modérer les corrections / promouvoir | Curer | 🎯 `catalog-moderation/02` (M2 promouvoir) · corrections ⬜ | `catalog-moderation/03` 🎯 | CommunityCorrection, Beer (is_verified) | `catalog-moderation/04` 🎯 · corrections (05 ⬜) | — | planifié · promotion in-app 🎯 | #1153, #1154, #1155, ADR-0015 D4 |

## État des diagrammes — academy

Réalisation **mobile** de l'Académie brassicole comme base de connaissances générée
(ADR-0023). Étude conçue avant code : tous les diagrammes sont 🎯 cible.

| Diagramme | Fichier | État |
|-----------|---------|------|
| Vue d'ensemble | [`00-overview.md`](diagrams/academy/00-overview.md) | 🎯 cible |
| Contexte | [`01-context.md`](diagrams/academy/01-context.md) | 🎯 cible |
| Cas d'usage | [`02-use-case.md`](diagrams/academy/02-use-case.md) | 🎯 cible |
| Classes domaine | [`03-domain-class.md`](diagrams/academy/03-domain-class.md) | 🎯 cible |
| Composants | [`04-components.md`](diagrams/academy/04-components.md) | 🎯 cible |
| Séquence — ouvrir un article | [`05-sequence-open-article.md`](diagrams/academy/05-sequence-open-article.md) | 🎯 cible |
| Séquence — générer le contenu | [`06-sequence-generate-content.md`](diagrams/academy/06-sequence-generate-content.md) | 🎯 cible |
| États — cycle de vie article | [`07-state-article-lifecycle.md`](diagrams/academy/07-state-article-lifecycle.md) | 🎯 cible |
| Activité — recherche locale | [`08-activity-search.md`](diagrams/academy/08-activity-search.md) | 🎯 cible |
| Séquence — futur chatbot RAG | [`09-sequence-chatbot-rag.md`](diagrams/academy/09-sequence-chatbot-rag.md) | 🎯 cible V2 |
| Notes d'implémentation | [`10-implementation-notes.md`](diagrams/academy/10-implementation-notes.md) | 🎯 cible |

## Règles de traçabilité

- **Séquence seulement si non-trivial — jugé par réalisation.** Un diagramme de séquence
  n'existe que pour les scénarios traversant 2+ composants ou à branches conditionnelles.
  **Côté backend**, les lectures/écritures simples (UC1/2/3/7/8) restent au niveau de la fiche
  Cockburn — un `GET` paginé direct sur la DB est trivial. **Côté mobile**, la réalisation de
  UC1/UC2/UC3 n'est **plus** triviale : paginée (scroll infini, `useInfiniteQuery` +
  `onEndReached`), debouncée/annulable (recherche), orchestrée sur 5+ composants (route → écran
  → hook → use-case → data → `core/http` → API), avec branches erreur/cache/hors-ligne. Ces
  réalisations mobiles **ont donc des séquences dédiées** (`mobile-catalog/02..05`), exactement
  comme UC4 a une séquence mobile (`08-sequence-mobile-scan`) distincte de sa séquence backend.
  **La trivialité se juge par réalisation (backend vs mobile), pas par cas d'usage.**
- **Réalisation collaborative** : un cas d'usage peut être réalisé par **plusieurs séquences**
  sur plusieurs composants. Ex. **UC4 = séquence mobile (scan + affichage) + séquence backend
  (`import-by-ean`)**. La matrice est ce qui les recoud.
- **Cohérence des noms** : un même élément (acteur, cas d'usage, classe, composant) porte le
  même nom partout (`Beer` classe = `BeerRead` renvoyé = « fiche » de UC3).
- **La conception fait foi** : si une réalisation (code ou diagramme composant) diverge,
  c'est elle qu'on corrige (repo ADR-0013, clause 6).

## Renvois

- Cas d'usage et fiches Cockburn : [`01-use-case.md`](diagrams/beer-encyclopedia/01-use-case.md)
- ADR structurant : [`0013-beer-canonical-model-and-conception-order.md`](decisions/0013-beer-canonical-model-and-conception-order.md)
- Suivi de la revue : [`CONCEPTION-REVIEW-PROGRESS.md`](../../packages/beer-encyclopedia/docs/CONCEPTION-REVIEW-PROGRESS.md)
