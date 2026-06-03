# Matrice de traçabilité — conception Brasse-Bouillon

> **Artefact système / transverse** (foyer central, modèle C4). Relie chaque **cas d'usage**
> à ses **réalisations** (séquences, composant, classes, états, data-flow), où qu'elles
> vivent. Les diagrammes **composant** vivent in-package ; cette matrice, **transverse**,
> vit ici (repo ADR-0013, clause 4). Langue : **français** (cohérence avec l'étude de conception).

## Périmètre actuel

Couvre le domaine **beer-encyclopedia** (backend). S'étendra aux autres packages au fil des revues.
Étude de cas d'usage : [`01-use-case.md`](diagrams/beer-encyclopedia/01-use-case.md).

## État des diagrammes — beer-encyclopedia

| Diagramme | Fichier | État |
|-----------|---------|------|
| Cas d'usage | [`01-use-case.md`](diagrams/beer-encyclopedia/01-use-case.md) | ✅ |
| Séquence — UC4 (backend) | [`02-sequence-import-by-ean.md`](diagrams/beer-encyclopedia/02-sequence-import-by-ean.md) | ✅ |
| Séquence — UC5 (scan/identification) | [`02-sequence-scan.md`](diagrams/beer-encyclopedia/02-sequence-scan.md) | ✅ (délègue à `scan/02b`) |
| Composant | [`03-component.md`](diagrams/beer-encyclopedia/03-component.md) | ✅ (simple ; sources cibles → `scan/`) |
| Classes | `04-class.md` | ⬜ à revoir + FR |
| États | `05-state.md` | ⬜ à revoir + FR |
| Data-flow | `06-data-flow.md` | ⬜ à revoir + FR |
| Séquence mobile — UC4 (scan + affichage) | _(package mobile, futur chantier mobile↔API)_ | ⬜ à créer |

## Matrice — cas d'usage → réalisations

Légende : ✅ fait · ⬜ à venir · — non applicable.

| UC | Domaine | Séquence | Composant | Classes | États | Data-flow | Statut | Suivi |
|----|---------|----------|-----------|---------|-------|-----------|--------|-------|
| UC1 Parcourir le catalogue | Consulter | — (lecture simple) | 03 ⬜ (api→db) | Beer, Brewery, Style | — | — | livré | — |
| UC2 Rechercher | Consulter | — | 03 ⬜ | Beer, Brewery | — | — | livré | — |
| UC3 Consulter une fiche | Consulter | — | 03 ⬜ | Beer, Brewery, Style, TastingProfile, Media | — | — | livré | — |
| UC4 Identifier par code-barres | Acquérir | **backend** ✅ `02-sequence-import-by-ean` **+** mobile ⬜ | 03 ⬜ (api, importers, db) | Beer, Brewery, Source, EntitySource | provenance Beer (05 ⬜) | import OFF / PII (06 ⬜) | livré (backend) | #878 (rate-limit) |
| UC5 Identifier par scan d'étiquette | Acquérir | ✅ `02-sequence-scan` (délègue à `scan/02b`) | 03 ⬜ | Beer (source=scan), BeerDataSuggestion (étude `scan/`) | — | 06 ⬜ | planifié | #1156 (divergence /scan), #1149, étude `scan/` |
| UC6 Proposer une correction | Contribuer | — (texte) | 03 ⬜ | CommunityCorrection | pending→… (05 ⬜) | — | planifié | #1149 |
| UC7 Gérer le catalogue (C/U/D) | Curer | — | 03 ⬜ | Beer, Brewery | — | — | livré | #1151 (auth), #1152 (admin web) |
| UC8 Alimenter les référentiels | Curer | — | 03 ⬜ | Style, LegalDenomination, Source | — | — | livré | #1152 |
| UC9 Modérer les corrections | Curer | ⬜ (plus tard) | 03 ⬜ | CommunityCorrection (+ audit) | pending→approved/rejected (05 ⬜) | — | planifié | #1153, #1154, #1155 |

## Règles de traçabilité

- **Séquence seulement si non-trivial** : un diagramme de séquence n'existe que pour les
  scénarios traversant 2+ composants ou à branches conditionnelles (UC4, UC5, UC9). Les
  lectures/écritures simples (UC1/2/3/7/8) restent au niveau de la fiche Cockburn.
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
