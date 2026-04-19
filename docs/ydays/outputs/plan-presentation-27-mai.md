# Plan de la soutenance Ydays — 2026-05-27 (30 min)

## Finalité

Soutenance finale "Pitch Entrepreneurial" Ydays Ynov. Jury composite,
évaluation sur 7 critères (issues #522–#528), **30 minutes** dont 20 min
de présentation + 10 min Q&A approximatifs (à confirmer avec l'école —
*[trou factuel : durée exacte Q&A]*).

## Principes directeurs

### A0 — Découpage hybride parcours + experts (figé 2026-04-16)

- **Trame macro** = parcours utilisateur **Avant / Pendant / Après
  brassage** + Business Model + Perspectives + Démo live.
- **Interventions expertes 1-2 min** ancrées par pôle (Dev / Création /
  Marketing) distribuées dans les blocs thématiques, pas concentrées en
  bloc séparé.
- Chaque bloc thématique associe : une voix narrative principale + une
  intervention experte focalisée sur le différenciant produit.

### Table de maillage parcours → voix → expert

| Bloc | Durée | Parcours utilisateur | Voix principale | Intervention experte (1-2 min) |
|------|-------|----------------------|-----------------|--------------------------------|
| 1 | 3 min | Hook — accroche + problème | Pitch (rôle Marketing) | **Marketing** : étude de marché (5 sources, gap FR) |
| 2 | 5 min | Avant brassage — préparation | Narration UX (rôle Création) | **Création** : 3 personas + charte graphique |
| 3 | 7 min | Pendant brassage — exécution | Démo live | **Dev** : architecture monorepo + CI + 97 tests |
| 4 | 5 min | Après brassage — valorisation | Narration produit | **Création / Marketing** : Academy, communauté |
| 5 | 4 min | Business Model + Perspectives | Pitch clôture | **Marketing** : BMC + GTM ; mention R&D beer-label-ai |
| 6 | 1 min | Conclusion | Pitch unifié | — |

Total narratif ~25 min, marges pour Q&A ~5 min (à ajuster selon durée
officielle confirmée).

### A1 — USP démontrable en live (figé 2026-04-16)

- **Scanner code-barre** = feature démontrée en live (audit
  [audit-features-mvp.md](audit-features-mvp.md) #10 ✅, fallback photo
  intégré).
- **beer-label-ai** = slide Perspectives uniquement, 1 phrase. Pas de
  vidéo backup à tourner, pas de démo live. Économie Sprint 5 estimée
  5-15h de dev.

## Blocs détaillés

### Bloc 1 — Hook + Problème (3 min)

**Objectif** : capter le jury en 30 secondes, poser le problème et la
cible.

- Accroche : *[à rédiger en T3 — accroche % de brasseurs frustrés]*
- Problème : gestion dispersée recettes / calculs techniques complexes /
  absence communauté FR / vieillissement marché (source :
  [target_audience.md](../../design/01_target-audience/target_audience.md)).
- Cible primaire : brasseurs FR 30-50 ans, 2-10 ans d'expérience.
- **Transition** : "Voyons comment on accompagne ce brasseur sur son
  parcours, de la première idée de recette à la valorisation du brassin".

*Critère visé* : Elevator Pitch (#522, 15 pts) + contexte BM (#524).

### Bloc 2 — Avant brassage (5 min)

**Parcours** : utilisateur prépare son brassin.

- Découverte : Academy (tutoriels), Ingredient Library (beer-encyclopedia).
- Planification : création / duplication de recette, calculs ABV/IBU.
- **Intervention Création** (1-2 min) : comment les 3 personas (Nicolas
  débutant / Claire créative / Marc expert) ont guidé la conception des
  3 niveaux d'accompagnement. Charte graphique et design system.
- **SMART rétro cité** : #15 (3 personas documentés) et #25 (étude marché).

*Critère visé* : BM + innovation (#524, 30 pts) + Slide deck (#527).

### Bloc 3 — Pendant brassage (Démo live, 7 min)

**Parcours** : utilisateur brasse, l'appli assiste.

- Démo live sur téléphone mobile (projection miroir).
- Séquence détaillée dans [audit-features-mvp.md](audit-features-mvp.md)
  § Parcours démo recommandé :
  1. Auth (30 s)
  2. Recettes list + detail (1 min)
  3. Scanner code-barre sur une bière réelle (1:30)
  4. Calculateur ABV (45 s)
  5. Timeline Batch (15 s)
  6. Marge + transition (2 min)
- **Intervention Dev** (1-2 min) : monorepo npm workspaces, CI
  path-filtered, 97 tests automatisés, stack NestJS + React Native Expo +
  FastAPI + PostgreSQL.
- **SMART rétro cité** : #2 (8/11 features stables), #3 (≥ 95 tests), #4 (CI).

*Critère visé* : Démo live (#525, 30 pts) + BM innovation (#524).

### Bloc 4 — Après brassage (5 min)

**Parcours** : utilisateur valorise et partage.

- Labels personnalisés (impression étiquettes).
- Batches : historique, mesures, transmission.
- Communauté / Academy (Perspectives short-term).
- **Intervention Création / Marketing** (1-2 min) : la dimension
  communautaire différencie Brasse-Bouillon de Brewfather (anglophone,
  centré outil) et Little Bock (FR mais communauté limitée).
- **SMART rétro cité** : #28 (4 canaux identifiés).

*Critère visé* : BM + innovation (#524, 30 pts) + Perspectives (#526).

### Bloc 5 — Business Model + Perspectives (4 min)

- **BM Canvas synthétisé** (9 blocs → 3 slides resserrées) — cf.
  [business-model-canvas.md](business-model-canvas.md) (T2 à livrer)
- Monétisation (freemium + partenariats LHBS) — *[trou factuel : modèle
  précis à caler]*
- **Perspectives structurées** (critère #526 : légal / RH / GTM / budget) :
  - Légal : conformité RGPD, pen test OWASP (SMART #10).
  - RH : recrutement référent Marketing (SMART #31), onboarding
    contributeurs open-source (SMART #12).
  - GTM : 3 canaux × 3 personas, 3 partenariats LHBS, 1 000
    pré-inscriptions (SMART #32-34).
  - Budget : infra prod (SMART #11), 3 dossiers financement (SMART #36).
- **beer-label-ai** : 1 phrase R&D ("pipeline ML YOLOv8 + OCR opérationnel
  en laboratoire, objectif reconnaissance automatique d'étiquettes
  déployable courant 2027").

*Critère visé* : BM (#524, 30 pts) + Perspectives (#526, 20 pts).

### Bloc 6 — Conclusion (1 min)

- Rappel proposition de valeur en 1 phrase.
- Appel à l'action : lien landing page / repo / démo privée.
- Remerciements équipe + jury.

*Critère visé* : Slide deck (#527, 15 pts).

## Après les 20-25 min — Q&A

- **Matière disponible** : les 30 SMART extended + 6 trous factuels
  documentés + BMC 9 blocs.
- **Anticipations** de questions sensibles :
  - "Quel chiffre d'affaires visé année 1 ?" → freemium + partenariats,
    reposer sur [trou factuel budget] à combler en T2.
  - "Différenciant vs Brewfather / Little Bock ?" → Communauté FR +
    simplicité évolutive + Academy intégrée.
  - "Pourquoi pas de marketplace dans le MVP ?" → KISS + YAGNI, cf.
    [vision.md § Exclusions](../../vision/vision.md).
  - "Quel niveau d'utilisateurs à 6 mois ?" → SMART #34 (1 000
    pré-inscriptions) + 1 000 actifs en 6 mois post-launch
    ([vision.md § Indicateurs de Succès](../../vision/vision.md)).

## Ce qui est figé (ne plus re-discuter sans raison forte)

- **A0** : découpage hybride parcours + experts (voir § Principes).
- **A1** : scanner code-barre = démo live, beer-label-ai = R&D slide
  uniquement.
- **Parcours démo** : Auth → Recettes → Scanner → Calculateur → Batch.
  Cohérent avec [audit-features-mvp.md](audit-features-mvp.md) verdict.
- **Core 6 SMART pour slide pitch** : #2, #8, #15, #20, #25, #34 (voir
  [smart-objectives-par-pole.md](smart-objectives-par-pole.md) § Synthèse
  pitch).

## Tâches restantes ordonnées (post 2026-04-16)

| Ordre | Tâche | Output |
|-------|-------|--------|
| T2 | Business Model Canvas 9 blocs | `outputs/business-model-canvas.md` |
| T3 | Accroche pitch (15 mots max) | intégrée dans ce plan Bloc 1 |
| T4 | Valider / actualiser les 3 personas (3e persona "Marc" existe déjà) | `docs/personas/user_personas.md` |
| T6 | Script détaillé démo live (timings seconde par seconde) | annexe de ce plan |
| T12 | Répétitions chronométrées (J-7, J-3, J-1) | checklist `audit-features-mvp.md` § Pré-production |
| T14 | Dépôt Moodle (slides + PDF + vidéo backup démo) | dossier de dépôt |

## Révisions

- **2026-04-15** — Session Q&A initiale : décisions D1-D10, revues
  R1-R6. Voir
  [debrief/2026-04-15_session-decisions.md](../debrief/2026-04-15_session-decisions.md)
  (placeholder).
- **2026-04-16** — A0 (hybride), A1 (KISS scanner), audit features
  re-produit, méthode SMART repo-sourced. Voir
  [debrief/2026-04-16_session-decisions.md](../debrief/2026-04-16_session-decisions.md).

## Trous factuels à combler

Synthèse des `[trou factuel]` relevés dans ce plan et ailleurs :

1. Durée officielle présentation vs Q&A (20 + 10 ? 15 + 15 ?)
2. Sondage interne "63,3 % / 54 répondants" — retrouver ou refaire
3. Landing page live — existence et URL
4. Tagline canonique Brasse-Bouillon — emplacement
5. Statut recrutement pôle marketing
6. Niveau accessibilité actuel (WCAG)
7. Décompte exact wireframes livrés
8. Modèle de monétisation précis (freemium/prix/CA)
