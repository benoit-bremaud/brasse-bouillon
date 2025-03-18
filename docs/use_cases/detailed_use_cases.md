# Use Case Diagram - Brass-Bouillon

## Introduction

Ce document décrit les cas d’utilisation principaux identifiés pour l’application Brasse-Bouillon, en se basant sur les besoins critiques (**Must-Have**) validés dans le document de priorisation et les user stories.

---

## Acteurs

### 1. Brasseur Non-Initié (Débutant)

- **Description :** Utilisateur novice cherchant à découvrir le brassage avec des outils pédagogiques.

### 2. Brasseur Initié (Amateur)

- **Description :** Utilisateur intermédiaire souhaitant gérer ses recettes et expérimenter avec de nouvelles techniques.

### 3. Brasseur Expérimenté (Avancé)

- **Description :** Utilisateur avancé utilisant des outils techniques et des analyses pour optimiser son processus.

### 4. Administrateur

- **Description :** Responsable du maintien et de la gestion du système, des utilisateurs et des données.

---

## Cas d’Utilisation (Must-Have)

### **Brasseur Non-Initié**

1. **Consulter un tutoriel interactif**  
   - **Description :** Suivre un guide étape par étape pour réaliser un premier brassin.  
   - **Étapes principales :**
     1. Sélectionner un tutoriel parmi une liste adaptée aux débutants.
     2. Suivre les instructions pas à pas avec des images ou vidéos explicatives.
     3. Valider chaque étape pour passer à la suivante.
     4. Terminer avec un récapitulatif des points importants.
   - **Lien avec User Stories :** Guidage pédagogique pour débutants.

2. **Rechercher une recette simplifiée**  
   - **Description :** Trouver des recettes adaptées aux débutants via une recherche par type de bière ou mots-clés.  
   - **Étapes principales :**
     1. Accéder à l’interface de recherche.
     2. Entrer des mots-clés ou choisir un type de bière (blonde, IPA, etc.).
     3. Afficher les résultats filtrés par pertinence.
     4. Sélectionner une recette pour voir les détails.
   - **Lien avec User Stories :** Accès simplifié aux recettes.

3. **Consulter le glossaire**  
   - **Description :** Accéder à un glossaire interactif pour comprendre les termes techniques.  
   - **Étapes principales :**
     1. Ouvrir le glossaire depuis le menu principal.
     2. Rechercher un terme ou parcourir les catégories.
     3. Afficher une définition avec des exemples ou des illustrations.
   - **Lien avec User Stories :** Documentation claire et accessible.

---

### **Brasseur Initié**

1. **Créer une recette personnalisée**  
   - **Description :** Ajouter des ingrédients et définir des étapes dans une interface intuitive.  
   - **Étapes principales :**
     1. Accéder à l’interface de création.
     2. Entrer un nom et choisir un style de bière.
     3. Ajouter les ingrédients avec des quantités ajustables.
     4. Définir les étapes du processus (temps, températures, etc.).
     5. Enregistrer la recette dans son espace personnel.
   - **Lien avec User Stories :** Gestion des recettes.

2. **Organiser ses recettes**  
   - **Description :** Stocker et classer les recettes dans un espace centralisé.  
   - **Étapes principales :**
     1. Accéder à l’espace de gestion des recettes.
     2. Classer les recettes par catégories ou étiquettes.
     3. Rechercher ou filtrer des recettes par date ou type.
     4. Modifier ou supprimer une recette existante.
   - **Lien avec User Stories :** Organisation des recettes et journaux.

3. **Partager une recette avec la communauté**  
   - **Description :** Publier ses créations pour obtenir des retours ou partager des idées.  
   - **Étapes principales :**
     1. Sélectionner une recette dans son espace personnel.
     2. Cliquer sur « Partager avec la communauté ».
     3. Ajouter une description ou des commentaires pour les autres utilisateurs.
     4. Publier et recevoir des retours ou notes.
   - **Lien avec User Stories :** Partage communautaire.

4. **Gérer les ingrédients**  
   - **Description :** Ajouter, modifier ou supprimer des ingrédients dans l’inventaire personnel.  
   - **Étapes principales :**
     1. Accéder à la section "Mes Ingrédients".
     2. Cliquer sur "Ajouter un ingrédient".
     3. Sélectionner une catégorie d’ingrédient (houblon, malt, levure, eau, additifs).
     4. Renseigner les caractéristiques spécifiques (ex. : alpha-acide pour le houblon, EBC pour le malt).
     5. Valider pour enregistrer l’ingrédient dans l’inventaire.
     6. Modifier ou supprimer un ingrédient existant si nécessaire.
   - **Lien avec User Stories :** Personnalisation de l’inventaire des ingrédients.

---

### **Brasseur Expérimenté**

1. **Gérer les stocks d’ingrédients**  
   - **Description :** Ajouter, surveiller et recevoir des alertes pour maintenir les niveaux de stocks.  
   - **Étapes principales :**
     1. Accéder à l’interface de gestion des stocks.
     2. Ajouter ou modifier un ingrédient avec des quantités disponibles.
     3. Configurer des alertes pour des seuils minimums.
     4. Recevoir des notifications en cas de besoin de réapprovisionnement.
   - **Lien avec User Stories :** Gestion des stocks avec alertes.

2. **Analyser un brassin**  
   - **Description :** Générer des rapports d’efficacité et de rendement pour optimiser les futures productions.  
   - **Étapes principales :**
     1. Sélectionner un brassin terminé dans l’historique.
     2. Afficher les données collectées (rendement, densité, etc.).
     3. Comparer les résultats avec les objectifs prévus.
     4. Exporter ou sauvegarder le rapport d’analyse.
   - **Lien avec User Stories :** Analyse des brassins.

3. **Optimiser l'utilisation des ingrédients**  
   - **Description :** Surveiller l’utilisation des ingrédients dans les recettes et suggérer des alternatives.  
   - **Étapes principales :**
     1. Accéder au tableau de bord des ingrédients utilisés.
     2. Sélectionner un ingrédient pour voir son historique d’utilisation dans les recettes.
     3. Comparer les stocks disponibles avec les quantités consommées.
     4. Recevoir des suggestions d’ingrédients alternatifs en cas de rupture.
     5. Ajuster les paramètres d’alerte pour les stocks d’ingrédients critiques.
   - **Lien avec User Stories :** Optimisation des ressources et gestion intelligente des ingrédients.

---

### **Administrateur**

1. **Ajouter ou modifier une recette publique**  
   - **Description :** Maintenir une base de données de recettes accessibles à tous.  
   - **Étapes principales :**
     1. Accéder à l’interface d’administration des recettes.
     2. Ajouter une nouvelle recette ou modifier une recette existante.
     3. Vérifier et valider les informations avant publication.
   - **Lien avec User Stories :** Création et modification des recettes publiques.

2. **Gérer les utilisateurs**  
   - **Description :** Ajouter, modifier ou supprimer des comptes utilisateurs en cas de besoin.  
   - **Étapes principales :**
     1. Accéder à l’interface d’administration des utilisateurs.
     2. Rechercher un utilisateur par nom ou email.
     3. Modifier les informations ou les droits associés à un compte.
     4. Supprimer un compte si nécessaire.
   - **Lien avec User Stories :** Gestion des utilisateurs.

---
