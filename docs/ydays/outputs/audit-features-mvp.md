# Audit features MVP — Brasse-Bouillon

**Date de l'audit** : 2026-04-16
**Méthode** : inspection factuelle du code sur `main`, comptage tests unitaires,
traçage des fichiers clés de chaque feature.
**Objet** : arbitrer quelles features inclure dans la démo live de la soutenance
du 27 mai 2026, sélectionner un parcours démo 5 min sans risque.

## Légende

- ✅ **Stable** — CRUD complet, tests présents, démontrable sans risque
- 🟡 **Partielle** — fonctionnelle sur un sous-périmètre, à démontrer en
  read-only ou avec précautions
- 🔴 **Non démontrable** — pas assez mûre ou cassée

## Tableau — 11 features

| # | Feature | Statut | Fichiers clés | Tests | Démo stable ? | Recommandation |
|---|---------|--------|---------------|-------|---------------|----------------|
| 1 | Auth (signup / login / JWT) | ✅ | `packages/api/src/auth/`, `packages/mobile-app/src/features/auth/` | API : 2 specs · Mobile : 2 tests | Oui | **INCLURE** |
| 2 | Recettes (CRUD) | 🟡 | `packages/api/src/recipe/`, `packages/mobile-app/src/features/recipes/` | API : 5 specs · Mobile : 2 tests | List/Detail OK ; Create/Edit TODO côté mobile | INCLURE en read-only |
| 3 | Batches (CRUD + mesures) | 🟡 | `packages/api/src/batch/`, `packages/mobile-app/src/features/batches/` | API : 3 specs · Mobile : 2 tests | Timeline OK ; formulaires de mesures à finir | INCLURE en view-only |
| 4 | Calculateurs brassicoles (ABV, IBU, densité) | ✅ | `packages/mobile-app/src/features/tools/presentation/`, catalogs embarqués | Mobile : 11 tests | Oui, zéro dépendance externe | **INCLURE (star)** |
| 5 | Ingredients (malts, hops, yeasts, water) | ✅ | `packages/beer-encyclopedia/api/`, `packages/mobile-app/src/features/ingredients/` | API : 14 routes v0.4.0 · Mobile : 4 tests | Oui (PostgreSQL backed) | INCLURE |
| 6 | Labels (étiquettes personnalisées) | ✅ | `packages/api/src/label/`, `packages/mobile-app/src/features/labels/` | API : 1 spec · Mobile : 4 tests | Oui | INCLURE |
| 7 | Matériel (equipment tracking) | ✅ | `packages/api/src/equipment/`, `packages/mobile-app/src/features/equipment/` | API : 3 specs · Mobile : 0 test | CRUD fonctionnel ; aucun test E2E mobile | INCLURE (bas risque) |
| 8 | Boutique (shop) | 🟡 | `packages/mobile-app/src/features/shop/presentation/` | Mobile : 2 tests | Scaffolding UI seulement ; pas d'intégration backend | **EXCLURE** |
| 9 | Academy (tutorials / content) | ✅ | `packages/mobile-app/src/features/tools/presentation/Academy*` | Mobile : 1 test | Oui, données locales | INCLURE |
| 10 | Scanner code-barre (mobile) | ✅ | `packages/mobile-app/src/features/scan/`, `packages/api/src/scan/` | API : 4 specs · Mobile : 3 tests | Oui, fallback photo | **INCLURE (centrepiece)** |
| 11 | `beer-label-ai` (YOLOv8 + OCR) | 🟡 R&D | `packages/beer-encyclopedia/ml/`, endpoint `/scan` | Python : 8 pytest · API E2E : 5 tests | Pipeline ML fonctionne, précision non prouvée sur étiquettes réelles | **Slide uniquement** (R&D en Perspectives) |

## Verdict

- **8 features stables sur 11** — parcours démo sans risque possible.
- **2 features partielles** dont on peut tirer parti en read-only : Recettes
  et Batches.
- **1 feature à exclure** (Boutique, pas de backend).
- **1 feature R&D** à présenter en slide seulement (`beer-label-ai`).

## Parcours démo recommandé — 5 minutes

| # | Temps | Étape | Objectif |
|---|-------|-------|----------|
| 1 | 0:00 → 0:30 (30 s) | Connexion (Auth) | Entrer dans l'appli avec un compte démo, valider le JWT |
| 2 | 0:30 → 1:30 (1 min) | Liste recettes + détail | Parcourir le catalogue recettes, ouvrir une recette et montrer ingrédients + calculs dérivés |
| 3 | 1:30 → 3:00 (1 min 30) | Scanner code-barre | Scanner une bière réelle → fiche produit (fallback photo prêt si le scan échoue) |
| 4 | 3:00 → 3:45 (45 s) | Calculateur ABV | Saisir densité initiale + finale, voir le calcul live (déterministe, zéro latence) |
| 5 | 3:45 → 4:00 (15 s) | Timeline Batch | Montrer visuellement un brassin en cours sur la timeline |
| — | 4:00 → 5:00 | Marge | Conclusion démo + transition vers Q&A |

**Fallbacks** :
- Scanner code-barre → mode photo (intégré dans la feature).
- `beer-label-ai` → slide "R&D en cours" + schéma pipeline, pas de live.

## Pré-production démo

- **J-7 (2026-05-20)** : préparer le jeu de données démo (3-5 recettes, 1
  style connu, 1 brassin sur la timeline). Seeder dans l'env staging.
- **J-3 (2026-05-24)** : répétition end-to-end sur staging, chronométrage
  précis, test des fallbacks.
- **J-1 (2026-05-26)** : répétition finale en conditions (réseau venue,
  matériel présentation, écran miroir).

## Sources

- Inventaire de code produit par agent Explore le 2026-04-16, croisé avec
  [PROJECT_LOG.md](../../../PROJECT_LOG.md) et
  [docs/product-backlog/product-backlog.md](../../product-backlog/product-backlog.md).
- Les compteurs de tests correspondent à la branche `main` au 2026-04-16.
