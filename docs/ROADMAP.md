# Brasse-Bouillon – Feuille de Route Stratégique

*Version : 1.1 – Dernière mise à jour : 17 février 2026*

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

## Historique récent retenu pour la roadmap publique

Source : PR fusionnées sur `main` des dépôts frontend/backend, filtrées selon leur pertinence produit/communication.

### Frontend (sélection)

* Refonte de l’écran **Académie brassicole** + fiches thématiques (Fermentescibles, Couleur, Houblons)
* Amélioration du détail recette (view model enrichi)
* Correctifs navigation catégories ingrédients et libellés EN
* Calculateur de brassage v1 (IBU/ABV/conversions)
* Renforcement de la timeline des brassins sur petits écrans

### Backend (sélection)

* Module brassins : workflow, service, persistance et endpoints API
* API de fermentation et rappels
* Persistance et édition des étapes de recette
* Durcissement sécurité (JWT, tests d’intégration auth, remédiations audit)

### Non retenu en communication publique (exemples)

* PR purement CI/CD, workflow, gouvernance interne, maintenance sans impact visible utilisateur.

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
| 1.1     | 17/02/2026 | Mise à jour roadmap selon PR frontend/backend fusionnées sur main |
| 1.0     | 16/05/2025 | Version initiale du document |

---

## Source

Ce document est une version markdown dérivée du Canvas “Roadmap App Mobile + Communication”.
