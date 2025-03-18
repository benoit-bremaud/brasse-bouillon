# 📌 Exigences Fonctionnelles - Brasse-Bouillon

## 1️⃣ Introduction

Ce document détaille les **exigences fonctionnelles** de l'application **Brasse-Bouillon**, définissant les fonctionnalités clés nécessaires pour répondre aux besoins des utilisateurs identifiés.

## 2️⃣ Objectifs du Document

- Garantir une **vision claire et précise** des fonctionnalités requises.
- Assurer l'alignement des développements avec les **besoins des utilisateurs**.
- Servir de **référence** pour l'équipe technique et les parties prenantes.

---

## 3️⃣ Exigences Fonctionnelles

### 🔹 3.1 Gestion des Recettes et des Ingrédients (CRUD)

#### 📌 Description

Les utilisateurs doivent pouvoir **créer, consulter, modifier et supprimer** leurs recettes de brassage, ainsi que gérer leurs ingrédients.

#### ✅ Critères d'acceptation

- L'utilisateur peut **ajouter, modifier, supprimer et consulter** un ingrédient selon sa catégorie.
- L'application garantit que les quantités saisies sont valides et respectent les unités correspondantes.
- Les relations entre les ingrédients et les recettes sont correctement gérées pour éviter les suppressions invalides.

- Un utilisateur peut **ajouter une recette** avec un titre, une description, des ingrédients et des instructions.
- L'application permet de **modifier** et **supprimer** une recette existante.
- Les recettes peuvent être **classées par catégories** et affichées sous forme de liste.
- Une recherche et des **filtres avancés** doivent être disponibles.
- Les ingrédients doivent être **stockés dans des tables distinctes** selon leur catégorie :
  - **Houblons (hops)** : Nom, alpha-acide, type (amérisant, aromatique), quantité, unité.
  - **Malts (malts)** : Nom, EBC, type (base, spécial, caramélisé, torréfié), quantité, unité.
  - **Levures (yeasts)** : Nom, souche, température optimale, atténuation, floculation.
  - **Eaux (waters)** : Nom, dureté, pH, minéraux.
  - **Additifs (additives)** : Nom, type, dosage recommandé.

### 🔹 3.1.1 Gestion des Ingrédients Individuels

#### 📌 Fonctionnalités principales

L'application doit permettre aux utilisateurs de gérer les ingrédients par **catégorie distincte** dans la base de données.

#### ✅ Opérations CRUD

##### a) Création d’un nouvel ingrédient

L'utilisateur doit pouvoir ajouter un ingrédient avec les informations spécifiques à sa catégorie :

- **Houblon** : Nom, alpha-acide (%), type, quantité (g), unité.
- **Malt** : Nom, EBC, type, quantité (kg), unité.
- **Levure** : Nom, souche, température de fermentation (°C), atténuation (%), floculation.
- **Eau** : Nom, dureté, pH, minéraux (Ca, Mg, Na, Cl, SO4).
- **Additifs** : Nom, type (épices, fruits, autres), dosage recommandé.

##### b) Lecture des ingrédients

- L'utilisateur doit pouvoir afficher la liste de tous les ingrédients de chaque catégorie.
- Filtrage possible par type d’ingrédient.
- Consultation des détails d’un ingrédient spécifique.

##### c) Modification d’un ingrédient

- L'utilisateur doit pouvoir modifier les informations d’un ingrédient existant.
- La modification doit être possible uniquement si l’ingrédient n’est pas utilisé dans une recette active.

##### d) Suppression d’un ingrédient

- L'utilisateur doit pouvoir supprimer un ingrédient uniquement s’il n’est pas utilisé dans une recette active.
- Si l’ingrédient est utilisé dans des recettes archivées, un message d’avertissement doit être affiché.

#### ✅ Contraintes et Validation

- **Données obligatoires** : Chaque ingrédient doit contenir les informations spécifiques à sa catégorie.
- **Format des données** :
  - Les valeurs numériques (alpha-acide, EBC, pH) doivent respecter des plages définies.
  - Les unités doivent être cohérentes avec le type d’ingrédient (ex. : g, kg, L, %).

#### ⚠️ Scénarios d’exception

- Un utilisateur tente d'ajouter un ingrédient sans renseigner un champ obligatoire (ex. : EBC pour un malt).
- Suppression d'un ingrédient utilisé dans des recettes actives → Message d'erreur bloquant.
- Modification d’un ingrédient utilisé dans des recettes archivées → Autorisé mais avec avertissement.
- **Données obligatoires** : Chaque ingrédient doit contenir les informations spécifiques à sa catégorie.
- **Format des données** :
  - Les valeurs numériques (alpha-acide, EBC, pH) doivent respecter des plages définies.
  - Les unités doivent être cohérentes avec le type d’ingrédient (ex. : g, kg, L, %).

#### 📌 Exemples d’Utilisation

