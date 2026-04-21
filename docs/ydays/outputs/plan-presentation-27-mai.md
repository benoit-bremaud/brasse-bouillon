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

**Structure finalisée 2026-04-21 (décision Path B + format live) :**

- **Saynète V1-cut live 2 voix** (~1:50 min, ~240 mots) —
  [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md). P1 + P2
  joués par deux membres de l'équipe Ydays (8 personnes — binôme à
  identifier). Parcours : `scan → recette équivalente → ajustement
  volume 20 L → 8 L → "Je commence quand ?"`. **Pas de mention boutique
  ni ratio prix** (features non construites, coupées pour sécuriser).
- **Cadrage marché + founder-fit + annonce plan** (~1:40 min) — Benoît
  face jury enchaîne directement après la saynète : chiffres 10 M
  Français / 1,5 Md€ marché européen, positionnement vs Brewfather et
  Little Bock, annonce des 3 points à venir (livré / différenciateur /
  modèle + perspectives).
- **Annonce SMART implicite** (~30 s, incluse dans le cadrage) :
  SMART #2 (8/11 features stables), #3 (97 tests automatisés), #25
  (étude marché 5 sources).
- **Marge + silence théâtral** (~1:00) : pause 5-10 s après la punchline
  P1, respiration naturelle du cadrage, transition sereine vers bloc 2.
- **Transition** : *"Voyons comment on accompagne ce brasseur sur son
  parcours, de la première idée de recette à la valorisation du
  brassin — commençons par l'avant brassage."*

**Variantes accroche ≤ 15 mots ABANDONNÉES** : le fichier
[pitch-hook-variants.md](pitch-hook-variants.md) (V1–V5) servait
d'alternative courte à la saynète. La saynète étant retenue comme
accroche principale, les variantes ne sont plus utilisées — conservées
en repli si le format saynète tombe en dernière minute (fallback
extrême, non prévu).

*Catégorie grille* : **Pitch (15 pts)** — accroche percutante + raison
d'être (founder-fit dans le cadrage) + PV (la saynète la démontre) +
SMART (annoncés dans le cadrage).

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

### Bloc 5 — Business Model + Perspectives + vision agence web-studio (7 min)

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

- Tagline canonique figée (2026-04-21) : **"Brasser. Partager. Recommencer."**
- Triple CTA : QR code → `brasse-bouillon.com/jury`, APK Android direct,
  cartes de visite distribuées après le pitch.
- 4e canal conditionnel : tabliers floqués portés par les membres de
  l'équipe Ydays (logo + QR) — à confirmer selon Fablab Grasse et budget.
  Voir [tabliers-floques-specs.md](tabliers-floques-specs.md) + issue #559.
- Remerciements équipe (8 personnes) + jury.

*Critère visé* : Pitch (15 pts) — clôture percutante + coup de cœur (+1).

## Après les 30 min — Q&A

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

## Tâches restantes ordonnées (mis à jour 2026-04-21)

| Ordre | Tâche | Statut | Output |
|-------|-------|--------|--------|
| T2 | Business Model Canvas 9 blocs | ✅ livré | `outputs/business-model-canvas.md` |
| T3 | Accroche pitch (saynète V1-cut) | ✅ livré | `outputs/pitch-hook-saynete-v1-cut.md` |
| T4 | Valider / actualiser les 3 personas | 🟡 user | `docs/personas/user_personas.md` |
| T6 | Script détaillé démo live 5 min (seconde par seconde) | ✅ livré | `outputs/pitch-script-bloc3-demo-live.md` |
| T7 | Étendre cadrage bloc 1 post-saynète à ~3:10 | 🔴 à faire | `outputs/pitch-script-bloc1-cadrage.md` |
| T8 | Produire 6 slides Canva saynète (S1-S6) | 🔴 à faire | Canva — design system BB |
| T9 | Tourner vidéo backup démo 3 min (deadline 2026-05-20) | 🔴 à faire | issue #533 |
| T10 | Réserver oral blanc coach 2026-05-06 | 🔴 urgent | issue #536 |
| T11 | Identifier binôme P1/P2 saynète | 🔴 urgent | issue #560 |
| T12 | Répétitions chronométrées (J-21, J-7, J-3, J-1) | 🔴 à planifier | issue #528 |
| T14 | Dépôt Moodle (slides + PDF + vidéo backup) | 🔴 J-day | après soutenance |

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
  **Script bloc 3 réécrit pour 5 min** avec overlay S10 permanent
  (preuves techniques affichées pendant la démo, plus de segment Dev
  séparé).
