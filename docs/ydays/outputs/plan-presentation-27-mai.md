# Plan de la soutenance Ydays — 2026-05-27 (30 + 10 min)

## Finalité

Soutenance finale "Pitch Entrepreneurial" Ydays Ynov. Jury composite,
évaluation sur 7 critères (issues #522–#528) — **3 grilles d'évaluation
officielles Ynov** à récupérer auprès du coach (mentionnées en pièce
jointe de l'email Ynov 2026-04-19, non encore stockées dans le repo).

**Format officiel (confirmé par email Ynov 2026-04-19)** :

- **Présentation : 30 minutes pleines**
- **Questions / Réponses : 10 minutes**
- **Total : 40 minutes**
- **Salle : 0.301** (R+3, campus Ynov)
- **Catégorie : Pitch Entrepreneurial**
- Support à déposer sur Moodle **après le passage à l'oral**

**Dernière séance Ydays avant la soutenance : 2026-05-06** — oraux blancs
organisés par les coachs sur demande. **Réserver un créneau d'oral blanc
est une priorité haute** (feedback ultime avant J-21).

## Principes directeurs

### A0 — Découpage hybride parcours + experts (figé 2026-04-16)

- **Trame macro** = parcours utilisateur **Avant / Pendant / Après
  brassage** + Business Model + Perspectives + Démo live.
- **Interventions expertes 1-2 min** ancrées par pôle (Dev / Création /
  Marketing) distribuées dans les blocs thématiques, pas concentrées en
  bloc séparé.
- Chaque bloc thématique associe : une voix narrative principale + une
  intervention experte focalisée sur le différenciant produit.

### Table de maillage parcours → voix → expert (révisé 2026-04-21 pour aligner sur la consigne coach "5 min démo")

| Bloc | Durée | Parcours utilisateur | Voix principale | Intervention experte (1-2 min) |
|------|-------|----------------------|-----------------|--------------------------------|
| 1 | 5 min | Hook — accroche + problème + cible | Pitch (rôle Marketing) | **Marketing** : étude de marché (5 sources, gap FR) |
| 2 | 6 min | Avant brassage — préparation | Narration UX (rôle Création) | **Création** : 3 personas + design system |
| 3 | 5 min | Pendant brassage — **démo live (5 min)** | Démo live | **Dev** : architecture monorepo + CI + 97 tests (inclus dans les 5 min) |
| 4 | 5 min | Après brassage — valorisation | Narration produit | **Création** : Academy, communauté, labels |
| 5 | 7 min | Business Model + Perspectives + vision agence | Pitch clôture | **Marketing** : BMC + GTM + pivot web-studio |
| 6 | 1 min | Conclusion + CTA | Pitch unifié | — |
| Marge | 1 min | Tampon chronométrage | — | — |

Total narratif 30 min pile. **Changement vs version précédente** : bloc 3
passe de 8 à 5 min (consigne coach 2026-03-25, cf.
[../references/2026-03-25_coach-session-summary.md](../references/2026-03-25_coach-session-summary.md)) ;
3 min redistribuées → +1 bloc 1 (accroche renforcée), +1 bloc 5 (perspectives
= 20 pts de la grille), +1 marge flottante. **Q&A 10 min** à part, pas imputé
sur les 30 min.

**Alignement grille** : Pitch (15 pts) = bloc 1 (5 min). Production (30 pts)
= blocs 2+3+4 (16 min). Perspective (20 pts) = bloc 5 (7 min). Qualité orale
(15 pts) = transversal. Voir
[../references/grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md).

### A1 — USP démontrable en live (figé 2026-04-16)

- **Scanner code-barre** = feature démontrée en live (audit
  [audit-features-mvp.md](audit-features-mvp.md) #10 ✅, fallback photo
  intégré).
- **beer-label-ai** = slide Perspectives uniquement, 1 phrase. Pas de
  vidéo backup à tourner, pas de démo live. Économie Sprint 5 estimée
  5-15h de dev.

## Blocs détaillés

### Bloc 1 — Hook + Problème + cible (5 min)

**Objectif** : capter le jury en 30 secondes, poser le problème et la
cible. Budget étendu de 4 à 5 min pour laisser place à une accroche
aboutie (feedback coach 2026-03-25 : "accroche plus aboutie que première
soutenance").

- Accroche : 5 variantes rédigées dans
  [pitch-hook-variants.md](pitch-hook-variants.md), V4 storytelling
  recommandée (arbitrage avant 2026-04-23).
- Saynète d'ouverture V1 chronométrée ≤ 2:30 min
  ([pitch-hook-saynete-v1.md](pitch-hook-saynete-v1.md)) suivie de 2:30
  cadrage marché + proposition de valeur + annonce SMART.
- Problème : gestion dispersée recettes / calculs techniques complexes /
  absence communauté FR / vieillissement marché (source :
  [target_audience.md](../../design/01_target-audience/target_audience.md)).
- Cible primaire : brasseurs FR 30-50 ans, 2-10 ans d'expérience.
- **Transition** : "Voyons comment on accompagne ce brasseur sur son
  parcours, de la première idée de recette à la valorisation du brassin".

*Catégorie grille* : **Pitch (15 pts)** — accroche + raison d'être + PV + SMART.

### Bloc 2 — Avant brassage (6 min)

**Parcours** : utilisateur prépare son brassin.

- Découverte : Academy (tutoriels), Ingredient Library (beer-encyclopedia).
- Planification : création / duplication de recette, calculs ABV/IBU.
- **Intervention Création** (1-2 min) : comment les 3 personas (Nicolas
  débutant / Claire créative / Marc expert) ont guidé la conception des
  3 niveaux d'accompagnement. Charte graphique et design system.
- **SMART rétro cité** : #15 (3 personas documentés) et #25 (étude marché).

*Critère visé* : BM + innovation (#524, 30 pts) + Slide deck (#527).

### Bloc 3 — Pendant brassage (Démo live, 5 min)

**Parcours** : utilisateur brasse, l'appli assiste. **Durée révisée de 8
à 5 min** pour respecter la consigne coach (2026-03-25 : "5 min
réservées à la démo finale"). Le parcours démo est comprimé et
l'intervention Dev est diluée **dans** la démo (pas en segment séparé).

- Démo live sur téléphone mobile (projection miroir). Séquence comprimée
  (voir [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md)
  pour le script seconde-par-seconde à mettre à jour pour 5 min) :
  1. Auth éclair + recette ouverte d'avance (30 s)
  2. Scanner code-barre sur 2 bières réelles (1:30)
  3. Calculateur ABV live (45 s)
  4. Timeline Batch + preuves archi (1:00) — slides backup en incrustation
     (monorepo, CI path-filtered, 97 tests, stack NestJS / RN-Expo / FastAPI)
  5. Transition vers bloc 4 (15 s)
  **Total : 4:00 démo + 1:00 commentaire = 5:00 strict.**
- L'intervention Dev (architecture + tests) est **affichée en slide
  pendant la démo** plutôt qu'en bloc séparé — évite d'empiéter sur les
  5 min.
- **Vidéo backup obligatoire** (risque D1) : 3 min encodée 1080p à
  tourner avant 2026-05-20. Voir
  [risk-analysis.md](risk-analysis.md) §D1.
- **SMART rétro cité** : #2 (8/11 features stables), #3 (≥ 95 tests), #4 (CI).

*Catégorie grille* : **Production (30 pts)** — démo + innovation technique.

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

### Bloc 5 — Business Model + Perspectives + vision agence web-studio (6 min)

- **BM Canvas synthétisé** (9 blocs → 3 slides resserrées) — cf.
  [business-model-canvas.md](business-model-canvas.md).
- Monétisation (freemium + partenariats LHBS) — *[trou factuel :
  workshop monétisation dédié à programmer pour caler prix/CA]*.

- **Perspectives structurées** (critère #526 : légal / RH / GTM / budget) :
  - **Légal** : conformité RGPD, pen test OWASP (SMART #10).
  - **RH** : **pas de recrutement externe — je crée mon propre studio
    web pour porter BB**. Narration pivot (décision 2026-04-19, cf.
    [web-studio-brainstorming.md](web-studio-brainstorming.md)) :

    > "Pendant les Ydays, nous avons dû bâtir Brasse-Bouillon sans
    > pouvoir faire correctement l'étude de marché et le marketing
    > demandés. Pour donner à BB ses vraies chances, je lance après
    > la soutenance mon studio web : **artisan tech solo + méthode
    > IA-driven**, livraison en 2-3 semaines, cible **TPE food et
    > boissons Alpes-Maritimes** (boulangers, brasseurs, cavistes,
    > traiteurs), grille plancher affichée (1,5–3 k€ vitrine,
    > 2–4 k€ blog, 4–8 k€ e-commerce). Le revenu finance mes outils
    > d'IA pour accélérer ; le temps ainsi dégagé va au
    > développement sérieux de BB — vraie étude marché, vrai
    > marketing, itérations produit. An 1 en micro-entreprise,
    > objectif amorçage < 10 k€, un premier prospect identifié."

    SMART associé (remplace #31) — variante B retenue par défaut :
    livrer 3 sites clients (dont 2 vitrines food/boissons) avant
    le 2026-11-30 pour CA ≥ 6 000 € + site studio publié.
    Justification statut micro-entreprise via matrice de comparaison
    (micro / EURL / SASU) détaillée dans
    [web-studio-brainstorming.md](web-studio-brainstorming.md).

  - **GTM** : 3 canaux × 3 personas BB, 3 partenariats LHBS,
    1 000 pré-inscriptions (SMART #32-34). Studio en acquisition
    progressive : bouche-à-oreille + content gratuit (blog +
    LinkedIn), budget marketing uniquement si traction.

  - **Budget** : infra prod BB (SMART #11), studio auto-financé,
    3 dossiers financement envisagés si la traction le justifie
    (SMART #36).

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
- **2026-04-19** — Format officiel Ynov confirmé (30+10 min, salle
  0.301). Trou factuel #1 résolu. Durées des 6 blocs étendues pour
  occuper les 30 min pleines. Pivot Perspectives RH #5 : pas de
  recrutement Marketing — nouvelle orientation vision agence
  web-studio (voir repo `web-studio`), à brainstormer.
- **2026-04-21** — Archivage grille Ynov officielle
  ([references/grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md))
  + résumé coach 2026-03-25
  ([references/2026-03-25_coach-session-summary.md](../references/2026-03-25_coach-session-summary.md)).
  Grille réelle = **80 pts / 4 catégories** (Pitch 15 / Production 30 /
  Perspective 20 / Qualité orale 15 + coup de cœur +1), pas le mapping
  fictif #522–#528 qui traçait des livrables GitHub internes. **Bloc 3
  démo comprimé de 8 à 5 min** (consigne coach "5 min réservées à la
  démo finale") — 3 min redistribuées : +1 bloc 1 (5 min), +1 bloc 5
  (7 min), +1 marge flottante. Trous factuels #9 et #10 partiellement
  levés (grille récupérée ; oral blanc 06/05 toujours à réserver).

## Trous factuels à combler

Synthèse des `[trou factuel]` relevés dans ce plan et ailleurs :

1. ~~Durée officielle présentation vs Q&A~~ → **résolu 2026-04-19 :
   30 min pitch + 10 min Q&A = 40 min total.**
2. Sondage interne "63,3 % / 54 répondants" — user dispose de la source
   (Google Drive / Slack), à persister dans le repo.
3. Landing page live — concept à clarifier avec le user
   *[à discuter]*.
4. Tagline canonique Brasse-Bouillon — emplacement.
5. ~~Statut recrutement pôle marketing~~ → **pivot 2026-04-19 :
   pas de recrutement, remplacé par pitch de vision personnelle
   "ouverture d'une agence web-studio" — à brainstormer dans une
   session dédiée.**
6. Niveau accessibilité actuel (WCAG).
7. Décompte exact wireframes livrés.
8. Modèle de monétisation précis (freemium/prix/CA).
9. ~~Récupérer les 3 grilles d'évaluation officielles Ynov~~ →
   **partiellement résolu 2026-04-21** : grille Pitch Entrepreneurial
   archivée ([grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md)).
   Les 2 autres grilles mentionnées dans l'email coach 2026-04-19
   restent à récupérer (jury pluridisciplinaire — grilles
   complémentaires possibles).
10. **Nouveau** : réserver un créneau d'oral blanc auprès du coach
    pour la séance Ydays du 2026-05-06.
