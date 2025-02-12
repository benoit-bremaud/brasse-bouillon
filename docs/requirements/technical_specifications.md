# 📌 Cahier des Charges - Brasse-Bouillon

## 1️⃣ Présentation Générale du Projet

### 🎯 Objectif

Ce document vise à formaliser les exigences et les spécifications du projet **Brasse-Bouillon**. Il définit les objectifs stratégiques, les fonctionnalités essentielles et les contraintes techniques liées à la conception et au développement de l’application mobile.

### 📌 Contexte et Problématique

Le brassage amateur est en pleine expansion, porté par une communauté dynamique souhaitant améliorer leurs techniques et optimiser leurs recettes. Cependant, plusieurs défis subsistent :

- **Manque d’outils centralisés** pour la gestion des recettes et sessions de brassage.
- **Difficulté de suivi des paramètres techniques** comme l’IBU (International Bitterness Unit) et l’ABV (Alcohol by Volume).
- **Absence d’une plateforme collaborative** permettant aux utilisateurs de partager leurs expériences et d’obtenir des retours pertinents.

L’application **Brasse-Bouillon** vise à répondre à ces problématiques en offrant un environnement structuré et efficace pour les brasseurs amateurs et professionnels.

### 📌 Nom du Projet

- **Brasse-Bouillon** – Application mobile de gestion avancée du brassage amateur.

### 📌 Objectifs du Projet

L’application a pour but de faciliter la gestion des recettes et des sessions de brassage tout en optimisant les processus de production.

Objectifs spécifiques :

- **Gestion des recettes** : Enregistrement, modification et organisation avancée des recettes.
- **Automatisation des calculs techniques** : Estimation précise des paramètres clés (IBU, ABV, etc.).
- **Suivi détaillé des sessions** : Journal interactif pour optimiser les résultats des brassages.
- **Plateforme collaborative** : Espace d’échange et d’amélioration continue via la communauté.
- **Ergonomie et accessibilité** : Interface fluide et intuitive pour une adoption rapide.

📂 **Sources** : `docs/vision/vision.md`, `docs/personas/user_personas.md`

---

## 2️⃣ Public Cible et Personas

### 🎯 Utilisateurs cibles

L’application **Brasse-Bouillon** s’adresse à différents profils de brasseurs :

- **Brasseur amateur débutant** :
  - Besoin d’un accompagnement interactif et pédagogique.
  - Interface intuitive avec guides et conseils.
  - Accès à des recettes préconfigurées.

- **Brasseur confirmé** :
  - Recherche de fonctionnalités avancées pour l’expérimentation.
  - Analyse approfondie et statistiques détaillées.
  - Interaction avec la communauté et partage d’expériences.

- **Professionnel ou micro-brasseur** :
  - Gestion avancée incluant la traçabilité et le suivi qualité.
  - Intégration avec des équipements connectés et capteurs de mesure.
  - Génération de rapports d’analyse et d’optimisation.

📂 **Sources** : `docs/vision/personas/amateur_persona.md`, `docs/vision/personas/novice_persona.md`, `docs/vision/personas/professionnel_persona.md`

---

## 3️⃣ Fonctionnalités de l’Application

### 🔹 Fonctionnalités principales (Must-have)

L’application inclut les fonctionnalités essentielles suivantes :

- **Gestion des recettes (CRUD)** :
  - Création, modification et partage des recettes.
  - Enregistrement détaillé des ingrédients et instructions.
  - Classement par catégories avec historique des modifications.

- **Calcul automatique des paramètres (IBU, ABV, etc.)** :
  - Algorithmes avancés d’estimation des paramètres techniques.
  - Ajustement automatique basé sur les ingrédients et quantités.
  - Visualisation des résultats sous forme graphique.

- **Planification et suivi des sessions** :
  - Agenda interactif pour l’organisation des brassages.
  - Alertes et rappels pour assurer la réussite des sessions.
  - Historique et analyse pour optimisation continue.

---

## 4️⃣ Cas d'Utilisation et Interactions Utilisateur

### 📌 Diagrammes et scénarios

- **Diagramme des cas d'utilisation**
- **Exemples de scénarios utilisateurs** :
  - **Création d’une recette de bière** : Un utilisateur enregistre une nouvelle recette avec les ingrédients, les étapes et les paramètres techniques nécessaires.
  - **Suivi d’une session de brassage** : L’utilisateur suit en temps réel l’évolution de sa session, reçoit des alertes aux étapes clés et enregistre ses observations.
  - **Partage d’une recette** : L’utilisateur publie une recette dans la communauté, où d’autres membres peuvent la commenter et suggérer des améliorations.

📂 **Sources** : `docs/use_cases/detailed_use_cases.md`

---

## 8️⃣ Documentation API et Gestion des Endpoints

### 📌 Structuration de l’API

L’API REST assure la communication entre le frontend et le backend.

- **Endpoints principaux** :
  - `GET /recipes` : Récupérer la liste des recettes.
  - `POST /recipes` : Ajouter une nouvelle recette.
  - `PUT /recipes/{id}` : Modifier une recette existante.
  - `DELETE /recipes/{id}` : Supprimer une recette.
  - `GET /sessions` : Récupérer les sessions de brassage.
  - `POST /sessions` : Enregistrer une nouvelle session.
  - `GET /users/{id}` : Récupérer le profil utilisateur.

- **Authentification et sécurité** :
  - Utilisation de **JWT** pour l’authentification des utilisateurs.
  - Chiffrement des données sensibles via **HTTPS**.

📂 **Sources** : `docs/api/api_documentation.md`, `docs/api/swagger.json`

---

## 9️⃣ Plan de Maintenance et Évolutivité

### 📌 Maintenance et suivi

- **Surveillance des performances** : Monitoring en temps réel pour détecter les anomalies.
- **Gestion des mises à jour** : Déploiement régulier d’améliorations et corrections de bugs.
- **Sauvegardes et restauration** : Implémentation de sauvegardes automatiques pour éviter la perte de données.

### 📌 Stratégie d’évolutivité

- **Scalabilité** : Architecture flexible pour supporter une augmentation du nombre d’utilisateurs.
- **Support des nouvelles fonctionnalités** : Ajout progressif de nouvelles options en fonction des retours utilisateurs.

📂 **Sources** : `docs/requirements/non_functional_requirements.md`