- Après validation, l’ingrédient est listé dans la catégorie correspondante et devient disponible pour l’ajout aux recettes.
- Lorsqu’un ingrédient est supprimé, une vérification est faite sur son association avec des recettes existantes.

##### Ajout d’un houblon

1. L'utilisateur se rend dans la section "Gestion des ingrédients".
2. Il clique sur "Ajouter un ingrédient".
3. Il choisit "Houblon" et renseigne :
   - Nom : Citra
   - Alpha-acide : 12%
   - Type : Aromatique
   - Quantité : 50 g
4. Il valide et l’ingrédient est ajouté à la table `hops`.

##### Modification d’une levure

1. L'utilisateur accède à la liste des levures disponibles.
2. Il sélectionne "Safale US-05" et clique sur "Modifier".
3. Il ajuste la température de fermentation.
4. Il enregistre les modifications.

##### Suppression d’un malt

1. L'utilisateur tente de supprimer "Pale Ale Malt".
2. L’application détecte que ce malt est utilisé dans 3 recettes actives.
3. Un message d’erreur empêche la suppression.
4. L’utilisateur doit modifier ou archiver les recettes avant de supprimer l’ingrédient.

---

### 🔹 3.2 Calcul Automatique des Paramètres Techniques (IBU, ABV, etc.)

#### 📌 Description

L'application doit être capable de **calculer automatiquement** les paramètres clés du brassage à partir des ingrédients et des quantités saisies.

#### ✅ Critères d'acceptation

- Intégration de **formules de calcul validées** pour l’IBU et l’ABV.
- Ajustement dynamique des paramètres en fonction des données saisies.
- Affichage des résultats sous forme **graphique et textuelle**.

#### ⚠️ Scénarios d’exception

- L’utilisateur ne renseigne pas tous les ingrédients requis pour un calcul précis.
- Une erreur survient dans l’algorithme de calcul.
- Une incohérence est détectée entre les paramètres saisis.

### 🔹 3.3 Planification et Suivi des Sessions de Brassage

#### 📌 Description

Les utilisateurs doivent pouvoir planifier leurs sessions de brassage et suivre leur progression.

#### ✅ Critères d'acceptation

- Un **agenda interactif** permet de programmer les sessions.
- L'application envoie des **alertes et rappels** aux moments clés du brassage.
- Les utilisateurs peuvent **enregistrer les étapes de la session** et y ajouter des notes.

#### ⚠️ Scénarios d’exception

- L’utilisateur tente de planifier une session à une date passée.
- Une session en cours est interrompue et ne peut pas être reprise.
- Un ingrédient nécessaire pour la session n’est pas en stock.

### 🔹 3.4 Partage Communautaire de Recettes

#### 📌 Description

Les utilisateurs doivent pouvoir **partager leurs recettes** avec la communauté et interagir avec d'autres brasseurs.

#### ✅ Critères d'acceptation

- Les utilisateurs peuvent **publier leurs recettes** dans une section communautaire.
- Un **système de notation et de commentaires** permet d’interagir avec d’autres brasseurs.
- Possibilité de **copier et adapter** une recette partagée.

#### ⚠️ Scénarios d’exception

- Une recette publiée contient des informations incomplètes ou erronées.
- L’utilisateur tente de modifier une recette après publication.
- Un commentaire signalé comme inapproprié doit être modéré.

### 🔹 3.5 Notifications Intelligentes

#### 📌 Description

Le système doit envoyer des **notifications pertinentes** aux utilisateurs pour les informer des tâches importantes liées à leur brassage.

#### ✅ Critères d'acceptation

- Rappels automatiques pour les **étapes clés des sessions**.
- Notifications de **nouveaux commentaires ou interactions** sur une recette partagée.
- Intégration avec le **calendrier personnel** des utilisateurs.

#### ⚠️ Scénarios d’exception

- Une notification critique n’est pas reçue par l’utilisateur.
- Un rappel envoyé concerne une session déjà terminée.

### 🔹 3.6 Intégration avec des Capteurs IoT

#### 📌 Description

L'application doit pouvoir se connecter à des **capteurs de mesure** pour un suivi précis des conditions de brassage.

#### ✅ Critères d'acceptation

- Connexion avec des **capteurs de température, balance, hydromètre**.
- Lecture des **données en temps réel** et affichage des relevés.
- Alerte en cas de **valeur anormale** détectée.

#### ⚠️ Scénarios d’exception

- Un capteur est hors ligne et ne transmet pas les données.
- Une mesure incohérente est détectée et fausse les résultats.

---

## 4️⃣ Contraintes et Dépendances

- **Disponibilité multi-plateforme** : L’application doit fonctionner sur iOS et Android.
- **Sécurité** : Gestion des accès et authentification via JWT.
- **Stockage et sauvegarde** : Implémentation d’un **système de sauvegarde** des données pour éviter toute perte.

📂 **Sources** : `docs/requirements/cahier_des_charges.md`, `docs/use_cases/detailed_use_cases.md`
