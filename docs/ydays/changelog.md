# Changelog du site

Historique des évolutions de ce site VitePress de préparation de la
soutenance Ydays du 27 mai 2026. Les entrées sont en ordre
anti-chronologique (la plus récente en haut).

**Format retenu** : `YYYY.MM.DD-N` où `N` est le numéro de déploiement
du jour (ex. `2026.04.23-1` = premier déploiement du 23 avril 2026).

## 2026.04.30-4

**Atelier D Phase 5 modèle éco — Scénarios alternatifs (clôture Phase 5)**

Ajout de [scenarios-alternatifs](/outputs/scenarios-alternatifs) à la
section « Stratégie business approfondie » (10e document).

Ce document **clôture la Phase 5 du modèle économique** avec une
modélisation exhaustive de la robustesse du modèle :

- **3 scénarios chiffrés sur 5 ans** (conservateur / médian / agressif)
  avec OPEX, MRR, net mensuel par année. Médian atteint la cible
  « vivre de l'app » en Y3, conservateur survit avec l'agence web,
  agressif explose dès Y2.
- **4 stress tests** anticipés (Brewfather localise FR, pandémie,
  échec produit, régulation hostile) avec mitigations prédéfinies.
- **Risk matrix de 12 risques** structurée (probabilité × impact).
  2 risques critiques identifiés : R1 Brewfather FR + R9 burnout
  solo dev (le risque numéro 1 réel pour BB).
- **Triggers de bascule entre scénarios** : 5 indicateurs mensuels
  (téléchargements, conversion, mix Pro, activation, evangelist)
  permettent de savoir où on se trouve.
- **Plans B et C explicites** avec actions concrètes et coûts. Pas
  de « on verra ».

La Phase 5 du modèle économique est désormais complète :

- Atelier A — OPEX (vue d'ensemble dans `financial-projections`)
- Atelier B — CAPEX & financement (`capex-financement`)
- Atelier C — KPIs détaillés (`kpi-details`)
- Atelier D — Scénarios alternatifs (`scenarios-alternatifs`)

## 2026.04.30-3

**Atelier C Phase 5 modèle éco — KPIs détaillés (20 KPIs avec cibles + triggers)**

Ajout de [kpi-details](/outputs/kpi-details) à la section
« Stratégie business approfondie » (9e document de la section).

Ce document détaille **20 KPIs structurés en 4 catégories** (acquisition,
engagement, monétisation, rétention) pour transformer les hypothèses du
modèle économique en mesures actionnables :

- **6 KPIs d'acquisition** — téléchargements mensuels, CAC, activation
  rate, taux Marc-Switcher (KPI unique BB), effet evangelist, opt-in
  newsletter
- **5 KPIs d'engagement** — DAU/MAU, sessions/mois, recettes créées,
  scans/utilisateur (KPI unique BB), diversité styles BJCP
- **5 KPIs de monétisation** — MRR, ARPU, conversion Free→Paid, LTV
  pondéré, NRR (Net Revenue Retention)
- **4 KPIs de rétention** — churn mensuel, retention 12 mois, NPS,
  satisfaction AI assistant

Pour chaque KPI : définition précise, formule de calcul, source data,
fréquence de mesure, cibles Y1/Y2/Y3/Y5, seuil d'alerte, action
déclenchée si dérive.

**Bonus** :

- Système de feux tricolores (vert / jaune / rouge) avec triggers
  prédéfinis
- 5 triggers prioritaires documentés (téléchargements, conversion,
  churn, NPS, LTV/CAC ratio) avec actions correctives concrètes
- Stack analytics low-cost recommandée (~50-75 €/mo Année 1 :
  PostHog free + RevenueCat free + Tally + Google Sheets)
- Cadence de revue disciplinée : quotidien 5 min → hebdo 15 min →
  mensuel 1h → trimestriel 2-3h → annuel 1 jour

## 2026.04.30-2

**Atelier B Phase 5 modèle éco — CAPEX & financement (analyse approfondie)**

Ajout de [capex-financement](/outputs/capex-financement) à la section
« Stratégie business approfondie » (8e document de la section).

Ce document consolide tout l'Atelier B de la Phase 5 du modèle économique :

- **Forme juridique** — matrice comparative complète (Microentreprise, EURL,
  SASU, SARL) sur 4 catégories. Architecture D retenue (microentreprise
  unifiée Année 1-2 + bascule SASU dédiée à BB Année 3, déclenchée par CA
  cumulé ~70 K€).
- **Sécurité sociale et mutuelle d'entreprise** — confirmation que la
  microentreprise en parallèle de l'alternance ne fait perdre ni la Sécu ni
  la mutuelle d'entreprise (règle de pluralité d'activités CSS Art. L613-4).
