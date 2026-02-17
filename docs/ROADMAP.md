# Brasse-Bouillon – Feuille de Route Stratégique

*Version : 1.2 – Dernière mise à jour : 17 février 2026*

---

## Objectif

Ce document décrit les grandes étapes du développement de l’application mobile **Brasse-Bouillon**, en structurant les objectifs techniques, les axes de communication et les livrables finaux. Il suit une progression logique en **10 phases distinctes**, accompagnée d’une stratégie de publication régulière destinée à informer et mobiliser la communauté.

---

## Phases du projet

### Phase 1 — Idéation et positionnement

* Définition du MVP
* Élaboration d’un questionnaire utilisateur
* Rédaction du manifeste fondateur

### Phase 2 — Analyse des canaux de communication

* Étude des réseaux sociaux et identification des cibles
* Définition d’une ligne éditoriale adaptée à chaque canal
* Partage public des résultats d’analyse

### Phase 3 — Conception et préparation

* Réalisation des maquettes UI/UX
* Définition de l’architecture technique
* Production d’une feuille de route visuelle

### Phase 4 — Développement du MVP

**Statut : terminé**

* Authentification/JWT et base API sécurisée
* CRUD recettes + persistance des étapes de brassage
* Module brassins (workflow, persistance et endpoints API)
* Calculateur de brassage v1 (IBU/ABV/conversions)

### Phase 5 — Mise en ligne du site vitrine

**Statut : en cours (consolidation produit + visibilité publique)**

* Publication du site : [brasse-bouillon.com](https://brasse-bouillon.com)
* Intégration d’une feuille de route interactive FR/EN
* Synchronisation du journal de développement avec les livraisons produit
* Mise en place d’une FAQ et d’une recette en vedette
* Intégration des avancées backend/frontend récentes (rappels de fermentation, navigation ingrédients, Académie brassicole)

### Phase 6 — Tests bêta et animation communautaire

* Lancement public de la bêta via TestFlight / Play Store
* Collecte et analyse des retours utilisateurs
* Création d’un espace communautaire (ex. : Discord)

### Phase 7 — Lancement officiel

* Déploiement sur App Store et Play Store
* Diffusion de témoignages utilisateurs et démo publique
* Communication de lancement multi-canal

### Phase 8 — Documentation et écosystème

* Création de fiches de brassage
* Constitution d’un glossaire collaboratif
* Mise en place d’un espace d’échange autour des recettes

### Phase 9 — Améliorations et ouverture

* Optimisations UX continues
* Intégration de modules complémentaires : statistiques, export, PDF
* Publication d’une API ouverte et dépôt collaboratif de recettes

### Phase 10 — Partenariats et évaluation d’impact

* Collaboration avec des microbrasseries et associations
* Distribution du kit Studio B22
* Mise en place d’indicateurs open source pour évaluer l’impact

---

## ✅ Actions réalisées (Done) — Historique traçable

Source : PR fusionnées sur `main` des dépôts frontend/backend + PR website de synchronisation.

| Date       | Domaine  | Action réalisée (synthèse) | Références |
| ---------- | -------- | -------------------------- | ---------- |
| 2026-02-17 | Website  | Synchronisation roadmap FR/EN + documentation avec les merges frontend/backend | [website PR #58](https://github.com/benoit-bremaud/brasse-bouillon-website/pull/58), [commit 66c169c](https://github.com/benoit-bremaud/brasse-bouillon-website/commit/66c169c34463b9495af60de8b2922c30223ea6e9) |
| 2026-02-13 | Frontend | Refonte de l’Académie brassicole (hub + fiches Fermentescibles/Couleur/Houblons) | [frontend PR #19](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/19), [#20](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/20), [#21](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/21), [#22](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/22) |
| 2026-02-12 | Frontend | Détail recette enrichi + correction navigation catégories ingrédients et libellés EN | [frontend PR #18](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/18), [#17](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/17) |
| 2026-02-11 | Frontend | Calculateur de brassage v1 (IBU/ABV/conversions) | [frontend PR #16](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/16) |
| 2026-02-10 | Frontend | Renforcement de la timeline des brassins sur petits écrans | [frontend PR #12](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/12) |
| 2026-02-06 | Backend  | Module brassins : workflow, service, persistance et endpoints API | [backend PR #17](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/17), [#19](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/19), [#21](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/21), [#23](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/23) |
| 2026-02-06 | Backend  | API rappels de fermentation | [backend PR #24](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/24) |
| 2026-02-11 | Backend  | Durcissement sécurité (audit dépendances, auth/JWT, tests d’intégration) | [backend PR #27](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/27), [#28](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/28), [#29](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/29), [#9](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/9) |

### Notes de filtrage éditorial

Les éléments purement CI/CD, workflow, gouvernance interne, ou maintenance sans impact visible utilisateur ne sont pas détaillés dans le tableau ci-dessus.

---

## Fréquence de publication recommandée

| Fréquence    | Type de contenu                              |
| ------------ | -------------------------------------------- |
| Hebdomadaire | Dev log, fonctionnalités en cours, maquettes |
| Bi-mensuelle | Validation de jalons clés                    |
| Mensuelle    | Bilan global et perspectives à venir         |

---

## Livrables finaux attendus

* Application mobile (iOS & Android)
* Site vitrine public
* Documentation technique et journal de développement
* Tableau de bord d’indicateurs ouverts (KPI)
* Kit de présentation à destination des partenaires

---

## Historique des versions

| Version | Date       | Modifications                |
| ------- | ---------- | ---------------------------- |
| 1.2     | 17/02/2026 | Ajout d’une section Done traçable avec références PR/commit |
| 1.1     | 17/02/2026 | Mise à jour roadmap selon PR frontend/backend fusionnées sur main |
| 1.0     | 16/05/2025 | Version initiale du document |

---

## Source

Ce document est une version markdown dérivée du Canvas “Roadmap App Mobile + Communication”.
