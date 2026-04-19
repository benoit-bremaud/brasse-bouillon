# Business Model Canvas — Brasse-Bouillon

**Finalité** : matière pour le bloc 5 (BM + Perspectives) du plan
soutenance et pour le critère d'évaluation #524 (BM + innovation,
30 pts). Version synthétique = 3 slides ; version détaillée = ce
document (Q&A + annexes).

**Sources** : chaque bloc cite ses sources repo. Les hypothèses non
sourcées sont marquées `[hypothèse — à valider]` et remontées en trous
factuels dans
[../debrief/2026-04-16_session-decisions.md](../debrief/2026-04-16_session-decisions.md).

## Synthèse en une phrase

> Brasse-Bouillon est une application mobile française qui accompagne
> les brasseurs amateurs (débutants à experts) dans tout leur parcours,
> depuis la conception de la recette jusqu'au partage communautaire,
> via un outil progressif, monétisé par un modèle freemium et des
> partenariats avec les magasins spécialisés francophones.

## Tableau 9 blocs

| Bloc | Contenu | Sources |
|------|---------|---------|
| **1. Segments clients** | Brasseurs amateurs francophones, 30-50 ans, 2-10 ans d'expérience, 3 profils types (Nicolas / Claire / Marc) | [user_personas.md](../../personas/user_personas.md), [target_audience.md](../../design/01_target-audience/target_audience.md) § Cible primaire |
| **2. Proposition de valeur** | Simplifier le brassage artisanal FR via un outil intuitif + communautaire + progressif (débutants → experts) | [vision.md](../../vision/vision.md) § Objectifs |
| **3. Canaux** | 4 canaux priorisés : magasins LHBS, YouTubers FR, Reddit/FB communautés, salons CRAB/Saint-Malo | [target_audience.md](../../design/01_target-audience/target_audience.md) § Canaux d'acquisition |
| **4. Relations clients** | Self-service via l'app + Academy intégrée + communauté (partage recettes, commentaires) | [vision.md](../../vision/vision.md) § Périmètre MVP — Espace Communautaire |
| **5. Revenus** | Freemium (fonctions avancées payantes) + partenariats magasins (commissions futures) | [vision.md](../../vision/vision.md) § Pour les fournisseurs ; *[hypothèse — prix exact et seuil freemium à caler]* |
| **6. Ressources clés** | Équipe 3 pôles (Dev / Création / Marketing), stack monorepo 4 packages, base ingrédients PostgreSQL | [CLAUDE.md](../../../CLAUDE.md) § Monorepo Structure |
| **7. Activités clés** | Développement produit, curation base ingrédients, modération communauté, production Academy | [audit-features-mvp.md](audit-features-mvp.md) + [PROJECT_LOG.md](../../../PROJECT_LOG.md) |
| **8. Partenaires** | Magasins LHBS (3 ciblés), brasseries artisanales locales, écoles de brassage, incubateurs | [target_audience.md](../../design/01_target-audience/target_audience.md) § Partenariats ; *[hypothèse — partenariats à formaliser, cf. SMART #33]* |
| **9. Structure de coûts** | Infrastructure (PG managé + hosting API + CDN), temps équipe, marketing acquisition, outils dev (SonarQube VM) | [infrastructure.md](../../architecture/infrastructure.md), [PROJECT_LOG.md](../../../PROJECT_LOG.md) § SonarQube Klouders |

## Narratif par bloc

### 1. Segments clients

Trois personas couvrent la cible (voir
[user_personas.md](../../personas/user_personas.md)) :

- **Nicolas (débutant, 30-35 ans, urbain)** — cherche un guidage pas à
  pas pour réussir son premier brassin.
- **Claire (amatrice créative, 35-45 ans)** — veut tester, personnaliser,
  partager ses créations.
- **Marc (expert, 45+ ans)** — vise régularité, métriques, intégration
  matériel (CSV / API / IoT à terme).

Cible primaire recommandée par la recherche : brasseurs FR 30-50 ans,
2-10 ans d'expérience, adopteurs d'applications mobiles
([target_audience.md](../../design/01_target-audience/target_audience.md)
§ Cible primaire). Marché adressable : France + francophonie Europe ;
benchmark marché FR CAGR 8,5 % (2026-2033) selon sources sectorielles
citées dans le même document.

### 2. Proposition de valeur

Unique value proposition en 3 angles :

- **Simplicité évolutive** : une interface qui s'adapte du débutant à
  l'expert (vs Brewfather, trop technique d'entrée ; vs Little Bock,
  moins moderne).
- **Ancrage francophone** : UI FR native, cohérence culturelle,
  intégration marché FR (LHBS, brasseries artisanales) — gap
  technologique documenté dans
  [target_audience.md](../../design/01_target-audience/target_audience.md)
  § Opportunités.
- **Parcours complet** : du calcul de recette à la valorisation du
  brassin (labels, communauté, Academy) — vs outils single-purpose.

### 3. Canaux

Ordre de priorité basé sur
[target_audience.md](../../design/01_target-audience/target_audience.md)
§ Canaux d'acquisition :

1. **Magasins spécialisés (LHBS)** — référencement terrain auprès du
   moment d'achat (acquisition qualifiée).
2. **YouTubers FR brassicoles** — éducation + démonstration, format
   préféré des < 40 ans.
3. **Communautés Reddit / Facebook FR** — ancrage organique, retours
   terrains.
4. **Salons (CRAB Rennes, Saint-Malo Beer Expo)** — visibilité
   événementielle + B2B avec partenaires potentiels.