- **Transition Microentreprise → SASU** — 5 étapes détaillées (préparation,
  création, transfert d'activité, activation, régime de croisière) avec
  coûts (~1-3 K€ + capital social bloqué) et risques.
- **Scénario « si l'alternance se termine »** — 4 sous-scénarios (BB pas
  rentable, BB activité principale, recherche CDI, CDI chez l'employeur)
  avec aides chômage applicables.
- **Cartographie complète de 12 aides publiques** — vue d'ensemble par
  phase (Microentreprise / Transition / SASU / Si alternance termine).
- **JEI (Jeune Entreprise Innovante) approfondi** — pièce maîtresse :
  conditions, R&D éligible, bénéfices détaillés (exo IS + exo charges
  sociales R&D + exo CET), estimation **45-50 K€ d'économies cumulées
  sur 7 ans**.
- **Bourse French Tech BPI + Garantie BPI Création** — 30 K€ subvention
  + effet levier prêt bancaire 50 K€ sans engager patrimoine perso. Combo
  Année 3 = ~80 K€ d'injection capital.
- **ACRE / NACRE / ARE / ARCE** — mentions concises avec montants et
  conditions.
- **Plan de financement consolidé** sur 5 ans avec total effet financier
  cumulé : **~150-200 K€** (subventions + économies fiscales + prêts à
  conditions favorables, sans dilution capital).

## 2026.04.30-1

**Section « Stratégie business approfondie » : 7 nouveaux livrables soutenance**

Ajout d'une section sidebar dédiée concrétisant le bloc 5 (BM + Perspectives)
du plan de soutenance avec des analyses chiffrées, sourcées et slide-ready.

- **Audit concurrence approfondi** ([competitive-deep-dive](/outputs/competitive-deep-dive))
  — analyse 7 concurrents (Brewfather, BeerSmith 4, Grainfather, BrewTarget,
  Brewer's Friend, Little Bock, Joliebulle) avec UX commentée, reviews,
  SWOT, matrices de positionnement, données financières publiques et
  tendances marché brassage maison FR 2024-2030. **5 trouvailles critiques**
  + **3 axes différenciants** extractibles directement en slides.
- **Personas & monétisation** ([personas-monetization](/outputs/personas-monetization))
  — 5 personas avec WTP, LTV, retention. Marc-Switcher identifié comme
  cible prioritaire (LTV 384 € + effet evangelist ×5-10).
- **Funnel & projection** ([funnel-projection](/outputs/funnel-projection))
  — modélisation 50K téléchargements → 1 000 payants sur 3 ans. Mix 75 %
  Premium / 25 % Pro. ARPU blendé 4,75 €/mo. 3 scénarios alternatifs.
- **Paliers tarifaires** ([pricing-tiers-definition](/outputs/pricing-tiers-definition))
  — Free / Premium 2,99 €/mo / Pro 5,99 €/mo. 4 leviers stratégiques
  (trial 30 jours Pro, lifetime 99 € × 100 places, migration -50 %, discount
  annuel 30 %). Anti-frustration documentée.
- **Leviers de rétention** ([retention-levers](/outputs/retention-levers))
  — 10 leviers analysés, top 5 retenus (onboarding, lock-in données, cycle
  brassage, communauté FR, IA personnalisation). Anti-patterns documentés.
- **Stratégie IA** ([ai-strategy](/outputs/ai-strategy))
  — Mistral AI en provider principal (FR souverain), Anthropic Claude en
  backup. Use cases par persona, économie unitaire (Pro reste rentable),
  roadmap d'intégration Phase 4-6.
- **Projections financières** ([financial-projections](/outputs/financial-projections))
  — OPEX 3,5K € → 36K €/an sur 5 ans. CAPEX initial faible (~1-2,5K €).
  Revenus cumulés Année 3 ~57 K€ → ~3 400 €/mois net (cible « vivre de
  l'app » atteinte). Break-even mois ~5-6. KPIs structurés en 4 catégories
  avec cibles annuelles.

Mise à jour du Business Model Canvas (bloc 5 Revenus) pour remplacer
l'hypothèse « prix exact et seuil freemium à caler » par les valeurs
concrètes désormais documentées.

## 2026.04.23-8

**Régénération des 4 candidats Canva avec brand kit appliqué (via MCP)**

Application opérationnelle du brand kit défini en v2026.04.23-7 sur les
candidats du deck de soutenance. Exécution via MCP Canva en parallèle :

- **Audit Canva courant** : 0 Brand Kit existant (à créer manuellement
  côté UI Canva par le user, ~10 min, voir
  [canva-brand-kit.md §1](../../design/canva-brand-kit.md)). 1 dossier
  projet `Brasse-Bouillon — Soutenance Ydays` confirmé. 5 anciens
  candidats trouvés (1 doublon vs les 4 attendus).
- **Archivage** des 5 anciens candidats pré-charte dans un sous-dossier
  Canva `_archived-2026-04-23-pre-charte` (MCP n'a pas de
  `delete-design`, le déplacement suffit).
- **Upload assets** dans Canva : `Yellow_Background.png` (pattern
  watermark V0, asset ID `MAHHuDRYjXw`) + mascotte chef-bière 512×512
  (asset ID `MAHHuNH-1BM`), tous deux servis depuis Cloudflare Pages.
- **Génération** des 4 nouveaux candidats via `generate-design` Canva
  (1 seul appel = 4 candidats retournés, design type `presentation`,
  length `balanced` = 15 slides). Brief incluant la palette HEX, les
  polices, le découpage S0-S14 et le ton soutenance.
- **Matérialisation** des 4 candidats en designs persistants
  (`DAHHuAoG5_A`, `DAHHuI2hqqo`, `DAHHuE30t8A`, `DAHHuGPXl-c`),
  rangés dans le dossier projet.
- **Commentaires** identiques courts et factuels postés sur chacun des
  4 nouveaux designs : explication du brand kit, deadline vote
  lundi 2026-05-04 23h59, lien vers la spec.
- **canva-working-deck.md** mis à jour avec les 4 nouvelles URLs +
  remplacement de l'encart `::: danger` (qui prétendait que la charte
  n'était pas appliquée) par un encart `::: tip` documentant la
  régénération brand-aligned du 2026-04-23.

**Correction asset path VitePress** : `Yellow_Background.png` était
initialement copié dans `.vitepress/public/` mais VitePress build
utilise `docs/ydays/public/` comme source statique → l'asset n'était
pas servi (404). Déplacé au bon endroit, redéployé, accessible.

**Hors scope cette session** :

- **Création du Brand Kit dans Canva UI** reste manuelle (MCP n'a pas
  de `create-brand-kit`). Voir [canva-brand-kit.md §1](../../design/canva-brand-kit.md).
- **Application slide par slide** des couleurs/polices au design
  vainqueur post-vote : se fait après matérialisation, manuellement
  (MCP n'a pas de `update-slide` / `set-color`).
- **Suppression définitive des 5 anciens candidats** : à faire
  manuellement depuis l'UI Canva si souhaité (sont juste archivés).

## 2026.04.23-7

**Refonte charte graphique alignée sur l'app V0 réelle**

Audit visuel de 10 screenshots représentatifs de l'app mobile V0
([public/screenshots/v0/](./public/screenshots/v0/) — auth, dashboard,
recipes, calculateur, scan, label éditeur, academy, explore hub,
erreur réseau). Réconciliation entre 3 sources de vérité visuelle
qui dérivaient (charte officielle, palette JSON, deck Canva).

- **VitePress custom.css** : palette refondue. Primary brun cuivre
  `#A06A3A` au lieu du faux `#FFD600` jaune citron. Hero name color
  noir. Hero background = vrai pattern `Yellow_Background.png` (asset
  réutilisé depuis `packages/mobile-app/assets/`) avec gradient doré
  `#F4BD3F`. Tip color = olive `#7D8C3A` (couleur du nav actif et des
  cartes résultats du calculateur).
- **design-charter.md §8** : section Color System refondue avec
  ajout du Hero Yellow `#F4BD3F` (manquant dans toutes les versions
  précédentes !), correction de l'olive Success `#6B6B2C` → `#7D8C3A`
  pour matcher l'app réelle, ajout d'une section "Watermark Layer"
  documentant l'asset `Yellow_Background.png`, ajout d'une section
  "Mascot Signature" actant que la mascotte chef-bière reste telle
  quelle sur tous les supports, note de réconciliation avec
  `colors.json` (à aligner dans une PR séparée).
- **canva-brand-kit.md (NEW)** : nouveau document `docs/design/`
  qui spécifie le Brand Kit Canva à importer (8 couleurs, 2 polices,
  3 logos), un guide d'application slide par slide S0 à S14, les
  règles générales (spacing, hiérarchie, contraste, watermark
  policy), le workflow de production en équipe, la checklist J-7/J-3
  /J-1, et une section "automation MCP" pour usage futur quand le
  serveur Canva MCP sera reconnecté.

**Hors scope cette session** :

- Site vitrine `packages/website/` — alignement à faire dans une PR
  dédiée.
- App mobile `packages/mobile-app/src/core/theme/` — la palette V0
  observée vient déjà de cette source, juste à valider les tokens.
- Refonte logo / mascotte — explicitement non, on garde l'existant.
- Optimisation `Yellow_Background.png` (1.9 MB → idéalement < 300 KB
  pour le web) — à programmer dans une issue séparée.

## 2026.04.23-6

**Audit Bloc 5 — Références et historique + clôture audit global**

- history-overview : ajout d'un encart info en tête expliquant que les
  debriefs sont des snapshots datés non maintenus rétrospectivement.
  Les références à des issues abandonnées ou à des formats remplacés
  dans les debriefs reflètent la réalité historique. Pointe vers la
  checklist de statut comme source de vérité courante.
- Références / grille / coach summary / 3 debriefs (04-15, 04-16,
  04-19) : **aucune modification** — documents historiques (debriefs)
  ou de référence (grille, résumé coach), conservés tels quels.

**Clôture de la relecture complète (audit Option B)**

Blocs 1 à 5 audités, 16 findings 🟡 corrigés au total, 0 bloqueur :

- Bloc 1 → v2026.04.23-2 : vote dates, parcours de lecture
- Bloc 2 → v2026.04.23-3 : plan (3 items) + risk-analysis (2 items) +
  deadline vote repoussée à lundi 2026-05-04 23h59
- Bloc 3 → v2026.04.23-4 : dates canva-working-deck, ratio prix S4,
  mapping table, T2 "huit → cinq minutes"
- Bloc 4 → v2026.04.23-5 : storyboard archivé, BMC/SMART refs fictives
- Bloc 5 → v2026.04.23-6 : note historique sur history-overview

**Non audités dans cette passe** : les 6 scripts blocs
(pitch-script-bloc1 à bloc6) — passe ciblée sur chiffres + durées à
programmer séparément. Items P1 content reportés (chiffre "10M",
overlay S10, formulations bloc 5) aux sessions avec collaborateurs.

## 2026.04.23-5

**Audit Bloc 4 — Ouverture et support**

- pitch-hook-saynete-storyboard : warning box "archivé — V1 complète"
  plus visible ; pré-requis produit marqués "❌ coupé par Path B" pour
  boutique et ratio prix ; item "à construire" barré dans
  la liste "ce qu'il reste à faire".
- business-model-canvas : remplacement des 2 références à l'issue
  fictive #524 par la catégorie réelle "Production (30 pts)" de la
  grille Pitch Entrepreneurial.
- smart-objectives-par-pole : ajout d'un encart warning en haut du
  document qui explique que les 36 annotations `#52X-pts` sont un
  mapping historique (avant récupération de la grille réelle le
  2026-04-21) avec table de correspondance vers les 4 catégories
  réelles. Pas de réécriture ligne par ligne — 1 note globale suffit.

## 2026.04.23-4

**Audit Bloc 3 — Slides et narration**

- canva-working-deck : alignement de toutes les dates de vote sur la
  nouvelle deadline lundi 2026-05-04 (matérialisation mardi 2026-05-05),
  cohérent avec la home et read-first.
- slide-deck-outline : retrait du bullet "Ratio prix 2,10€/L vs 6€/L"
  dans S4 (résidu pré-Path B), remplacé par la punchline P2 « Tu
  commences quand ? » qui correspond à la saynète V1-cut réelle.
- slide-deck-outline : mapping table refondu sur les 4 catégories
  réelles de la grille Pitch Entrepreneurial (Pitch / Production /
  Perspective / Qualité orale + coup de cœur), au lieu des références
  fictives #522-#527.
- slide-deck-outline : workflow de production daté du 2026-04-19 marqué
  "partiellement dépassé" avec un encart pointant vers la checklist de
  statut comme source de vérité courante. D+15 réaligné sur la deadline
  vote 2026-05-04, D+17 ajouté pour l'oral blanc 2026-05-06.
- pitch-transitions : T2 "Pendant huit minutes" corrigé en "Pendant
  cinq minutes" (le bloc 3 a été comprimé à 5 min).

Note : les 6 scripts blocs (pitch-script-bloc1 à bloc6) **n'ont pas été
audités en profondeur** dans cette passe — passe ciblée à programmer
plus tard sur cohérence chiffres + durées.

## 2026.04.23-3

**Audit Bloc 2 — Soutenance cœur stratégique**

- Plan : retrait de la référence aux "7 critères (issues #522-#528)"
  obsolètes (mapping fictif), remplacée par les 4 catégories réelles
  de la grille Pitch Entrepreneurial (Pitch / Production / Perspective
  / Qualité orale + coup de cœur).
- Plan : script bloc 3 marqué comme "à mettre à jour pour 5 min" est
  maintenant simplement cité comme "seconde-par-seconde 5 min" (le
  script a déjà été réécrit).
- Plan : tracking oral blanc T10 pointe désormais sur issue #577
  (action concrète) avec l'épic #536 en référence.
- Risk-analysis : D8 corrigé "90 s" → "5 min" (le budget bloc 3 a
  changé depuis la rédaction initiale du risque).
- Risk-analysis : L6 corrigé "06/05" → "2026-05-06" pour cohérence.

**Deadline vote deck Canva**

- Reportée au **lundi 2026-05-04 23h59** (au lieu de dimanche 05-03)
  pour laisser un jour ouvré avant l'oral blanc du 6 mai.

## 2026.04.23-2

**Audit Bloc 1 — Entrée et prise en main**

- Home : vote deck Canva deadline reportée au **dimanche 2026-05-03
  23h59** (avant oral blanc du 6 mai) au lieu du 24 avril désormais
  obsolète.
- Read-first : parcours de lecture mis à jour pour intégrer les 3
  nouveaux sas (`/pitch-overview`, `/qa-overview`, `/risks-overview`),
  `/outputs/hosting-strategy` et `/changelog`. Retrait du lien
  `/README` redondant avec la home.
- Read-first : vote deck aligné sur la même deadline 2026-05-03.

## 2026.04.23-1

**Feature — site version + changelog**

- Affichage du numéro de version dans le footer de chaque page,
  avec lien vers cette page changelog.
- Création de cette page (`/changelog`) pour tracer les évolutions
  importantes du site.
- Ajout d'une étape "bump version + entrée changelog" dans le runbook
  de déploiement Cloudflare Pages.

**Contenu — 3 pages overview**

- Nouvelles pages `/pitch-overview`, `/qa-overview`, `/risks-overview`
  qui servent de sas d'entrée vers les documents longs correspondants.
- Backlog YD-VP-05 fermé.

**Contenu — stratégie d'hébergement backend**

- Nouveau doc `/outputs/hosting-strategy` formalisant le plan A
  (Klouders) et plan B (Fly.io) pour la démo live du 27 mai.
- Ajout d'un item P0 au chemin critique de la checklist soutenance.
- Cloudflare explicitement écarté pour l'API NestJS + SQLite.

## 2026-04-22 (pré-versioning)

- Premier déploiement sur Cloudflare Pages (`brasse-bouillon-ydays.pages.dev`)
- Mode de diffusion retenu : public non indexé, partage par lien direct
- En-têtes `X-Robots-Tag: noindex` embarqués dans le build
- Ajout page home, sidebar, read-first, feedback-guide, scripts/slides/references/history overviews
- Logo PNG, vote équipe sur le deck Canva, index nav tranché

## 2026-04-19 et avant (pré-versioning)

- Bootstrap VitePress dans `docs/ydays/`
- Rédaction des 6 scripts blocs + transitions + saynète (V0, V1, V1 cut, storyboard)
- Q&A anticipées (20 questions / 6 thèmes)
- Risk analysis (28 risques / 4 familles S D C L)
- Business Model Canvas, SMART objectives par pôle
- Pitch hook variants, saynète V1 chrono-fit sous 2:30
- Deck Canva S0-S14 détaillé + squelette 15 slides

## Comment mettre à jour ce changelog

À chaque redéploiement significatif du site :

1. Bumper le champ `version` dans [package.json](./package.json) au format `YYYY.MM.DD-N`
2. Ajouter une entrée en haut de ce fichier décrivant brièvement ce qui change
3. Rebuilder et redéployer via le runbook [cloudflare-pages-deployment](/outputs/cloudflare-pages-deployment)

Une "mise à jour significative" = ajout de page, changement de navigation, changement de script de pitch, nouveau doc pivot. Les typo et micro-corrections ne justifient pas forcément un bump.