- **2026-04-21 (suite 2)** — Trous factuels #2 et #3 levés :
  - **#2 sondage 63,3 %** : jamais mené, retiré de tous les supports
    (QA, slides outline, Canva S5). Le questionnaire communauté live
    sur [brasse-bouillon.com](https://brasse-bouillon.com) peut être
    diffusé avant l'oral blanc 2026-05-06 pour produire une base
    réelle.
  - **#3 landing page** : **brasse-bouillon.com** live via GitHub Pages
    (CNAME ok, newsletter + questionnaire actifs). SMART #34 reformulé
    sur la base réelle, CTA QR bloc 6 pointe sur `brasse-bouillon.com/jury`
    (à construire) ou redirect README. Domaine corrigé dans tous les
    fichiers (était `brasse-bouillon.fr`, maintenant `.com`).
- **2026-04-21 (suite 3)** — Relecture complète du plan : correction
  "Bloc 5 = 7 min" dans le titre du bloc (le corps et la table étaient
  déjà à 7 min) ; "Après les 20-25 min" → "Après les 30 min" ; bloc 6
  enrichi (tagline A figée, triple CTA + 4e canal tabliers) ; table
  "Tâches restantes" mise à jour (T2/T3/T6 ✅, T7-T14 avec statuts et
  références issues #533/536/560) ; trou factuel #10 marqué "en cours".
- **2026-04-21 (suite)** — Décision **Path B** sur la saynète bloc 1 :
  les mentions **boutique intégrée + ratio prix maison/commerce** sont
  retirées (features non construites, ~25 h dev avant 2026-05-03 jugés
  non-prioritaires vs la sécurisation du reste). Nouveau livrable
  [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) — 1:50
  min, ~240 mots, parcours resserré `scan → recette → ajustement volume
  → "Je commence quand ?"`. **Format retenu** : Option 3 live 2 voix
  jouée par deux membres de l'équipe Ydays (équipe = 8 personnes, binôme
  à identifier). La V1 complète est conservée pour historique mais
  n'est plus la version de travail. Variantes accroche ≤ 15 mots
  ([pitch-hook-variants.md](pitch-hook-variants.md)) abandonnées —
  la saynète V1-cut **est** l'accroche.

## Trous factuels à combler

Synthèse des `[trou factuel]` relevés dans ce plan et ailleurs :

1. ~~Durée officielle présentation vs Q&A~~ → **résolu 2026-04-19 :
   30 min pitch + 10 min Q&A = 40 min total.**
2. ~~Sondage interne "63,3 % / 54 répondants"~~ → **résolu 2026-04-21** :
   les chiffres n'étaient pas issus d'une enquête réelle, c'était des
   estimations. **Retirés du pitch** (QA, slides, deck outline). Le
   questionnaire communauté live sur
   [brasse-bouillon.com](https://brasse-bouillon.com) peut être diffusé
   avant l'oral blanc 2026-05-06 pour produire une base défendable si
   besoin.
3. ~~Landing page live~~ → **résolu 2026-04-21** : **brasse-bouillon.com**
   déployé via GitHub Pages, CNAME ok, formulaire newsletter +
   questionnaire communauté actifs. Source :
   [packages/website/README.md](../../../packages/website/README.md).
4. ~~Tagline canonique Brasse-Bouillon~~ → **résolu 2026-04-21** :
   A = "Brasser. Partager. Recommencer." Propagation CLAUDE.md /
   landing site à valider.
5. ~~Statut recrutement pôle marketing~~ → **pivot 2026-04-19 :
   pas de recrutement, remplacé par pitch de vision personnelle
   "ouverture d'une agence web-studio" — à brainstormer dans une
   session dédiée.**
6. Niveau accessibilité actuel (WCAG) — **non bloquant**, SMART #21
   prospectif suffit.
7. Décompte exact wireframes livrés — **non bloquant**, SMART #13
   sourcé sur repo actuel.
8. Modèle de monétisation précis (freemium/prix/CA) — à travailler en
   workshop dédié post-oral blanc.
9. ~~Récupérer les 3 grilles d'évaluation officielles Ynov~~ →
   **partiellement résolu 2026-04-21** : grille Pitch Entrepreneurial
   archivée ([grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md)).
   Les 2 autres grilles mentionnées dans l'email coach 2026-04-19
   restent à récupérer (jury pluridisciplinaire — grilles
   complémentaires possibles).
10. ~~Réserver un créneau d'oral blanc auprès du coach pour la séance
    Ydays du 2026-05-06~~ → **en cours** : issue #536 créée, action à
    mener cette semaine (J-46, délai court).