Complément Academy / SEO blog : pilier d'acquisition organique à
construire (SMART prospectif #35).

### 4. Relations clients

- **Self-service app** : installation + usage sans interaction humaine.
- **Academy intégrée** : contenus éducatifs qui créent de la
  rétention + acquisition organique (SEO).
- **Communauté** : recettes partagées, notes, commentaires
  ([vision.md](../../vision/vision.md) § Fonctionnalités incluses §4).
- **Support** : par formulaire + communauté peer-to-peer ; support
  direct réservé au tier payant *[hypothèse — modèle support à préciser]*.

### 5. Revenus

Modèle hybride à deux pieds :

- **Freemium** : app gratuite avec fonctionnalités de base (création
  recettes, calculateurs, scanner, Academy). Tier payant (nom et prix
  à définir) pour : CSV export, intégration IoT, historiques avancés,
  templates premium. *[hypothèse — grille tarifaire à formaliser]*
- **Partenariats** : commissions sur ventes LHBS via marketplace
  intégrée (évolution post-MVP, cf.
  [vision.md](../../vision/vision.md) § Exclusions).

Trou factuel : modèle de revenu précis + CA année 1 + seuil break-even.
Voir SMART #36 (3 dossiers financement) pour plan de trésorerie
transitoire.

### 6. Ressources clés

- **Équipe 3 pôles** : Développement (mobile + API + beer-encyclopedia),
  Création (UX/UI/Design), Marketing. Organisation Scrum documentée
  ([docs/project-management/](../../project-management/)).
- **Stack technique** : monorepo npm workspaces 4 packages (voir
  [CLAUDE.md](../../../CLAUDE.md)), NestJS 11 + TypeORM + SQLite côté
  API, React Native Expo SDK 54 côté mobile, FastAPI + PostgreSQL +
  SQLAlchemy + Alembic côté beer-encyclopedia, YOLOv8 + EasyOCR côté
  R&D.
- **Base ingrédients** : 15 styles seedés + modèle 10 tables avec
  fuzzy search pg_trgm
  ([PROJECT_LOG.md](../../../PROJECT_LOG.md) entrée #544).
- **Qualité** : 97 tests automatisés, CI GitHub Actions, SonarQube
  Klouders (en cours de déploiement).

### 7. Activités clés

- **Développement produit** : 6 sprints planifiés (S1–S6), MVP livré
  en 5 mois.
- **Curation contenu** : base ingrédients (styles, houblons, malts,
  levures), Academy (tutoriels progressifs).
- **Modération communauté** : gestion des contributions et
  corrections via le modèle `CommunityCorrection`
  ([PROJECT_LOG.md](../../../PROJECT_LOG.md) entrée #544).
- **Acquisition / Marketing** : animation canaux, partenariats,
  événements.

### 8. Partenaires

- **Magasins LHBS** — 3 cibles prioritaires (SMART #33) ;
  co-référencement, accès communauté fidèle, promotion croisée.
- **Brasseries artisanales FR** — contenus Academy co-signés, mise en
  avant recettes commerciales.
- **Écoles / formations brassage** — diffusion de l'outil comme support
  pédagogique.
- **Incubateurs French Tech + BPI** — financement et mentoring (SMART
  #36).
- **Fournisseurs infra** : hébergeur PostgreSQL managé (Scaleway /
  OVHcloud — *[hypothèse — choix à arbitrer]*).

### 9. Structure de coûts

- **Infrastructure** : PostgreSQL managé + hosting API + CDN front +
  stockage images étiquettes + SonarQube VM Klouders. Estimation :
  *[à chiffrer — dépend du volume]*.
- **Temps équipe** : 3 pôles, capacité sprint ~29-41 SP
  ([docs/product-backlog/product-backlog.md](../../product-backlog/product-backlog.md)
  § Sprint Plan).
- **Marketing / acquisition** : partenariats LHBS (gratuit initial),
  YouTubers sponsorisés, salons (stand + frais). *[à chiffrer dans
  dossier financement]*.
- **Outils** : licences design (Figma, Adobe), domaine +
  certificats, Apple Developer + Google Play. Estimation annuelle
  typique à chiffrer.

## Différenciation vs concurrence

Table synthétique exploitable en slide ou en Q&A :

| Critère | Brewfather (leader intl) | Little Bock (leader FR) | Brasse-Bouillon |
|---------|--------------------------|-------------------------|-----------------|
| Langue UI | EN | FR | FR native |
| Simplicité débutant | Faible (interface technique) | Moyenne | Haute (3 niveaux) |
| Communauté intégrée | Limitée | Moyenne | Centrale |
| Academy / éducation | Absente dans l'app | Blog séparé | Intégrée |
| Scanner code-barre | Non | Non | Oui (USP) |
| Open-source / transparence | Non | Non | Oui (potentiel) |
| Ancrage marché FR (LHBS) | Non | Partiel | Cible primaire |

## Innovation — axes à mettre en avant (#524)

- **Scanner code-barre intégré** (audit feature ✅ stable) — pont entre
  bière commerciale et expérimentation amateur.
- **R&D beer-label-ai** (YOLOv8 + OCR + 10 tables encyclopédie) —
  perspective moyen terme pour reconnaissance automatique d'étiquettes.
- **Architecture monorepo + CI path-filtered** — scalabilité et
  industrialisation (critère technique).
- **Approche open-source / francophone** — différenciation durable vs
  concurrents propriétaires anglophones.

## Trous factuels spécifiques BMC

À consolider dans
[../debrief/2026-04-16_session-decisions.md](../debrief/2026-04-16_session-decisions.md) :

1. Grille tarifaire freemium (seuils, prix, premium features exactes).
2. Estimation CA année 1 / break-even.
3. Choix hébergeur / coût infra mensuel estimé.
4. Liste formalisée des 3 partenaires LHBS cibles.
5. Modèle de support client (peer-to-peer seul ou payant ?).
